'use client'

import { useCartStore } from '@/store/useCartStore'
import type { Product } from '@/lib/supabase'

export default function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem)

  return (
    <button
      type="button"
      onClick={() =>
        addItem({
          id: product.id,
          name: product.name,
          team: product.team,
          season: product.season,
          size: product.size,
          price: product.price_cents,
          image_url: product.image_url,
        })
      }
      disabled={product.stock <= 0}
      className="w-full rounded-xl bg-neutral-900 px-8 py-4 text-base font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      {product.stock > 0 ? 'Ajouter au panier' : 'Pièce vendue'}
    </button>
  )
}
