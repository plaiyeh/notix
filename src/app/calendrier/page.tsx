'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthBar from '@/components/AuthBar'
import DatePicker from '@/components/DatePicker'
import { fetchUserProjects, Project } from '@/lib/projects-service'
import { fetchFullProjectData, updateAssessmentDateInDb } from '@/lib/curriculum-service'

interface CalendarAssessment {
  id: string
  name: string
  weight: number
  date: string | null
  grade: number | null
  subjectName: string
  unitCode: string
  unitName: string
}

function getCountdownBadge(dateStr: string | null) {
  if (!dateStr) return { text: 'Non planifié', color: 'bg-slate-900 text-slate-500 border-slate-800' }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const examDate = new Date(dateStr + 'T00:00:00')
  examDate.setHours(0, 0, 0, 0)

  const diffTime = examDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { text: 'Passé', color: 'bg-slate-900/80 text-slate-500 border-slate-800' }
  }
  if (diffDays === 0) {
    return { text: "Aujourd'hui", color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse font-bold' }
  }
  if (diffDays === 1) {
    return { text: 'Demain', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' }
  }
  if (diffDays <= 7) {
    return { text: `Dans ${diffDays} jours`, color: 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold' }
  }
  return { text: `Dans ${diffDays} jours`, color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' }
}

export default function CalendarPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [assessments, setAssessments] = useState<CalendarAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  // Filtre par défaut sur UPCOMING pour éviter l'encombrement
  const [filterMode, setFilterMode] = useState<'UPCOMING' | 'ALL' | 'UNDATED'>('UPCOMING')

  useEffect(() => {
    async function init() {
      setLoading(true)
      const userProjects = await fetchUserProjects()
      setProjects(userProjects)
      if (userProjects.length > 0) {
        const proj = userProjects[0]
        setActiveProject(proj)
        await loadCurriculum(proj.id)
      }
      setLoading(false)
    }
    init()
  }, [])

  const loadCurriculum = async (projectId: string) => {
    const sem = await fetchFullProjectData(projectId)

    if (sem) {
      const flat: CalendarAssessment[] = []
      for (const u of sem.units) {
        for (const s of u.subjects) {
          for (const a of s.assessments) {
            flat.push({
              id: a.id,
              name: a.name,
              weight: a.weight,
              date: a.date || null,
              grade: a.grade,
              subjectName: s.name,
              unitCode: u.code,
              unitName: u.name,
            })
          }
        }
      }
      setAssessments(flat)
    } else {
      setAssessments([])
    }
  }

  const handleDateChange = async (assessmentId: string, newDate: string) => {
    const val = newDate || null
    setAssessments((prev) =>
      prev.map((item) => (item.id === assessmentId ? { ...item, date: val } : item))
    )
    setSavingId(assessmentId)
    await updateAssessmentDateInDb(assessmentId, val)
    setSavingId(null)
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const upcomingAssessments = assessments.filter((a) => a.date && a.date >= todayStr)
  const undatedAssessments = assessments.filter((a) => !a.date)

  const filteredAssessments = assessments
    .filter((a) => {
      if (filterMode === 'UPCOMING') return a.date && a.date >= todayStr
      if (filterMode === 'UNDATED') return !a.date
      return true
    })
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AuthBar />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Entête avec sélection de cursus */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>🗓️</span> Planning des examens &amp; partiels
            </h1>
            <p className="text-xs text-slate-400">
              Visualise tes échéances et comptes à rebours en temps réel.
            </p>
          </div>

          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Cursus :</span>
              <select
                value={activeProject?.id || ''}
                onChange={async (e) => {
                  const found = projects.find((p) => p.id === e.target.value)
                  if (found) {
                    setActiveProject(found)
                    await loadCurriculum(found.id)
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-white font-semibold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Filtres & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterMode('UPCOMING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'UPCOMING' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              À venir ({upcomingAssessments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'ALL' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tous ({assessments.length})
            </button>
            {undatedAssessments.length > 0 && (
              <button
                type="button"
                onClick={() => setFilterMode('UNDATED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterMode === 'UNDATED' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sans date ({undatedAssessments.length})
              </button>
            )}
          </div>

          <Link
            href="/simulateur"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            + Ajouter une épreuve dans le simulateur →
          </Link>
        </div>

        {/* Liste des épreuves */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500 font-mono">
            Chargement du planning...
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-3xl space-y-3 bg-slate-900/20">
            <span className="text-3xl block">🎉</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-200">
                {filterMode === 'UPCOMING' ? 'Aucun partiel à venir' : 'Aucune épreuve trouvée'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filterMode === 'UPCOMING'
                  ? "Toutes tes dates d'examens sont passées ou tu n'as pas encore programmé d'épreuve."
                  : 'Ajoute tes épreuves et partiels directement depuis le simulateur.'}
              </p>
            </div>
            <Link
              href="/simulateur"
              className="inline-block mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Ouvrir le simulateur
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssessments.map((item) => {
              const badge = getCountdownBadge(item.date)

              return (
                <div
                  key={item.id}
                  className="p-4 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-800 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded-md">
                        {item.unitCode}
                      </span>
                      <h3 className="font-bold text-sm text-white">
                        {item.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-mono">(coef {item.weight})</span>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{item.subjectName}</span>
                      {item.grade !== null && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            Note : {item.grade}/20
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border tracking-wide whitespace-nowrap ${badge.color}`}
                    >
                      {badge.text}
                    </span>

                    <div className="relative flex items-center">
                      <DatePicker
                        value={item.date || null}
                        onChange={(newDate) => handleDateChange(item.id, newDate)}
                        placeholder="Définir date"
                      />
                      {savingId === item.id && (
                        <span className="absolute -top-4 right-0 text-[9px] text-amber-400 font-mono">
                          Sauvegarde...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}