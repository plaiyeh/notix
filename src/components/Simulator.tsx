'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BUT_SD_TEMPLATES } from '@/lib/but-sd-data'
import DatePicker from '@/components/DatePicker'
import { createClient } from '@/utils/supabase/client'
import {
  fetchUserProjects,
  fetchCommunityTemplates,
  createProject,
  deleteProject,
  Project,
} from '@/lib/projects-service'
import {
  fetchFullProjectData,
  initializeProjectCurriculum,
  addUnitToDb,
  addSubjectToDb,
  addAssessmentToDb,
  updateAssessmentGradeInDb,
  updateAssessmentDateInDb,
  deleteAssessmentFromDb,
  deleteUnitFromDb,
} from '@/lib/curriculum-service'
import {
  Semester,
  computeSubjectAverage,
  computeUnitAverage,
  computeSemesterAverage,
} from '@/lib/calculator'

interface AvailableTemplateOption {
  id: string
  name: string
  author: string
  type: 'OFFICIAL' | 'COMMUNITY'
  description: string
  keywords: string[]
}

function normalizeSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim()
}

export default function Simulator() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestedProjectId = searchParams.get('projectId')

  const [projects, setProjects] = useState<Project[]>([])
  const [communityTemplates, setCommunityTemplates] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [semester, setSemester] = useState<Semester | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving'>('synced')

  const [showGlobalAvg, setShowGlobalAvg] = useState(false)
  const [selectedUnitTab, setSelectedUnitTab] = useState<string>('ALL')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'ROOT' | 'SELECT_EXISTING' | 'CREATE_CUSTOM'>('ROOT')

  const [customName, setCustomName] = useState('')
  const [isPublicShared, setIsPublicShared] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({})

  const [isAddingUE, setIsAddingUE] = useState(false)
  const [newUECode, setNewUECode] = useState('')
  const [newUEName, setNewUEName] = useState('')

  const [newAssNames, setNewAssNames] = useState<Record<string, string>>({})
  const [newAssWeights, setNewAssWeights] = useState<Record<string, string>>({})
  const [newAssDates, setNewAssDates] = useState<Record<string, string>>({})
  const [newSubNames, setNewSubNames] = useState<Record<string, string>>({})
  const [newSubCoefs, setNewSubCoefs] = useState<Record<string, string>>({})

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [userProjects, community] = await Promise.all([
          fetchUserProjects(),
          fetchCommunityTemplates(),
        ])
        setProjects(userProjects)
        setCommunityTemplates(community)

        if (userProjects.length > 0) {
          const matchedProj = requestedProjectId
            ? userProjects.find((p) => p.id === requestedProjectId) || userProjects[0]
            : userProjects[0]

          setActiveProject(matchedProj)
          const data = await fetchFullProjectData(matchedProj.id)
          setSemester(data)
          if (data && data.units.length > 0) {
            setSelectedUnitTab(data.units[0].id)
          }
        } else {
          setActiveProject(null)
          setSemester(null)
        }
      }
      setIsLoading(false)
    }
    init()
  }, [requestedProjectId])

  const handleSelectProject = async (proj: Project) => {
    setActiveProject(proj)
    router.replace(`/simulateur?projectId=${proj.id}`)
    setIsLoading(true)
    const data = await fetchFullProjectData(proj.id)
    setSemester(data)
    if (data && data.units.length > 0) {
      setSelectedUnitTab(data.units[0].id)
    }
    setIsLoading(false)
  }

  const handleDeleteProject = async () => {
    if (!activeProject) return
    const confirmed = window.confirm(`Supprimer définitivement le cursus « ${activeProject.name} » et toutes ses notes ?`)
    if (!confirmed) return

    setSyncStatus('saving')
    const success = await deleteProject(activeProject.id)
    if (success) {
      const updated = projects.filter((p) => p.id !== activeProject.id)
      setProjects(updated)
      if (updated.length > 0) {
        const nextProj = updated[0]
        setActiveProject(nextProj)
        router.replace(`/simulateur?projectId=${nextProj.id}`)
        const data = await fetchFullProjectData(nextProj.id)
        setSemester(data)
        if (data && data.units.length > 0) {
          setSelectedUnitTab(data.units[0].id)
        }
      } else {
        setActiveProject(null)
        setSemester(null)
        router.replace('/simulateur')
      }
    }
    setSyncStatus('synced')
  }

  const openModal = () => {
    setModalMode('ROOT')
    setCustomName('')
    setIsPublicShared(false)
    setSearchQuery('')
    setIsModalOpen(true)
  }

  const handleConfirmCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customName.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/simulateur` },
      })
      return
    }

    setSyncStatus('saving')
    setIsImporting(true)
    const created = await createProject(customName.trim(), isPublicShared)
    if (created) {
      const newSem = await initializeProjectCurriculum(created.id, 'EMPTY')
      setProjects((prev) => [created, ...prev])
      setActiveProject(created)
      setSemester(newSem)
      router.replace(`/simulateur?projectId=${created.id}`)
      setIsModalOpen(false)
    }
    setIsImporting(false)
    setSyncStatus('synced')
  }

  const handleLoadSpecificTemplate = async (templateId: string, templateName: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/simulateur` },
      })
      return
    }

    setIsImporting(true)
    setSyncStatus('saving')

    try {
      const created = await createProject(templateName, false)
      if (created) {
        const newSem = await initializeProjectCurriculum(created.id, templateId)
        setProjects((prev) => [created, ...prev])
        setActiveProject(created)
        setSemester(newSem)
        router.replace(`/simulateur?projectId=${created.id}`)
        if (newSem && newSem.units.length > 0) {
          setSelectedUnitTab(newSem.units[0].id)
        }
        setIsModalOpen(false)
      }
    } catch (err) {
      console.error('Erreur chargement maquette :', err)
    } finally {
      setIsImporting(false)
      setSyncStatus('synced')
    }
  }

  const allTemplatesList: AvailableTemplateOption[] = [
    ...BUT_SD_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      author: 'Ministère / IUT',
      type: 'OFFICIAL' as const,
      description: t.description,
      keywords: t.keywords,
    })),
    ...communityTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      author: t.author_name || 'Étudiant',
      type: 'COMMUNITY' as const,
      description: t.description || 'Maquette partagée par un étudiant.',
      keywords: [
        ...normalizeSearch(t.name).split(' '),
        ...(t.author_name ? normalizeSearch(t.author_name).split(' ') : []),
      ],
    })),
  ]

  const filteredTemplates = allTemplatesList.filter((tpl) => {
    if (!searchQuery.trim()) return true
    const queryTokens = normalizeSearch(searchQuery).split(' ').filter(Boolean)
    const targetCorpus = normalizeSearch(
      `${tpl.name} ${tpl.author} ${tpl.description} ${tpl.keywords.join(' ')}`
    )
    return queryTokens.every((token) => targetCorpus.includes(token))
  })

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!semester || !newUEName.trim()) return

    setSyncStatus('saving')
    const code = newUECode.trim() || `UE ${(semester.units.length ?? 0) + 1}`
    const createdUnit = await addUnitToDb(semester.id, code, newUEName.trim())

    if (createdUnit) {
      setSemester((prev) => (prev ? { ...prev, units: [...prev.units, createdUnit] } : prev))
      setSelectedUnitTab(createdUnit.id)
    }

    setNewUECode('')
    setNewUEName('')
    setIsAddingUE(false)
    setSyncStatus('synced')
  }

  const handleAddSubject = async (unitId: string) => {
    const name = newSubNames[unitId]?.trim()
    if (!name) return
    const coef = parseFloat(newSubCoefs[unitId]) || 1

    setSyncStatus('saving')
    const createdSub = await addSubjectToDb(unitId, name, coef)
    if (createdSub) {
      setSemester((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          units: prev.units.map((u) =>
            u.id === unitId ? { ...u, subjects: [...u.subjects, createdSub] } : u
          ),
        }
      })
    }

    setNewSubNames((prev) => ({ ...prev, [unitId]: '' }))
    setNewSubCoefs((prev) => ({ ...prev, [unitId]: '1' }))
    setSyncStatus('synced')
  }

  const handleAddAssessment = async (unitId: string, subjectId: string) => {
    const name = newAssNames[subjectId]?.trim() || 'Partiel'
    const weight = parseFloat(newAssWeights[subjectId]) || 1
    const date = newAssDates[subjectId] || null

    setSyncStatus('saving')
    const createdAss = await addAssessmentToDb(subjectId, name, weight, date)
    if (createdAss) {
      setSemester((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          units: prev.units.map((u) => {
            if (u.id !== unitId) return u
            return {
              ...u,
              subjects: u.subjects.map((s) => {
                if (s.id !== subjectId) return s
                return { ...s, assessments: [...s.assessments, createdAss] }
              }),
            }
          }),
        }
      })
    }

    setNewAssNames((prev) => ({ ...prev, [subjectId]: '' }))
    setNewAssWeights((prev) => ({ ...prev, [subjectId]: '1' }))
    setNewAssDates((prev) => ({ ...prev, [subjectId]: '' }))
    setSyncStatus('synced')
  }

  const handleUpdateGrade = async (
    unitId: string,
    subjectId: string,
    assessmentId: string,
    rawVal: string
  ) => {
    const grade = rawVal === '' ? null : Math.min(20, Math.max(0, parseFloat(rawVal) || 0))

    setSemester((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        units: prev.units.map((u) => {
          if (u.id !== unitId) return u
          return {
            ...u,
            subjects: u.subjects.map((s) => {
              if (s.id !== subjectId) return s
              return {
                ...s,
                assessments: s.assessments.map((a) =>
                  a.id === assessmentId ? { ...a, grade } : a
                ),
              }
            }),
          }
        }),
      }
    })

    setSyncStatus('saving')
    await updateAssessmentGradeInDb(assessmentId, grade)
    setSyncStatus('synced')
  }

  const handleUpdateDate = async (
    unitId: string,
    subjectId: string,
    assessmentId: string,
    newDate: string
  ) => {
    const val = newDate || null

    setSemester((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        units: prev.units.map((u) => {
          if (u.id !== unitId) return u
          return {
            ...u,
            subjects: u.subjects.map((s) => {
              if (s.id !== subjectId) return s
              return {
                ...s,
                assessments: s.assessments.map((a) =>
                  a.id === assessmentId ? { ...a, date: val } : a
                ),
              }
            }),
          }
        }),
      }
    })

    setSyncStatus('saving')
    await updateAssessmentDateInDb(assessmentId, val)
    setSyncStatus('synced')
  }

  const handleDeleteAssessment = async (unitId: string, subjectId: string, assessmentId: string) => {
    setSemester((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        units: prev.units.map((u) => {
          if (u.id !== unitId) return u
          return {
            ...u,
            subjects: u.subjects.map((s) => {
              if (s.id !== subjectId) return s
              return { ...s, assessments: s.assessments.filter((a) => a.id !== assessmentId) }
            }),
          }
        }),
      }
    })
    await deleteAssessmentFromDb(assessmentId)
  }

  const handleDeleteUnit = async (unitId: string) => {
    setSemester((prev) => {
      if (!prev) return prev
      const filtered = prev.units.filter((u) => u.id !== unitId)
      if (selectedUnitTab === unitId) {
        setSelectedUnitTab(filtered.length > 0 ? filtered[0].id : 'ALL')
      }
      return { ...prev, units: filtered }
    })
    await deleteUnitFromDb(unitId)
  }

  const renderFlowModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-left shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Nouveau cursus académique</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Configure ton année d'études</p>
          </div>
          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-base p-1">
            ✕
          </button>
        </div>

        {modalMode === 'ROOT' && (
          <div className="space-y-3 py-1">
            <button
              type="button"
              onClick={() => setModalMode('SELECT_EXISTING')}
              className="w-full group p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-900/60 text-left transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">📚</span>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition">
                    Choisir une maquette existante
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                    Cursus officiels BUT SD (VCOD, EMS) ou maquettes partagées.
                  </p>
                </div>
              </div>
              <span className="text-sky-400 text-sm">→</span>
            </button>

            <button
              type="button"
              onClick={() => setModalMode('CREATE_CUSTOM')}
              className="w-full group p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900/60 text-left transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">🛠️</span>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">
                    Créer une maquette personnalisée
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                    Configurer de zéro et décider de la partager ou non.
                  </p>
                </div>
              </div>
              <span className="text-indigo-400 text-sm">→</span>
            </button>
          </div>
        )}

        {modalMode === 'SELECT_EXISTING' && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setModalMode('ROOT')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← Retour au choix
            </button>

            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Rechercher (ex: s1, vcod, ems...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 text-white rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none placeholder:text-slate-500"
              />
              <span className="absolute left-3 top-2 text-slate-400 text-xs">🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 sm:max-h-72 overflow-y-auto pr-1">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-xs text-slate-400">Aucun résultat pour « {searchQuery} »</p>
                </div>
              ) : (
                filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-sky-500/50 transition flex items-center justify-between gap-2.5"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            tpl.type === 'OFFICIAL'
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {tpl.type === 'OFFICIAL' ? 'Officiel' : 'Communauté'}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">
                          {tpl.name}
                        </h4>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
                        {tpl.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => handleLoadSpecificTemplate(tpl.id, tpl.name)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                      {isImporting ? '...' : 'Charger'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {modalMode === 'CREATE_CUSTOM' && (
          <form onSubmit={handleConfirmCustom} className="space-y-3">
            <button
              type="button"
              onClick={() => setModalMode('ROOT')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              ← Retour au choix
            </button>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Nom de ta maquette
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex : BUT SD — 2A ou Licence Math"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-sky-500 text-white rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublicShared}
                  onChange={(e) => setIsPublicShared(e.target.checked)}
                  className="rounded accent-sky-500"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Partager publiquement
                </span>
              </label>
              <p className="text-[10px] text-slate-500 pl-5">
                Les autres étudiants pourront cloner la structure. Tes notes restent strictement privées.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 text-xs text-slate-400 bg-slate-800 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isImporting}
                className="flex-1 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-md disabled:opacity-50"
              >
                {isImporting ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )

  if (!activeProject && !isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 sm:py-16 text-center space-y-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto text-2xl sm:text-3xl">
          📂
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg sm:text-xl font-bold text-white">Aucun cursus configuré</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Commence par importer une maquette existante ou crée la tienne.
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-sky-600/25 cursor-pointer"
        >
          + Ajouter mon premier cursus
        </button>

        {isModalOpen && renderFlowModal()}
      </div>
    )
  }

  const globalAvg = semester ? computeSemesterAverage(semester, simulatedGrades) : null

  const displayedUnits = semester
    ? selectedUnitTab === 'ALL'
      ? semester.units
      : semester.units.filter((u) => u.id === selectedUnitTab)
    : []

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 space-y-4 sm:space-y-6 pb-12">
      {/* 1. Barre de sélection du cursus (optimisée mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-900/70 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Cursus :
          </span>
          <select
            value={activeProject?.id || ''}
            onChange={(e) => {
              const found = projects.find((p) => p.id === e.target.value)
              if (found) handleSelectProject(found)
            }}
            className="flex-1 sm:flex-none max-w-[200px] sm:max-w-xs bg-slate-950 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none truncate"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.is_public ? '🌐' : '🔒'}
              </option>
            ))}
          </select>

          <button
            onClick={openModal}
            className="text-xs text-sky-400 hover:text-sky-300 px-2 py-1.5 bg-sky-950/40 rounded-lg border border-sky-800/50 transition cursor-pointer whitespace-nowrap"
          >
            + Nouveau
          </button>

          {activeProject && (
            <button
              onClick={handleDeleteProject}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1.5 bg-rose-950/40 rounded-lg border border-rose-800/50 transition cursor-pointer whitespace-nowrap"
              title="Supprimer ce cursus"
            >
              🗑️
            </button>
          )}
        </div>

        <div className="flex items-center justify-end">
          {syncStatus === 'saving' ? (
            <span className="text-[11px] text-amber-400 font-mono animate-pulse">● Enregistrement...</span>
          ) : (
            <span className="text-[11px] text-emerald-400 font-mono">● Synchronisé</span>
          )}
        </div>
      </div>

      {isModalOpen && renderFlowModal()}

      {semester && (
        <>
          {/* 2. VOLET STICKY COMPACT MOBILE : Diagnostic & Moyennes */}
          <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-md pt-1 pb-2.5 -mx-2 sm:-mx-4 px-2 sm:px-4 border-b border-slate-800/80 space-y-2">
            {(() => {
              const unitAverages = semester.units.map((u) => computeUnitAverage(u, simulatedGrades))
              const evaluatedUnits = unitAverages.filter((avg): avg is number => avg !== null)
              const hasEliminatory = evaluatedUnits.some((avg) => avg < 8)
              const allValidated = evaluatedUnits.length === semester.units.length && evaluatedUnits.every((avg) => avg >= 10)
              const hasUnderTen = evaluatedUnits.some((avg) => avg < 10)

              return (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    {/* Badge statut rapide */}
                    <div className="flex items-center gap-1.5 truncate">
                      {hasEliminatory ? (
                        <span className="text-[10px] sm:text-xs font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md truncate">
                          ⚠️ Note éliminatoire (&lt; 8)
                        </span>
                      ) : allValidated ? (
                        <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md truncate">
                          🎉 Semestre validé
                        </span>
                      ) : hasUnderTen ? (
                        <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md truncate">
                          En cours ({evaluatedUnits.filter((a) => a >= 10).length}/{semester.units.length} val.)
                        </span>
                      ) : (
                        <span className="text-[10px] sm:text-xs text-slate-500 font-mono">En attente de notes</span>
                      )}
                    </div>

                   
                  </div>

                  {/* Pills d'UE en carrousel horizontal tactile sur mobile */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {semester.units.map((unit) => {
                      const avg = computeUnitAverage(unit, simulatedGrades)
                      const isValid = avg !== null && avg >= 10
                      const isAtRisk = avg !== null && avg < 8
                      const isSelected = selectedUnitTab === unit.id

                      return (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => setSelectedUnitTab(unit.id)}
                          className={`flex-shrink-0 min-w-[125px] sm:min-w-0 sm:flex-1 p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500/30'
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-bold text-sky-400 truncate">
                              {unit.code}
                            </span>
                            <span
                              className={`text-[8px] font-bold px-1 rounded ${
                                isValid
                                  ? 'text-emerald-400 bg-emerald-500/10'
                                  : isAtRisk
                                  ? 'text-rose-400 bg-rose-500/10'
                                  : 'text-slate-500 bg-slate-800'
                              }`}
                            >
                              {isValid ? 'OK' : isAtRisk ? '< 8' : '—'}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-baseline justify-between gap-1">
                            <span className="text-[10px] font-medium text-slate-300 truncate max-w-[70px] sm:max-w-[100px]">
                              {unit.name}
                            </span>
                            <span className="font-mono font-black text-xs sm:text-sm text-white">
                              {avg !== null ? `${avg}` : '—'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* 3. Onglets par UE (défilement horizontal sur mobile) */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <button
                type="button"
                onClick={() => setSelectedUnitTab('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  selectedUnitTab === 'ALL'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                }`}
              >
                Toutes ({semester.units.length})
              </button>

              {semester.units.map((unit) => {
                const isSelected = selectedUnitTab === unit.id
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => setSelectedUnitTab(unit.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {unit.code}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setIsAddingUE(true)}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-sky-400 text-xs font-semibold rounded-xl transition flex items-center gap-1 whitespace-nowrap flex-shrink-0"
            >
              <span>+</span> UE
            </button>
          </div>

          {isAddingUE && (
            <form onSubmit={handleAddUnit} className="p-3.5 bg-slate-900/90 border border-sky-500/40 rounded-2xl flex flex-col sm:flex-row gap-2 items-center">
              <input
                type="text"
                placeholder="Code (ex: UE 4)"
                value={newUECode}
                onChange={(e) => setNewUECode(e.target.value)}
                className="w-full sm:w-28 bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-700 text-white font-mono focus:outline-none"
              />
              <input
                type="text"
                required
                placeholder="Intitulé de l'UE"
                value={newUEName}
                onChange={(e) => setNewUEName(e.target.value)}
                className="w-full sm:flex-1 bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-700 text-white focus:outline-none"
              />
              <div className="flex gap-2 w-full sm:w-auto">
                <button type="submit" className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl">
                  Ajouter
                </button>
                <button type="button" onClick={() => setIsAddingUE(false)} className="px-3 py-2 bg-slate-800 text-slate-400 text-xs rounded-xl">
                  Annuler
                </button>
              </div>
            </form>
          )}

          {/* 4. Liste des Matières et Épreuves (optimisée smartphone) */}
          <section className="space-y-4">
            {displayedUnits.map((unit) => {
              const unitAvg = computeUnitAverage(unit, simulatedGrades)

              return (
                <div key={unit.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  {/* Entête UE */}
                  <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 bg-sky-950/70 border border-sky-800/50 rounded-md flex-shrink-0">
                        {unit.code}
                      </span>
                      <h2 className="text-xs sm:text-sm font-bold text-white truncate">{unit.name}</h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                        {unitAvg !== null ? `${unitAvg}/20` : '—'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteUnit(unit.id)}
                        className="text-slate-500 hover:text-rose-400 text-xs p-1"
                        title="Supprimer cette UE"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {unit.subjects.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-3 text-center">
                        Aucune matière dans cette UE.
                      </p>
                    ) : (
                      unit.subjects.map((sub) => {
                        const subAvg = computeSubjectAverage(sub, simulatedGrades)

                        return (
                          <div key={sub.id} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2.5">
                            {/* Titre matière + Moyenne */}
                            <div className="flex justify-between items-start gap-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-xs sm:text-sm text-slate-200 truncate">{sub.name}</h3>
                                <span className="text-[10px] text-slate-500 font-mono">Pondération : ×{sub.coefficient}</span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-[9px] text-slate-500 block uppercase font-medium">Moyenne</span>
                                <span className="text-xs sm:text-sm font-bold font-mono text-slate-300">
                                  {subAvg !== null ? `${subAvg}/20` : '—'}
                                </span>
                              </div>
                            </div>

                            {/* Épreuves : Disposition Responsive fluide */}
                            <div className="space-y-2">
                              {sub.assessments.map((ass) => {
                                const isSimulated = ass.grade === null && simulatedGrades[ass.id] !== undefined

                                return (
                                  <div key={ass.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      {/* Nom épreuve */}
                                      <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0">
                                        <span className="text-xs font-medium text-slate-300 truncate">{ass.name}</span>
                                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">(coef {ass.weight})</span>
                                      </div>

                                      {/* Date, Note, Delete alignés proprement sur mobile */}
                                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
                                        <DatePicker
                                          value={ass.date || null}
                                          onChange={(newDate) => handleUpdateDate(unit.id, sub.id, ass.id, newDate)}
                                          placeholder="Date"
                                        />
                                        <input
                                          type="number"
                                          min="0"
                                          max="20"
                                          step="any"
                                          value={ass.grade ?? ''}
                                          onChange={(e) => handleUpdateGrade(unit.id, sub.id, ass.id, e.target.value)}
                                          placeholder="Note"
                                          className="w-14 sm:w-16 bg-slate-950 text-white font-mono text-center font-bold px-2 py-1 rounded-lg text-xs border border-slate-700 focus:outline-none focus:border-sky-500"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteAssessment(unit.id, sub.id, ass.id)}
                                          className="text-slate-500 hover:text-rose-500 text-sm p-1"
                                          title="Supprimer"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>

                                    {/* Slider de simulation */}
                                    {ass.grade === null && (
                                      <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800/40">
                                        <span className="text-[10px] text-slate-400 flex-shrink-0">Simuler :</span>
                                        <input
                                          type="range"
                                          min="0"
                                          max="20"
                                          step="0.5"
                                          value={simulatedGrades[ass.id] ?? 10}
                                          onChange={(e) => setSimulatedGrades((prev) => ({ ...prev, [ass.id]: parseFloat(e.target.value) }))}
                                          className="flex-1 accent-sky-500 h-1"
                                        />
                                        <span className="text-[10px] font-mono font-bold text-sky-400 min-w-[35px] text-right flex-shrink-0">
                                          {isSimulated ? `${simulatedGrades[ass.id]}` : '10'}/20
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            {/* Formulaire ajout épreuve : grille responsive 2x2 sur mobile */}
                            <div className="flex flex-col sm:flex-row gap-1.5 pt-1">
                              <input
                                type="text"
                                placeholder="Nom (Partiel / SAÉ)"
                                value={newAssNames[sub.id] || ''}
                                onChange={(e) => setNewAssNames((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                                className="w-full sm:flex-1 bg-slate-900 text-xs text-white placeholder:text-slate-600 px-2.5 py-1.5 rounded-xl border border-slate-800 focus:outline-none focus:border-sky-500"
                              />
                              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                                <input
                                  type="number"
                                  step="any"
                                  min="0.1"
                                  placeholder="Coeff"
                                  value={newAssWeights[sub.id] || '1'}
                                  onChange={(e) => setNewAssWeights((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                                  className="w-16 bg-slate-900 text-xs text-white text-center px-2 py-1.5 rounded-xl border border-slate-800 font-mono focus:outline-none"
                                />
                                <DatePicker
                                  value={newAssDates[sub.id] || null}
                                  onChange={(d) => setNewAssDates((prev) => ({ ...prev, [sub.id]: d }))}
                                  placeholder="Date épreuve"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddAssessment(unit.id, sub.id)}
                                  className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl whitespace-nowrap"
                                >
                                  + Épreuve
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}

                    {/* Ajout d'une ressource / matière */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800/60">
                      <input
                        type="text"
                        placeholder="Nouvelle ressource / matière"
                        value={newSubNames[unit.id] || ''}
                        onChange={(e) => setNewSubNames((prev) => ({ ...prev, [unit.id]: e.target.value }))}
                        className="w-full sm:flex-1 bg-slate-950 text-xs text-white placeholder:text-slate-600 px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-sky-500"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0.5"
                          placeholder="Coeff"
                          value={newSubCoefs[unit.id] || '1'}
                          onChange={(e) => setNewSubCoefs((prev) => ({ ...prev, [unit.id]: e.target.value }))}
                          className="w-20 bg-slate-950 text-xs text-white text-center px-2 py-2 rounded-lg border border-slate-800 font-mono focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubject(unit.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                        >
                          + Matière
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </section>
        </>
      )}
    </div>
  )
}