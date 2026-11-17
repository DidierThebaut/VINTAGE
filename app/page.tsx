import Link from 'next/link'
import CartDrawer from '@/components/CartDrawer'
import DemoReviews from '@/components/DemoReviews'
import type { Product } from '@/lib/supabase'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

type CatalogResult =
  | { kind: 'success'; products: Product[] }
  | { kind: 'error'; message: string }

async function getProducts(): Promise<CatalogResult> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, description, team, season, size, price_cents, image_url, stock, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Unable to load the product catalog from Supabase:', error)
      return { kind: 'error', message: 'Impossible de charger le catalogue depuis Supabase.' }
    }

    return { kind: 'success', products: data ?? [] }
  } catch (error) {
    console.error('Unable to connect to Supabase:', error)
    return { kind: 'error', message: 'Connexion à Supabase impossible. Vérifie ta connexion et les variables .env.local.' }
  }
}

export default async function HomePage() {
  const result = await getProducts()

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-black uppercase tracking-tighter">
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
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Maillots authentiques</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">La sélection Vintage.FC</h1>
        </div>

        {result.kind === 'error' ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {result.message}
          </p>
        ) : result.products.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            Aucun produit n’est disponible pour le moment.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.products.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                    {product.image_url ? (
                      <>
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-700">
                          Photo d’illustration
                        </span>
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        Image indisponible
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        {product.team}
                      </span>
                      <span className="text-xs text-neutral-500">Saison {product.season}</span>
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-neutral-900 group-hover:text-emerald-700">
                      {product.name}
                    </h2>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-extrabold">
                        {(product.price_cents / 100).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        })}
                      </span>
                      <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-emerald-700' : 'text-neutral-500'}`}>
                        {product.stock > 0 ? `Taille ${product.size}` : 'Rupture de stock'}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <DemoReviews />
      </main>
    </div>
  )
}
