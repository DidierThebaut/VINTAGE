import Link from 'next/link'
import Stripe from 'stripe'
import { CheckCircle2, ShoppingBag } from 'lucide-react'

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>
}

type PaymentStatus = 'paid' | 'unconfirmed' | 'unavailable'

async function verifyPayment(sessionId: string): Promise<boolean> {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY n’est pas configurée.')
  }

  const stripe = new Stripe(stripeSecretKey)
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return session.status === 'complete' && session.payment_status === 'paid'
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id: sessionIdParam } = await searchParams
  const sessionId = typeof sessionIdParam === 'string' ? sessionIdParam : null
  let status: PaymentStatus = 'unconfirmed'

  if (sessionId && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    try {
      status = (await verifyPayment(sessionId)) ? 'paid' : 'unconfirmed'
    } catch (error) {
      console.error('Unable to verify Stripe checkout session:', error)
      status = 'unavailable'
    }
  }

  const isPaid = status === 'paid'

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-lg">
        <div
          className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
            isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
          }`}
        >
          {isPaid ? <CheckCircle2 className="h-10 w-10" /> : <ShoppingBag className="h-10 w-10" />}
        </div>
        <h1 className="text-2xl font-black text-neutral-900">
          {isPaid ? 'Paiement réussi !' : 'Paiement non confirmé'}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          {isPaid
            ? 'Merci pour ta commande. Stripe a confirmé le paiement.'
            : status === 'unavailable'
              ? 'La vérification du paiement est temporairement indisponible. Ne repasse pas commande tout de suite ; réessaie dans quelques instants.'
              : 'Stripe n’a pas confirmé le paiement. Tu peux retourner à la boutique et réessayer.'}
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
          >
            <ShoppingBag className="h-4 w-4" />
            Retourner à la boutique
          </Link>
        </div>
      </div>
    </div>
  )
}
