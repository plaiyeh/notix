import { createClient } from '@/utils/supabase/client'
import { Semester, UnitTeaching, Subject, Assessment } from '@/lib/calculator'
import { BUT_SD_TEMPLATES } from './but-sd-data'

// ---------------------------------------------------------------------------
// 1. Charger tout le cursus actif avec son arborescence complète
// ---------------------------------------------------------------------------
export async function fetchFullProjectData(projectId: string): Promise<Semester | null> {
  const supabase = createClient()

  // 1.1 Récupérer le premier semestre du projet
  const { data: semesterData, error: semError } = await supabase
    .from('user_semesters')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .limit(1)
    .single()

  if (semError || !semesterData) {
    return null
  }

  // 1.2 Récupérer les UEs du semestre
  const { data: unitsData, error: unitsError } = await supabase
    .from('user_units')
    .select('*')
    .eq('user_semester_id', semesterData.id)
    .order('position', { ascending: true })

  if (unitsError || !unitsData) {
    return {
      id: semesterData.id,
      name: semesterData.name,
      targetAverage: Number(semesterData.target_average),
      units: [],
    }
  }

  const unitIds = unitsData.map((u) => u.id)

  // 1.3 Récupérer les matières associées aux UEs
  const { data: subjectsData } = await supabase
    .from('user_subjects')
    .select('*')
    .in('user_unit_id', unitIds.length ? unitIds : ['00000000-0000-0000-0000-000000000000'])
    .order('position', { ascending: true })

  const subjectIds = subjectsData ? subjectsData.map((s) => s.id) : []

  // 1.4 Récupérer les épreuves rattachées aux matières
  const { data: assessmentsData } = await supabase
    .from('user_assessments')
    .select('*')
    .in('user_subject_id', subjectIds.length ? subjectIds : ['00000000-0000-0000-0000-000000000000'])
    .order('position', { ascending: true })

  // 1.5 Assembler l'arborescence (Semestre -> UEs -> Matières -> Épreuves)
  const units: UnitTeaching[] = unitsData.map((u) => {
    const unitSubjects = (subjectsData || [])
      .filter((s) => s.user_unit_id === u.id)
      .map((s) => {
        const assessments: Assessment[] = (assessmentsData || [])
          .filter((a) => a.user_subject_id === s.id)
          .map((a) => ({
            id: a.id,
            name: a.name,
            weight: Number(a.weight),
            grade: a.grade !== null ? Number(a.grade) : null,
            date: a.exam_date,
          }))

        return {
          id: s.id,
          name: s.name,
          coefficient: Number(s.coefficient),
          assessments,
        }
      })

    return {
      id: u.id,
      code: u.code,
      name: u.name,
      coefficient: Number(u.coefficient),
      subjects: unitSubjects,
    }
  })

  return {
    id: semesterData.id,
    name: semesterData.name,
    targetAverage: Number(semesterData.target_average),
    units,
  }
}

// ---------------------------------------------------------------------------
// 2. Initialiser un nouveau cursus à partir d'un template (BUT SD ou Vierge)
// ---------------------------------------------------------------------------
export async function initializeProjectCurriculum(
  projectId: string,
  templateId: string // ex: 'EMPTY', 'but-sd-s1', 'but-sd-s3-vcod', etc.
): Promise<Semester | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Retrouver la définition de la maquette sélectionnée
  const selectedDef = BUT_SD_TEMPLATES.find((t) => t.id === templateId)
  const semName = selectedDef ? selectedDef.name : 'Semestre 1'

  // Création du semestre
  const { data: semester, error: semErr } = await supabase
    .from('user_semesters')
    .insert({
      project_id: projectId,
      user_id: user.id,
      name: semName,
      target_average: 10,
    })
    .select()
    .single()

  if (semErr || !semester) return null

  // Si projet vierge
  if (templateId === 'EMPTY' || !selectedDef) {
    return {
      id: semester.id,
      name: semester.name,
      targetAverage: 10,
      units: [],
    }
  }

  // Création automatique de chaque UE et de ses matières SANS épreuve fantôme
  const createdUnits: UnitTeaching[] = []

  for (let uIdx = 0; uIdx < selectedDef.units.length; uIdx++) {
    const uDef = selectedDef.units[uIdx]

    const { data: unitRecord } = await supabase
      .from('user_units')
      .insert({
        user_semester_id: semester.id,
        code: uDef.code,
        name: uDef.name,
        position: uIdx + 1,
        coefficient: 1,
      })
      .select()
      .single()

    if (unitRecord) {
      const subjects: Subject[] = []

      for (let sIdx = 0; sIdx < uDef.subjects.length; sIdx++) {
        const sDef = uDef.subjects[sIdx]

        const { data: subRecord } = await supabase
          .from('user_subjects')
          .insert({
            user_unit_id: unitRecord.id,
            name: sDef.name,
            coefficient: sDef.coefficient,
            position: sIdx + 1,
          })
          .select()
          .single()

        if (subRecord) {
          // Aucune épreuve par défaut : la liste démarre propre
          subjects.push({
            id: subRecord.id,
            name: subRecord.name,
            coefficient: Number(subRecord.coefficient),
            assessments: [],
          })
        }
      }

      createdUnits.push({
        id: unitRecord.id,
        code: unitRecord.code,
        name: unitRecord.name,
        coefficient: 1,
        subjects,
      })
    }
  }

  return {
    id: semester.id,
    name: semester.name,
    targetAverage: 10,
    units: createdUnits,
  }
}

