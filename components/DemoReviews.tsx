const reviews = [
  'Le maillot est arrivé soigneusement emballé et la description m’a aidé à choisir.',
  'Une belle sélection pour retrouver les grandes équipes qui m’ont fait aimer le football.',
  'Les détails sur la saison et la taille rendent la recherche beaucoup plus simple.',
]

export default function DemoReviews() {
  return (
    <section aria-labelledby="demo-reviews-title" className="mt-16 border-t border-neutral-200 pt-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
            Avis clients
          </p>
          <h2 id="demo-reviews-title" className="mt-2 text-2xl font-extrabold tracking-tight">
            Exemples pour la démonstration
          </h2>
        </div>
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
          Avis fictifs — ce ne sont pas de vrais témoignages clients.
        </p>
      </div>

      <ul className="grid gap-4 md:grid-cols-3">
        {reviews.map((review, index) => (
          <li key={review} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
            <blockquote className="text-sm leading-6 text-neutral-700">« {review} »</blockquote>
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-neutral-500">
              Exemple fictif {index + 1}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
