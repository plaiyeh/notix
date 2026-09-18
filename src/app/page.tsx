import Link from 'next/link'
import AuthBar from '@/components/AuthBar'

export default function Home() {
  const modules = [
    {
      title: 'Simulateur de notes',
      href: '/simulateur',
      icon: '📊',
      badge: 'Calculs & Objectifs',
      desc: 'Visualisation de tes UE, calcul en temps réel des notes requises pour valider et curseurs prédictifs.',
      color: 'from-sky-500/20 to-indigo-500/0 border-sky-500/30',
    },
    {
      title: 'Emploi du temps & Échéances',
      href: '/calendrier',
      icon: '🗓️',
      badge: 'Planning',
      desc: 'Planning de tes cours, dates clés de tes partiels et compte à rebours avant tes livrables / SAÉ.',
      color: 'from-violet-500/20 to-fuchsia-500/0 border-violet-500/30',
    },
    {
      title: 'Cockpit de révisions',
      href: '/revisions',
      icon: '🎯',
      badge: 'Méthode feux tricolores',
      desc: 'Suivi de maîtrise notion par notion, statut de préparation par examen et priorités d’étude.',
      color: 'from-emerald-500/20 to-teal-500/0 border-emerald-500/30',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/20">
      <AuthBar />

      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center space-y-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase text-sky-400 bg-sky-500/10 rounded-full border border-sky-500/20">
          Système académique universitaire
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Pilote ton parcours sans imprévu.
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Centralise tes grilles de compétences, anticipe chaque note requise et organise tes révisions efficacement.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b ${m.color} bg-slate-900/50 border hover:border-slate-600 transition-all duration-200 hover:-translate-y-1 shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                    {m.icon}
                  </span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {m.badge}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition">
                  {m.title}
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-sky-400">
                <span>Accéder à l'espace</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}