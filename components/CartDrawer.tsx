'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/useCartStore'
import { ShoppingBag, X, Trash2, ArrowRight } from 'lucide-react'

interface CheckoutResponse {
  url?: unknown
  error?: unknown
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { items, removeItem } = useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const totalCents = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0)

  const handleCheckout = async () => {
    setCheckoutError(null)
    setIsCheckingOut(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data: CheckoutResponse = await response.json()

      if (!response.ok) {
        const message = typeof data.error === 'string'
          ? data.error
          : 'Impossible de créer la session de paiement.'
        throw new Error(message)
      }

      if (typeof data.url !== 'string') {
        throw new Error('Stripe n’a pas renvoyé d’URL de paiement valide.')
      }

      window.location.assign(data.url)
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : 'Une erreur inattendue est survenue pendant le paiement.'
      )
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le panier"
        className="relative flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-800"
      >
        <ShoppingBag className="h-4 w-4" />
        <span className="hidden sm:inline">Panier</span>
        {totalItemsCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs text-white">
            {totalItemsCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="cart-drawer-title"
              className="flex w-screen max-w-md flex-col bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <h2 id="cart-drawer-title" className="text-lg font-bold">
                  Ton panier ({totalItemsCount})
                </h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer le panier"
                  className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <ShoppingBag className="mb-4 h-12 w-12 text-neutral-300" />
                    <p className="text-sm font-medium text-neutral-500">Ton panier est vide.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.size}`}
                        className="flex gap-4 rounded-2xl border border-neutral-200 p-4"
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-20 w-20 shrink-0 rounded-xl bg-neutral-100 object-cover"
                        />
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-sm font-bold text-neutral-900">{item.name}</h3>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id, item.size)}
                                aria-label={`Supprimer ${item.name} du panier`}
                                title="Supprimer du panier"
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Supprimer</span>
                              </button>
                            </div>
                            <p className="mt-0.5 text-xs text-neutral-500">Taille : {item.size}</p>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-extrabold text-neutral-900">
                              {(item.price / 100).toFixed(2)} €
                            </span>
                            <span className="text-xs font-semibold">Qté : {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-6">
                  <div className="mb-4 flex justify-between text-base font-bold text-neutral-900">
                    <span>Total</span>
                    <span>{(totalCents / 100).toFixed(2)} €</span>
                  </div>
                  {checkoutError && (
                    <p role="alert" className="mb-4 text-sm text-red-700">
                      {checkoutError}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-8 py-4 text-base font-bold text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-70"
                  >
                    <span>{isCheckingOut ? 'Redirection vers Stripe…' : 'Commander via Stripe'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </>
  )
}
