import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Product } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/server'
import AddToCartButton from '@/components/AddToCartButton'
import CartDrawer from '@/components/CartDrawer'
import { ArrowLeft, CheckCircle2, ShieldCheck, Truck } from 'lucide-react'

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(`Impossible de charger le produit : ${error.message}`)
  }

  return data
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase">
            VINTAGE<span className="text-emerald-600">.FC</span>
          </Link>
          <nav aria-label="Navigation principale" className="flex items-center gap-4 sm:gap-6">
            <Link href="/numero-10" className="text-sm font-semibold text-neutral-700 hover:text-emerald-700">
              Maillots n° 10
            </Link>
            <CartDrawer />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
              Photo d’illustration
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                {product.team}
              </span>
              <span className="text-sm font-semibold text-neutral-500">
                Saison {product.season}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-black text-neutral-900">
              {(product.price_cents / 100).toFixed(2)} €
            </p>

            <div className="mt-6 border-t border-b border-neutral-200 py-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Taille officielle</span>
                <span className="rounded-lg border border-neutral-900 px-4 py-1.5 text-sm font-bold">
                  {product.size}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">Disponibilité</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {product.stock > 0 ? `En stock (${product.stock} pièce)` : 'Rupture de stock'}
                </span>
              </div>
            </div>

            <p className="mt-6 text-base leading-relaxed text-neutral-600">
              {product.description}
            </p>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>

            <div className="mt-8 space-y-3 rounded-2xl bg-neutral-50 p-5 text-sm text-neutral-600">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>Authenticité garantie : étiquettes et coutures vérifiées.</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>Expédition suivie sous 24h dans un emballage soigné.</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                <span>Paiement 100 % sécurisé via Stripe.</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
