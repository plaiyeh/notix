/** Une épreuve au sein d'une matière (ex : « Partiel 1 », « SAÉ »). */
export interface Assessment {
  id: string
  name: string
  /** Coefficient interne à la matière. Doit être > 0. */
  weight: number
  /** Note sur 20. null si l'épreuve n'a pas encore eu lieu. */
  grade: number | null
  /** Date optionnelle de l'épreuve (format YYYY-MM-DD). */
  date?: string | null
}

/** Une matière / ressource (ex : R1.01 Algorithmique). */
export interface Subject {
  id: string
  name: string
  /** Poids de la matière dans son UE. Doit être > 0. */
  coefficient: number
  /** Note directe optionnelle si pas de découpage par épreuve. */
  gradeOverride?: number | null
  assessments: Assessment[]
}

/** Un bloc de compétences / UE (ex : UE1 Traiter, UE2 Analyser, UE3 Valoriser). */
export interface UnitTeaching {
  id: string
  code: string // Ex : "UE 1"
  name: string // Ex : "Traiter les données"
  coefficient?: number
  subjects: Subject[]
}

/** Un semestre complet (ex : Semestre 1). */
export interface Semester {
  id: string
  name: string
  targetAverage: number
  units: UnitTeaching[] // Corrigé pour utiliser les unités (UnitTeaching)
}

export interface WeightedItem {
  weight: number
  value: number | null
}

export type RequirementStatus =
  | 'ACHIEVED'
  | 'IMPOSSIBLE'
  | 'REQUIRED'
  | 'NO_REMAINING_ITEMS'

export interface RequirementResult {
  status: RequirementStatus
  pointsAcquired: number
  pointsTarget: number
  totalWeight: number
  remainingWeight: number
  requiredAverage: number | null
}

// ============================================================================
// UTILITAIRES INTERNES
// ============================================================================

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function isValidWeight(weight: number): boolean {
  return Number.isFinite(weight) && weight > 0
}

// ============================================================================
// MOTEUR GÉNÉRIQUE PONDÉRÉ
// ============================================================================

export function computeWeightedRequirement(
  items: WeightedItem[],
  targetAverage: number
): RequirementResult {
  const validItems = items.filter((item) => isValidWeight(item.weight))
  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0)
  const pointsTarget = targetAverage * totalWeight

  const knownItems = validItems.filter((item) => item.value !== null)
  const pointsAcquired = knownItems.reduce(
    (sum, item) => sum + item.weight * (item.value as number),
    0
  )

  const knownWeight = knownItems.reduce((sum, item) => sum + item.weight, 0)
  const remainingWeight = totalWeight - knownWeight

  if (remainingWeight <= 0) {
    return {
      status: pointsAcquired >= pointsTarget ? 'ACHIEVED' : 'IMPOSSIBLE',
      pointsAcquired: round2(pointsAcquired),
      pointsTarget: round2(pointsTarget),
      totalWeight: round2(totalWeight),
      remainingWeight: 0,
      requiredAverage: null,
    }
  }

  const rawRequired = (pointsTarget - pointsAcquired) / remainingWeight

  let status: RequirementStatus = 'REQUIRED'
  if (rawRequired <= 0) status = 'ACHIEVED'
  else if (rawRequired > 20) status = 'IMPOSSIBLE'

  return {
    status,
    pointsAcquired: round2(pointsAcquired),
    pointsTarget: round2(pointsTarget),
    totalWeight: round2(totalWeight),
    remainingWeight: round2(remainingWeight),
    requiredAverage: round2(rawRequired),
  }
}

// ============================================================================
// CALCULS DES MOYENNES (MATIÈRE ➔ UE ➔ SEMESTRE)
// ============================================================================

export function computeSubjectAverage(
  subject: Subject,
  simulatedGrades: Record<string, number> = {}
): number | null {
  if (subject.assessments.length === 0) {
    return subject.gradeOverride ?? null
  }

  let totalPoints = 0
  let totalWeight = 0

  for (const ass of subject.assessments) {
    const finalGrade = ass.grade !== null ? ass.grade : simulatedGrades[ass.id]
    if (finalGrade !== undefined && finalGrade !== null && isValidWeight(ass.weight)) {
      totalPoints += finalGrade * ass.weight
      totalWeight += ass.weight
    }
  }

  if (totalWeight === 0) return null
  return round2(totalPoints / totalWeight)
}

export function computeUnitAverage(
  unit: UnitTeaching,
  simulatedGrades: Record<string, number> = {}
): number | null {
  if (unit.subjects.length === 0) return null

  let totalPoints = 0
  let totalWeight = 0

  for (const sub of unit.subjects) {
    const subAvg = computeSubjectAverage(sub, simulatedGrades)
    if (subAvg !== null && isValidWeight(sub.coefficient)) {
      totalPoints += subAvg * sub.coefficient
      totalWeight += sub.coefficient
    }
  }

  if (totalWeight === 0) return null
  return round2(totalPoints / totalWeight)
}

export function computeSemesterAverage(
  semester: Semester,
  simulatedGrades: Record<string, number> = {}
): number | null {
  const averages = semester.units
    .map((u) => computeUnitAverage(u, simulatedGrades))
    .filter((avg): avg is number => avg !== null)

  if (averages.length === 0) return null
  const sum = averages.reduce((acc, curr) => acc + curr, 0)
  return round2(sum / averages.length)
}

// ============================================================================
// SIMULATION PRÉDICTIVE SUR UNE ÉPREUVE CIBLÉE
// ============================================================================

export interface AssessmentSimulationResult {
  status: RequirementStatus | 'INCOMPLETE_SIMULATION'
  requiredGrade: number | null
  missingAssessmentIds: string[]
}

export function computeRequiredGradeForAssessment(
  subject: Subject,
  targetAssessmentId: string,
  targetSubjectGrade: number,
  hypotheticalGrades: Record<string, number> = {}
): AssessmentSimulationResult {
  const target = subject.assessments.find((a) => a.id === targetAssessmentId)
  if (!target || !isValidWeight(target.weight)) {
    return { status: 'IMPOSSIBLE', requiredGrade: null, missingAssessmentIds: [] }
  }

  const missing = subject.assessments
    .filter(
      (a) =>
        a.id !== targetAssessmentId &&
        a.grade === null &&
        hypotheticalGrades[a.id] === undefined
    )
    .map((a) => a.id)

  if (missing.length > 0) {
    return { status: 'INCOMPLETE_SIMULATION', requiredGrade: null, missingAssessmentIds: missing }
  }

  const others: WeightedItem[] = subject.assessments
    .filter((a) => a.id !== targetAssessmentId && isValidWeight(a.weight))
    .map((a) => ({
      weight: a.weight,
      value: (a.grade ?? hypotheticalGrades[a.id]) as number,
    }))

  const targetItem: WeightedItem = { weight: target.weight, value: null }
  const result = computeWeightedRequirement([...others, targetItem], targetSubjectGrade)

  return {
    status: result.status,
    requiredGrade: result.requiredAverage,
    missingAssessmentIds: [],
  }
}