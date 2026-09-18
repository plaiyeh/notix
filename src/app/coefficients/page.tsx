'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthBar from '@/components/AuthBar'

interface Template {
  id: string
  name: string
  mention: string
  unitsCount: number
  description: string
}

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'but-sd-1a',
    name: 'BUT Science des Données — 1ère Année',
    mention: 'IUT',
    unitsCount: 3,
    description: 'Structure officielle : UE1 Traiter, UE2 Analyser, UE3 Valoriser avec les modules R1.01 à R1.05 et SAÉ.',
  },
  {
    id: 'but-sd-2a',
    name: 'BUT Science des Données — 2ème Année',
    mention: 'IUT',
    unitsCount: 3,
    description: 'Parcours Visualisation / Data Engineering & Machine Learning.',
  },
  {
    id: 'licence-miashs',
    name: 'Licence MIASHS — L1',
    mention: 'Université',
    unitsCount: 4,
    description: 'Blocs Mathématiques, Algorithmique, Économie générale et Compétences transversales.',
  },
]

export default function CoefficientsPage() {
  const [templates] = useState<Template[]>(DEFAULT_TEMPLATES)

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AuthBar />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition mb-2 block">
              ← Retour à l'accueil
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Bibliothèque des coefficients
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Sélectionne une maquette préconfigurée ou crée une grille personnalisée pour ton cursus.
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-sky-600/20"
          >
            + Nouvelle grille
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {tpl.mention}
                  </span>
                  <span className="text-xs text-sky-400 font-semibold">{tpl.unitsCount} Blocs d'UE</span>
                </div>
                <h2 className="text-base font-bold text-white mt-2">{tpl.name}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                <Link
                  href="/simulateur"
                  className="flex-1 text-center py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
                >
                  Charger dans le simulateur
                </Link>
                <button
                  type="button"
                  className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white text-xs rounded-lg border border-slate-800 transition"
                >
                  Éditer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}