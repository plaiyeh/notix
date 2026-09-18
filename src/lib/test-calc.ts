import {
  computeSubjectGrade,
  computeSubjectPartialAverage,
  computeRequiredGradeForAssessment,
  computeSemesterRequirement,
  Semester,
} from './calculator'

// Cas concret : Semestre 1 avec 2 matières
const demoSemester: Semester = {
  id: 'sem-1',
  name: 'Semestre 1',
  targetAverage: 10, // Objectif : valider à 10/20
  subjects: [
    {
      id: 'sub-stat',
      name: 'Programmation statistique',
      coefficient: 1.5,
      gradeOverride: null,
      assessments: [
        { id: 'a1', name: 'Partiel 1', weight: 1, grade: 8 },    // coef 1, note 8
        { id: 'a2', name: 'Partiel 2', weight: 2, grade: null }, // coef 2, pas encore passé
      ],
    },
    {
      id: 'sub-eco',
      name: 'Économie',
      coefficient: 2,
      gradeOverride: 12, // note directe
      assessments: [],
    },
  ],
}

console.log('--- TEST MOTEUR DE CALCUL ---')

// 1. Moyenne partielle actuelle en Prog stat (uniquement sur le Partiel 1)
const progStat = demoSemester.subjects[0]
console.log('Moyenne actuelle Prog stat :', computeSubjectPartialAverage(progStat)) // Attend 8

// 2. Quelle note faut-il au Partiel 2 pour avoir 10 dans la matière ?
const simuPartiel2 = computeRequiredGradeForAssessment(progStat, 'a2', 10)
console.log('Note requise au Partiel 2 pour avoir 10 dans la matière :', simuPartiel2.requiredGrade) 
// Calcul : (10 * 3 - 8 * 1) / 2 = 22 / 2 = 11. Attend 11

// 3. Statut global du semestre
console.log('Statut semestre actuel :', computeSemesterRequirement(demoSemester))