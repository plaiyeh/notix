import AuthBar from '@/components/AuthBar'
import Simulator from '@/components/Simulator'
import Link from 'next/link'

export default function SimulatorPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AuthBar />
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          ← Retour à l'accueil
        </Link>
      </div>
      <div className="py-6">
        <Simulator />
      </div>
    </main>
  )
}