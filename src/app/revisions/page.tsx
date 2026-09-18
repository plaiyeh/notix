'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthBar from '@/components/AuthBar'
import { fetchUserProjects, Project } from '@/lib/projects-service'
import {
  fetchFullProjectData,
  fetchRevisionTopicsForSubjects,
  addRevisionTopicToDb,
  updateRevisionStatusInDb,
  deleteRevisionTopicFromDb,
  DbRevisionTopic,
} from '@/lib/curriculum-service'

const J_INTERVALS = [0, 1, 3, 7, 14, 30]

export default function RevisionsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [semesterData, setSemesterData] = useState<any>(null)
  const [topics, setTopics] = useState<DbRevisionTopic[]>([])
  const [loading, setLoading] = useState(true)

  const [revisionMode, setRevisionMode] = useState<'SIMPLE' | 'ADVANCED_J'>('SIMPLE')
  const [selectedUnitId, setSelectedUnitId] = useState<string>('ALL')

  const [newTopicTitles, setNewTopicTitles] = useState<Record<string, string>>({})
  const [newTopicJCounts, setNewTopicJCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function init() {
      setLoading(true)
      const userProjects = await fetchUserProjects()
      setProjects(userProjects)
      if (userProjects.length > 0) {
        const proj = userProjects[0]
        setActiveProject(proj)
        await loadProjectCurriculum(proj.id)
      }
      setLoading(false)
    }
    init()
  }, [])

  const loadProjectCurriculum = async (projectId: string) => {
    const sem = await fetchFullProjectData(projectId)
    setSemesterData(sem)

    if (sem && sem.units.length > 0) {
      setSelectedUnitId(sem.units[0].id)
      const allSubjectIds = sem.units.flatMap((u: any) => u.subjects.map((s: any) => s.id))
      const loadedTopics = await fetchRevisionTopicsForSubjects(allSubjectIds)
      setTopics(loadedTopics)
    } else {
      setTopics([])
    }
  }

  const handleSelectProject = async (proj: Project) => {
    setActiveProject(proj)
    setLoading(true)
    await loadProjectCurriculum(proj.id)
    setLoading(false)
  }

  const handleAddTopic = async (subjectId: string) => {
    const title = newTopicTitles[subjectId]?.trim()
    if (!title) return

    const totalJ = newTopicJCounts[subjectId] || 4
    const created = await addRevisionTopicToDb(subjectId, title, totalJ)
    if (created) {
      setTopics((prev) => [...prev, created])
      setNewTopicTitles((prev) => ({ ...prev, [subjectId]: '' }))
    }
  }

  // 1. Boutons Mode Simple : Sélection directe de la couleur
  const handleSetStatus = async (topicId: string, status: 'TODO' | 'IN_PROGRESS' | 'MASTERED') => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, status } : t))
    )
    await updateRevisionStatusInDb(topicId, status)
  }

  // 2. Boutons Méthode des J : Déduire une révision restante
  const handleCompleteOneReview = async (topic: DbRevisionTopic) => {
    const totalJ = topic.total_j ?? 4
    const completedJ = topic.completed_j ?? 0

    if (completedJ >= totalJ) return

    const nextCompleted = completedJ + 1
    const todayIso = new Date().toISOString().split('T')[0]
    const nextStatus: 'TODO' | 'IN_PROGRESS' | 'MASTERED' =
      nextCompleted >= totalJ ? 'MASTERED' : 'IN_PROGRESS'

    setTopics((prev) =>
      prev.map((t) =>
        t.id === topic.id
          ? { ...t, completed_j: nextCompleted, status: nextStatus, last_reviewed_at: todayIso }
          : t
      )
    )

    await updateRevisionStatusInDb(topic.id, nextStatus, nextCompleted, totalJ, todayIso)
  }

  const handleResetReviews = async (topic: DbRevisionTopic) => {
    const totalJ = topic.total_j ?? 4
    setTopics((prev) =>
      prev.map((t) =>
        t.id === topic.id
          ? { ...t, completed_j: 0, status: 'TODO' }
          : t
      )
    )
    await updateRevisionStatusInDb(topic.id, 'TODO', 0, totalJ, null)
  }

  const handleChangeTotalJ = async (topicId: string, newTotal: number) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, total_j: newTotal } : t))
    )
    const topic = topics.find((t) => t.id === topicId)
    if (topic) {
      await updateRevisionStatusInDb(topicId, topic.status, topic.completed_j ?? 0, newTotal)
    }
  }

  const handleDeleteTopic = async (topicId: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId))
    await deleteRevisionTopicFromDb(topicId)
  }

  const displayedUnits = semesterData
    ? selectedUnitId === 'ALL'
      ? semesterData.units
      : semesterData.units.filter((u: any) => u.id === selectedUnitId)
    : []

  const totalTopicsCount = topics.length
  const masteredCount = topics.filter((t) => t.status === 'MASTERED').length
  const progressPercent = totalTopicsCount > 0 ? Math.round((masteredCount / totalTopicsCount) * 100) : 0

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AuthBar />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Entête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>🎯</span> Cockpit de Révisions
            </h1>
            <p className="text-xs text-slate-400">
              Gère tes fiches de cours et valide tes passages de révision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {projects.length > 0 && (
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value)
                  if (found) handleSelectProject(found)
                }}
                className="bg-slate-900 border border-slate-700 text-white font-semibold text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-sky-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}

            {/* Switch de mode */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setRevisionMode('SIMPLE')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  revisionMode === 'SIMPLE'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🚦 Mode Simple (3 Couleurs)
              </button>
              <button
                type="button"
                onClick={() => setRevisionMode('ADVANCED_J')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                  revisionMode === 'ADVANCED_J'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🧠</span> Méthode des « J »
              </button>
            </div>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Progression
              </span>
              <span className="text-xs font-mono font-bold text-sky-400">
                {masteredCount} / {totalTopicsCount} chapitres maîtrisés
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {revisionMode === 'SIMPLE'
                ? 'Sélectionne la couleur directement pour chaque chapitre : Rouge, Jaune ou Vert.'
                : 'Clique sur « + 1 révision » pour déduire une révision du compte à rebours.'}
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold text-slate-300">
              <span>Maîtrise</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Onglets des UE */}
        {semesterData && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80">
            <button
              type="button"
              onClick={() => setSelectedUnitId('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedUnitId === 'ALL'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              Toutes les UE
            </button>

            {semesterData.units.map((unit: any) => {
              const isSelected = selectedUnitId === unit.id
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => setSelectedUnitId(unit.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {unit.code}
                </button>
              )
            })}
          </div>
        )}

        {/* Matières et Chapitres */}
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500 font-mono">
            Chargement...
          </div>
        ) : !semesterData || displayedUnits.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-3xl space-y-3 bg-slate-900/20">
            <span className="text-3xl block">📚</span>
            <h3 className="text-sm font-bold text-slate-200">Aucune matière trouvée</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Configure ton cursus dans le simulateur avant de définir tes fiches de révisions.
            </p>
            <Link
              href="/simulateur"
              className="inline-block mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Aller au simulateur
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedUnits.map((unit: any) => (
              <div key={unit.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2 py-0.5 rounded-md">
                    {unit.code}
                  </span>
                  <h2 className="text-base font-bold text-white">{unit.name}</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {unit.subjects.map((sub: any) => {
                    const subjectTopics = topics.filter((t) => t.user_subject_id === sub.id)

                    return (
                      <div
                        key={sub.id}
                        className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                          <h3 className="text-xs sm:text-sm font-bold text-slate-200">
                            {sub.name}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-500">
                            {subjectTopics.filter((t) => t.status === 'MASTERED').length} / {subjectTopics.length} maîtrisé(s)
                          </span>
                        </div>

                        {/* Liste des chapitres */}
                        <div className="space-y-2.5">
                          {subjectTopics.length === 0 ? (
                            <p className="text-[11px] text-slate-500 italic py-2">
                              Aucun chapitre ou fiche pour le moment.
                            </p>
                          ) : (
                            subjectTopics.map((topic) => {
                              const totalJ = topic.total_j ?? 4
                              const completedJ = topic.completed_j ?? 0
                              const remainingReviews = Math.max(0, totalJ - completedJ)
                              const isFinished = remainingReviews === 0

                              return (
                                <div
                                  key={topic.id}
                                  className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                                >
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">📄</span>
                                      <span className="text-xs font-semibold text-slate-200 truncate">
                                        {topic.title}
                                      </span>
                                    </div>
                                    {topic.last_reviewed_at && (
                                      <p className="text-[10px] text-slate-500 font-mono">
                                        Dernière session : {topic.last_reviewed_at}
                                      </p>
                                    )}
                                  </div>

                                  {/* BOUTONS D'ACTION */}
                                  <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
                                    {revisionMode === 'SIMPLE' ? (
                                      /* MODE SIMPLE : 3 BOUTONS DIRECTS */
                                      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                                        <button
                                          type="button"
                                          onClick={() => handleSetStatus(topic.id, 'TODO')}
                                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 border ${
                                            topic.status === 'TODO'
                                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                                          }`}
                                        >
                                          🔴 À revoir
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleSetStatus(topic.id, 'IN_PROGRESS')}
                                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 border ${
                                            topic.status === 'IN_PROGRESS'
                                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                                          }`}
                                        >
                                          🟡 En cours
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleSetStatus(topic.id, 'MASTERED')}
                                          className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 border ${
                                            topic.status === 'MASTERED'
                                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                              : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                                          }`}
                                        >
                                          🟢 Maîtrisé
                                        </button>
                                      </div>
                                    ) : (
                                      /* MODE AVANCÉ : COMPTEUR + BOUTON DÉDUIRE RÉVISION */
                                      <div className="flex items-center gap-2">
                                        {/* Choix du total souhaité */}
                                        <select
                                          value={totalJ}
                                          onChange={(e) => handleChangeTotalJ(topic.id, parseInt(e.target.value, 10))}
                                          className="bg-slate-900 border border-slate-800 text-[11px] text-slate-400 rounded-lg px-2 py-1 font-mono focus:outline-none"
                                        >
                                          <option value={3}>Total : 3</option>
                                          <option value={4}>Total : 4</option>
                                          <option value={5}>Total : 5</option>
                                          <option value={6}>Total : 6</option>
                                        </select>

                                        {/* Badge restant */}
                                        <span
                                          className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border ${
                                            isFinished
                                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                              : 'bg-slate-900 text-amber-400 border-slate-800'
                                          }`}
                                        >
                                          {isFinished ? 'Terminé (0 restant)' : `${remainingReviews} restante(s)`}
                                        </span>

                                        {/* Bouton pour valider une révision et déduire */}
                                        <button
                                          type="button"
                                          disabled={isFinished}
                                          onClick={() => handleCompleteOneReview(topic)}
                                          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                            isFinished
                                              ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30'
                                          }`}
                                        >
                                          <span>✓</span> +1 révision
                                        </button>

                                        {isFinished && (
                                          <button
                                            type="button"
                                            onClick={() => handleResetReviews(topic)}
                                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] rounded-lg border border-slate-800 transition"
                                            title="Réinitialiser"
                                          >
                                            ↺
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {/* Supprimer */}
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTopic(topic.id)}
                                      className="text-slate-500 hover:text-rose-400 text-xs p-1 cursor-pointer transition"
                                      title="Supprimer ce chapitre"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>

                        {/* Formulaire ajout chapitre */}
                        <div className="flex flex-col sm:flex-row gap-2 pt-1 items-center">
                          <input
                            type="text"
                            placeholder="Nouveau chapitre (ex: Tests d'hypothèses bivariés)"
                            value={newTopicTitles[sub.id] || ''}
                            onChange={(e) =>
                              setNewTopicTitles((prev) => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddTopic(sub.id)
                              }
                            }}
                            className="flex-1 w-full bg-slate-950 text-xs text-white placeholder:text-slate-600 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                          />

                          {revisionMode === 'ADVANCED_J' && (
                            <select
                              value={newTopicJCounts[sub.id] || 4}
                              onChange={(e) =>
                                setNewTopicJCounts((prev) => ({
                                  ...prev,
                                  [sub.id]: parseInt(e.target.value, 10),
                                }))
                              }
                              className="bg-slate-950 border border-slate-800 text-xs text-slate-400 rounded-xl px-2.5 py-2 font-mono focus:outline-none"
                            >
                              <option value={3}>3 révisions</option>
                              <option value={4}>4 révisions</option>
                              <option value={5}>5 révisions</option>
                              <option value={6}>6 révisions</option>
                            </select>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddTopic(sub.id)}
                            className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
                          >
                            + Chapitre
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}