import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

interface CartItemInput {
  id: string
  quantity: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getSiteOrigin(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!configuredUrl) {
    return null
  }

  try {
    const url = new URL(configuredUrl)
    if (url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === 'localhost')) {
      return url.origin
    }
  } catch {
    return null
  }

  return null
}

function getStripeImage(imageUrl: unknown): string | undefined {
  if (typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return undefined
  }

  try {
    const url = new URL(imageUrl)
    return url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Le corps de la requête doit être un JSON valide.' }, { status: 400 })
  }

  if (!isRecord(body) || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) {
    return NextResponse.json({ error: 'Le panier est vide ou invalide.' }, { status: 400 })
  }

  const quantities = new Map<string, number>()
  for (const item of body.items) {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      item.id.trim() === '' ||
      typeof item.quantity !== 'number' ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return NextResponse.json({ error: 'Un article du panier est invalide.' }, { status: 400 })
    }

    const quantity = (quantities.get(item.id) ?? 0) + item.quantity
    if (quantity > 99) {
      return NextResponse.json({ error: 'La quantité demandée dépasse la limite autorisée.' }, { status: 400 })
    }

    quantities.set(item.id, quantity)
  }

  const cartItems: CartItemInput[] = [...quantities].map(([id, quantity]) => ({ id, quantity }))
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const siteOrigin = getSiteOrigin()

  if (!stripeSecretKey || !siteOrigin) {
    console.error('Checkout configuration is missing STRIPE_SECRET_KEY or a valid NEXT_PUBLIC_SITE_URL.')
    return NextResponse.json({ error: 'Le paiement est momentanément indisponible.' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, team, season, size, price_cents, image_url, stock')
    .in('id', cartItems.map((item) => item.id))

  if (productsError) {
    console.error('Unable to load checkout products from Supabase:', productsError)
    return NextResponse.json({ error: 'Impossible de vérifier les produits du panier.' }, { status: 500 })
  }

  const productsById = new Map((products ?? []).map((product) => [product.id, product]))
  if (cartItems.some((item) => !productsById.has(item.id))) {
    return NextResponse.json({ error: 'Un ou plusieurs produits ne sont plus disponibles.' }, { status: 400 })
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
  for (const item of cartItems) {
    const product = productsById.get(item.id)
    if (!product) {
      return NextResponse.json({ error: 'Un ou plusieurs produits ne sont plus disponibles.' }, { status: 400 })
    }

    if (item.quantity > product.stock) {
      return NextResponse.json(
        { error: `Stock insuffisant pour « ${product.name} ».` },
        { status: 409 }
      )
    }

    if (!Number.isSafeInteger(product.price_cents) || product.price_cents < 1) {
      console.error(`Product ${product.id} has an invalid price_cents value.`)
      return NextResponse.json({ error: 'Le prix d’un produit du panier est invalide.' }, { status: 500 })
    }

    const image = getStripeImage(product.image_url)
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${product.name} (${product.team} - ${product.season}) - Taille ${product.size}`,
          ...(image ? { images: [image] } : {}),
        },
        unit_amount: product.price_cents,
      },
      quantity: item.quantity,
    })
  }

  const stripe = new Stripe(stripeSecretKey)
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}/`,
    })

    if (!session.url) {
      console.error('Stripe created a checkout session without a redirect URL.')
      return NextResponse.json({ error: 'Stripe n’a pas fourni de lien de paiement.' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)
    return NextResponse.json({ error: 'Impossible de créer la session de paiement Stripe.' }, { status: 502 })
  }
}
