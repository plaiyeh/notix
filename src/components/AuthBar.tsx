'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { fetchUserProjects, Project } from '@/lib/projects-service'

export default function AuthBar() {
  const supabase = createClient()
  const pathname = usePathname()
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadSessionAndProjects() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        try {
          const userProjects = await fetchUserProjects()
          setProjects(userProjects)
        } catch (err) {
          console.error('Erreur chargement projets dans le menu:', err)
        }
      }
      setLoading(false)
    }

    loadSessionAndProjects()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        const userProjects = await fetchUserProjects()
        setProjects(userProjects)
      } else {
        setProjects([])
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Fermer le menu au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fermer le menu au changement de page
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${pathname || '/simulateur'}`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProjects([])
    setMenuOpen(false)
    router.refresh()
  }

  const navLinks = [
    { href: '/', label: 'Accueil', icon: '🏠' },
    { href: '/simulateur', label: 'Simulateur de notes', icon: '📊' },
    { href: '/calendrier', label: 'Dates des partiels', icon: '🗓️' },
    { href: '/revisions', label: 'Cockpit de révisions', icon: '🎯' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* SECTION GAUCHE : MENU DÉROULANT + LOGO */}
        <div className="flex items-center gap-3 relative" ref={menuRef}>
          {/* Bouton du Menu Déroulant */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
            aria-label="Ouvrir le menu de navigation"
          >
            <span className="text-sm">☰</span>
            <span className="hidden sm:inline">Navigation</span>
            <span className="text-[10px] text-slate-400">▼</span>
          </button>

          {/* Logo Notix cliquable */}
          <Link href="/" className="flex items-center gap-2 font-black text-white text-base tracking-tight hover:opacity-90 transition">
            <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 text-xs font-black">N</span>
            <span>Notix</span>
          </Link>

          {/* POPUP DÉROULANT */}
          {menuOpen && (
            <div className="absolute left-0 top-12 z-50 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2.5 space-y-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Liens principaux */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 py-1 block">
                  Modules Notix
                </span>
                {navLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <span className="text-base">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Bibliothèque personnelle de cursus */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between px-2.5 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Mes Cursus
                  </span>
                  <Link
                    href="/simulateur"
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    + Nouveau
                  </Link>
                </div>

                {projects.length === 0 ? (
                  <p className="text-[11px] text-slate-500 px-3 py-1.5 italic">
                    {user ? 'Aucun cursus créé.' : 'Connectez-vous pour voir vos cursus.'}
                  </p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {projects.map((proj) => (
                      <Link
                        key={proj.id}
                        href={`/simulateur?projectId=${proj.id}`}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition group"
                      >
                        <span className="truncate max-w-[180px] font-medium">{proj.name}</span>
                        <span className="text-[10px] text-slate-500 group-hover:text-sky-400">→</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* SECTION DROITE : PROFIL / GOOGLE AUTH */}
        <div className="flex items-center gap-3">
          {loading ? (
            <span className="text-xs text-slate-500 font-mono">...</span>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 font-medium hidden sm:inline truncate max-w-[150px]">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition cursor-pointer"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="flex items-center gap-2 text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 px-3.5 py-1.5 rounded-xl transition shadow-md shadow-white/5 cursor-pointer"
            >
              <span>Connexion Google</span>
            </button>
          )}
        </div>

      </div>
    </header>
  )
}