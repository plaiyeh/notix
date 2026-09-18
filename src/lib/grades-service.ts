import { createClient } from '@/utils/supabase/client'
import { Semester, Subject, Assessment, UnitTeaching } from './calculator'

const supabase = createClient()

/**
 * Récupère le premier semestre de l'utilisateur avec toutes ses unités, matières et épreuves associées.
 */
export async function getOrCreateActiveSemester(userId: string): Promise<Semester | null> {
  // 1. Chercher un semestre existant pour cet utilisateur
  let { data: semester, error } = await supabase
    .from('user_semesters')
    .select('id, name, target_average')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Erreur récupération semestre:', error)
    return null
  }

  // Si aucun semestre n'existe encore, on en crée un par défaut
  if (!semester) {
    const { data: newSem, error: createError } = await supabase
      .from('user_semesters')
      .insert({
        user_id: userId,
        name: 'Semestre 1',
        target_average: 10,
      })
      .select('id, name, target_average')
      .single()

    if (createError) {
      console.error('Erreur création semestre:', createError)
      return null
    }
    semester = newSem
  }

  // 2. Récupérer les matières du semestre
  const { data: rawSubjects, error: subError } = await supabase
    .from('user_subjects')
    .select('id, name, coefficient, grade_override, position')
    .eq('user_semester_id', semester.id)
    .order('position', { ascending: true })

  if (subError) {
    console.error('Erreur récupération matières:', subError)
    return null
  }

  // 3. Pour chaque matière, récupérer ses épreuves
  const subjectIds = (rawSubjects || []).map((s) => s.id)
  let rawAssessments: any[] = []

  if (subjectIds.length > 0) {
    const { data: assData, error: assError } = await supabase
      .from('user_assessments')
      .select('id, user_subject_id, name, weight, grade, position')
      .in('user_subject_id', subjectIds)
      .order('position', { ascending: true })

    if (assError) console.error('Erreur récupération épreuves:', assError)
    else rawAssessments = assData || []
  }

  // Assembler les matières et leurs épreuves
  const subjects: Subject[] = (rawSubjects || []).map((s) => ({
    id: s.id,
    name: s.name,
    coefficient: Number(s.coefficient),
    gradeOverride: s.grade_override !== null ? Number(s.grade_override) : null,
    assessments: rawAssessments
      .filter((a) => a.user_subject_id === s.id)
      .map((a) => ({
        id: a.id,
        name: a.name,
        weight: Number(a.weight),
        grade: a.grade !== null ? Number(a.grade) : null,
      })),
  }))

  // Structurer sous forme d'unités (UnitTeaching) pour correspondre à l'interface Semester
  const units: UnitTeaching[] = [
    {
      id: 'default-unit',
      code: 'UE 1',
      name: 'Tronc Commun',
      coefficient: 1,
      subjects,
    },
  ]

  return {
    id: semester.id,
    name: semester.name,
    targetAverage: Number(semester.target_average),
    units,
  }
}

/**
 * Met à jour la note d'une épreuve dans Supabase
 */
export async function updateAssessmentGradeInDb(assessmentId: string, grade: number | null) {
  return await supabase
    .from('user_assessments')
    .update({ grade })
    .eq('id', assessmentId)
}

/**
 * Met à jour la note directe d'une matière dans Supabase
 */
export async function updateSubjectOverrideInDb(subjectId: string, gradeOverride: number | null) {
  return await supabase
    .from('user_subjects')
    .update({ grade_override: gradeOverride })
    .eq('id', subjectId)
}

/**
 * Ajoute une nouvelle matière dans le semestre
 */
export async function createSubjectInDb(semesterId: string, name: string, coefficient: number) {
  return await supabase
    .from('user_subjects')
    .insert({
      user_semester_id: semesterId,
      name,
      coefficient,
    })
    .select()
    .single()
}

/**
 * Ajoute une épreuve dans une matière
 */
export async function createAssessmentInDb(subjectId: string, name: string, weight: number) {
  return await supabase
    .from('user_assessments')
    .insert({
      user_subject_id: subjectId,
      name,
      weight,
    })
    .select()
    .single()
}