// ---------------------------------------------------------------------------
// 3. Gestion des Unités d'Enseignement (UE)
// ---------------------------------------------------------------------------
export async function addUnitToDb(
  semesterId: string,
  code: string,
  name: string
): Promise<UnitTeaching | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_units')
    .insert({
      user_semester_id: semesterId,
      code,
      name,
    })
    .select()
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    coefficient: Number(data.coefficient),
    subjects: [],
  }
}

export async function deleteUnitFromDb(id: string) {
  const supabase = createClient()
  await supabase.from('user_units').delete().eq('id', id)
}

// ---------------------------------------------------------------------------
// 4. Gestion des Matières / Ressources
// ---------------------------------------------------------------------------
export async function addSubjectToDb(
  unitId: string,
  name: string,
  coefficient: number
): Promise<Subject | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_subjects')
    .insert({
      user_unit_id: unitId,
      name,
      coefficient,
    })
    .select()
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    name: data.name,
    coefficient: Number(data.coefficient),
    assessments: [],
  }
}

// ---------------------------------------------------------------------------
// 5. Gestion des Épreuves & Partiels
// ---------------------------------------------------------------------------
export async function addAssessmentToDb(
  subjectId: string,
  name: string,
  weight: number,
  exam_date?: string | null
): Promise<Assessment | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('user_assessments')
    .insert({
      user_subject_id: subjectId,
      name,
      weight,
      exam_date: exam_date || null,
    })
    .select()
    .single()

  if (error || !data) return null
  return {
    id: data.id,
    name: data.name,
    weight: Number(data.weight),
    grade: null,
    date: data.exam_date,
  }
}

export async function updateAssessmentGradeInDb(assessmentId: string, grade: number | null) {
  const supabase = createClient()
  await supabase
    .from('user_assessments')
    .update({ grade })
    .eq('id', assessmentId)
}

export async function updateAssessmentDateInDb(assessmentId: string, exam_date: string | null) {
  const supabase = createClient()
  await supabase
    .from('user_assessments')
    .update({ exam_date: exam_date || null })
    .eq('id', assessmentId)
}

export async function deleteAssessmentFromDb(id: string) {
  const supabase = createClient()
  await supabase.from('user_assessments').delete().eq('id', id)
}

// ---------------------------------------------------------------------------
// 6. Cockpit de Révisions (Feux tricolores & Méthode des J)
// ---------------------------------------------------------------------------
export interface DbRevisionTopic {
  id: string
  user_subject_id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'MASTERED'
  total_j?: number
  completed_j?: number
  last_reviewed_at?: string | null
}

export async function fetchRevisionTopicsForSubjects(subjectIds: string[]): Promise<DbRevisionTopic[]> {
  if (subjectIds.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('revision_topics')
    .select('*')
    .in('user_subject_id', subjectIds)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data as DbRevisionTopic[]
}

export async function addRevisionTopicToDb(
  userSubjectId: string,
  title: string,
  total_j: number = 4
): Promise<DbRevisionTopic | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('revision_topics')
    .insert({
      user_subject_id: userSubjectId,
      title,
      status: 'TODO',
      total_j,
      completed_j: 0,
    })
    .select()
    .single()

  if (error || !data) return null
  return data as DbRevisionTopic
}

export async function updateRevisionStatusInDb(
  topicId: string,
  status: 'TODO' | 'IN_PROGRESS' | 'MASTERED',
  completed_j?: number,
  total_j?: number,
  last_reviewed_at?: string | null
) {
  const supabase = createClient()
  const updatePayload: Record<string, any> = { status }
  if (typeof completed_j === 'number') updatePayload.completed_j = completed_j
  if (typeof total_j === 'number') updatePayload.total_j = total_j
  if (last_reviewed_at !== undefined) updatePayload.last_reviewed_at = last_reviewed_at

  await supabase
    .from('revision_topics')
    .update(updatePayload)
    .eq('id', topicId)
}

export async function deleteRevisionTopicFromDb(topicId: string) {
  const supabase = createClient()
  await supabase.from('revision_topics').delete().eq('id', topicId)
}