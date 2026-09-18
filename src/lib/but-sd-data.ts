export interface UnitTemplateDef {
  code: string
  name: string
  subjects: {
    name: string
    coefficient: number
    defaultAssessmentName?: string
  }[]
}

export interface SemesterTemplateDef {
  id: string
  name: string
  shortLabel: string
  filiere: string
  niveau: string
  description: string
  keywords: string[]
  units: UnitTemplateDef[]
}

export const BUT_SD_TEMPLATES: SemesterTemplateDef[] = [
  // ==========================================
  // SEMESTRE 1 (1A — Tronc Commun)
  // ==========================================
  {
    id: 'but-sd-s1',
    name: 'BUT SD — Semestre 1 (1A)',
    shortLabel: 'BUT SD S1',
    filiere: 'Science des Données',
    niveau: '1A',
    description: '3 UE : Traiter (UE1.1), Analyser (UE1.2), Valoriser (UE1.3) + SAÉ S1.01 à S1.07.',
    keywords: ['but', 'sd', 's1', '1a', 'science', 'donnees', 'data', 'algorithmique', 'statistiques'],
    units: [
      {
        code: 'UE 1.1',
        name: 'Traiter des données',
        subjects: [
          { name: 'SAÉ 1.01 - Reporting SGBD relationnel', coefficient: 2.0 },
          { name: 'SAÉ 1.02 - Écriture et lecture de données', coefficient: 2.0 },
          { name: 'R1.01 - Tableur et reporting', coefficient: 1.0 },
          { name: 'R1.02 - Bases de données relationnelles 1', coefficient: 2.0 },
          { name: 'R1.03 - Bases de la programmation 1', coefficient: 2.0 },
          { name: 'R1.10 - Projet Personnel et Professionnel 1', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 1.2',
        name: 'Analyser des données',
        subjects: [
          { name: 'SAÉ 1.03 - Synthèse exploratoire de données', coefficient: 2.0 },
          { name: 'SAÉ 1.07 - Traitement d’une enquête', coefficient: 2.0 },
          { name: 'R1.04 - Statistique descriptive 1', coefficient: 2.0 },
          { name: 'R1.05 - Probabilités 1', coefficient: 1.5 },
          { name: 'R1.06 - Mathématiques : analyse', coefficient: 1.5 },
          { name: 'R1.10 - Projet Personnel et Professionnel 1', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 1.3',
        name: 'Valoriser des données',
        subjects: [
          { name: 'SAÉ 1.04 - Production de données en entreprise', coefficient: 1.0 },
          { name: 'SAÉ 1.05 - Présentation en anglais territoire éco.', coefficient: 1.0 },
          { name: 'SAÉ 1.06 - Mise en œuvre d’une enquête', coefficient: 2.0 },
          { name: 'R1.07 - Initiation à l’anglais de spécialité', coefficient: 1.5 },
          { name: 'R1.08 - Communication & recherche doc.', coefficient: 1.5 },
          { name: 'R1.09 - Environnement éco. et entrepreneurial', coefficient: 2.0 },
          { name: 'R1.10 - Projet Personnel et Professionnel 1', coefficient: 1.0 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 2 (1A — Tronc Commun)
  // ==========================================
  {
    id: 'but-sd-s2',
    name: 'BUT SD — Semestre 2 (1A)',
    shortLabel: 'BUT SD S2',
    filiere: 'Science des Données',
    niveau: '1A',
    description: '3 UE : SGBD 2, Inférence, Dataviz, Régression réelle & Portfolio.',
    keywords: ['but', 'sd', 's2', '1a', 'sql', 'inferentielle', 'regression', 'dataviz'],
    units: [
      {
        code: 'UE 2.1',
        name: 'Traiter des données',
        subjects: [
          { name: 'SAÉ 2.01 - Conception base de données', coefficient: 1.5 },
          { name: 'SAÉ 2.06 - Analyse, reporting et dataviz', coefficient: 1.75 },
          { name: 'SAÉ 2.07 - Implémentation outil de suivi', coefficient: 1.0 },
          { name: 'Portfolio S2', coefficient: 0.5 },
          { name: 'R2.01 - Reporting et Datavisualisation', coefficient: 1.0 },
          { name: 'R2.02 - Bases de données relationnelles 2', coefficient: 1.5 },
          { name: 'R2.03 - Bases de la programmation 2', coefficient: 1.25 },
          { name: 'R2.04 - Programmation statistique', coefficient: 1.5 },
          { name: 'R2.12 - PPP 2', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 2.2',
        name: 'Analyser des données',
        subjects: [
          { name: 'SAÉ 2.02 - Estimation par échantillonnage', coefficient: 1.0 },
          { name: 'SAÉ 2.03 - Régression sur données réelles', coefficient: 1.0 },
          { name: 'SAÉ 2.06 - Analyse, reporting et dataviz', coefficient: 1.75 },
          { name: 'Portfolio S2', coefficient: 0.5 },
          { name: 'R2.05 - Statistique descriptive 2', coefficient: 1.0 },
          { name: 'R2.06 - Probabilités 2', coefficient: 1.5 },
          { name: 'R2.07 - Bases de l’algèbre', coefficient: 1.5 },
          { name: 'R2.08 - Statistique inférentielle', coefficient: 1.0 },
          { name: 'R2.12 - PPP 2', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 2.3',
        name: 'Valoriser des données',
        subjects: [
          { name: 'SAÉ 2.04 - Datavisualisation', coefficient: 1.0 },
          { name: 'SAÉ 2.05 - Indicateurs de performance', coefficient: 1.0 },
          { name: 'SAÉ 2.06 - Analyse, reporting et dataviz', coefficient: 1.75 },
          { name: 'Portfolio S2', coefficient: 0.5 },
          { name: 'R2.09 - Approfondissement anglais de spécialité', coefficient: 1.5 },
          { name: 'R2.10 - Communication et sémiologie', coefficient: 1.5 },
          { name: 'R2.11 - Environnement éco. et entrepreneurial', coefficient: 2.0 },
          { name: 'R2.12 - PPP 2', coefficient: 0.5 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 3 (2A — PARCOURS VCOD)
  // ==========================================
  {
    id: 'but-sd-s3-vcod',
    name: 'BUT SD — Semestre 3 (Parcours VCOD)',
    shortLabel: 'BUT SD S3 VCOD',
    filiere: 'Science des Données — VCOD',
    niveau: '2A',
    description: '4 UE : Datawarehouse, Séries temporelles, R Shiny & Programmation objet.',
    keywords: ['but', 'sd', 's3', '2a', 'vcod', 'shiny', 'datawarehouse', 'poo'],
    units: [
      {
        code: 'UE 3.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 3.01 - Collecte automatisée données web', coefficient: 1.0 },
          { name: 'SAÉ 3.02 - Intégration dans un datawarehouse', coefficient: 1.5 },
          { name: 'SAÉ 3.04 - Conformité réglementaire', coefficient: 1.0 },
          { name: 'R3.01 - Reporting avancé (R Shiny / Tableau)', coefficient: 1.0 },
          { name: 'R3.02 - Systèmes d’information décisionnels', coefficient: 1.5 },
          { name: 'R3.03 - Technologies web', coefficient: 1.0 },
          { name: 'R3.04 - Programmation statistique automatisée', coefficient: 1.0 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 3.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 3.01 - Collecte automatisée données web', coefficient: 1.0 },
          { name: 'SAÉ 3.03 - Prévision de données temporelles', coefficient: 1.0 },
          { name: 'SAÉ 3.04 - Conformité réglementaire', coefficient: 1.0 },
          { name: 'R3.05 - Algèbre linéaire', coefficient: 1.5 },
          { name: 'R3.06 - Tests d’hypothèses bi-variés', coefficient: 1.5 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 3.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 3.01 - Collecte automatisée données web', coefficient: 1.0 },
          { name: 'SAÉ 3.02 - Intégration dans un datawarehouse', coefficient: 0.5 },
          { name: 'SAÉ 3.03 - Prévision de données temporelles', coefficient: 0.5 },
          { name: 'SAÉ 3.04 - Conformité réglementaire', coefficient: 1.0 },
          { name: 'R3.07 - Anglais professionnel', coefficient: 1.0 },
          { name: 'R3.08 - Communication organisationnelle', coefficient: 1.0 },
          { name: 'R3.09 - Données environnement éco. pour décision', coefficient: 2.0 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 3.4',
        name: 'Développer un outil décisionnel (VCOD)',
        subjects: [
          { name: 'SAÉ 3.01 - Collecte automatisée données web', coefficient: 4.0 },
          { name: 'R3.10 - Programmation objet', coefficient: 3.0 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 3 (2A — PARCOURS EMS)
  // ==========================================
  {
    id: 'but-sd-s3-ems',
    name: 'BUT SD — Semestre 3 (Parcours EMS)',
    shortLabel: 'BUT SD S3 EMS',
    filiere: 'Science des Données — EMS',
    niveau: '2A',
    description: '4 UE : Échantillonnage / Plan d’expériences, Datawarehouse & Techniques de sondage.',
    keywords: ['but', 'sd', 's3', '2a', 'ems', 'sondage', 'enquete', 'echantillonnage', 'statistique'],
    units: [
      {
        code: 'UE 3.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 3.01 - Recueil et analyse par échantillonnage', coefficient: 1.0 },
          { name: 'SAÉ 3.02 - Intégration dans un datawarehouse', coefficient: 1.5 },
          { name: 'SAÉ 3.04 - Conformité réglementaire pour analyser', coefficient: 1.0 },
          { name: 'R3.01 - Reporting avancé (R Shiny / Tableau)', coefficient: 1.0 },
          { name: 'R3.02 - Systèmes d’information décisionnels', coefficient: 1.5 },
          { name: 'R3.03 - Technologies web', coefficient: 1.0 },
          { name: 'R3.04 - Programmation statistique automatisée', coefficient: 1.0 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 3.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 3.01 - Recueil et analyse par échantillonnage', coefficient: 1.0 },
          { name: 'SAÉ 3.03 - Prévision de données temporelles', coefficient: 1.0 },
          { name: 'SAÉ 3.04 - Conformité réglementaire pour analyser', coefficient: 1.0 },
          { name: 'R3.05 - Algèbre linéaire', coefficient: 1.5 },
          { name: 'R3.06 - Tests d’hypothèses bi-variés', coefficient: 1.5 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 3.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 3.01 - Recueil et analyse par échantillonnage', coefficient: 1.0 },
          { name: 'SAÉ 3.02 - Intégration dans un datawarehouse', coefficient: 0.5 },
          { name: 'SAÉ 3.03 - Prévision de données temporelles', coefficient: 0.5 },
          { name: 'SAÉ 3.04 - Conformité réglementaire pour analyser', coefficient: 1.0 },
          { name: 'R3.07 - Anglais professionnel', coefficient: 1.0 },
          { name: 'R3.08 - Communication organisationnelle', coefficient: 1.0 },
          { name: 'R3.09 - Données environnement éco. pour décision', coefficient: 2.0 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 3.4',
        name: 'Modéliser les données (EMS)',
        subjects: [
          { name: 'SAÉ 3.01 - Recueil et analyse par échantillonnage', coefficient: 4.0 },
          { name: 'R3.10 - Techniques de sondage et méthodologie d’enquête', coefficient: 3.0 },
          { name: 'R3.11 - PPP 3', coefficient: 0.5 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 4 (2A — PARCOURS VCOD)
  // ==========================================
  {
    id: 'but-sd-s4-vcod',
    name: 'BUT SD — Semestre 4 (Parcours VCOD)',
    shortLabel: 'BUT SD S4 VCOD',
    filiere: 'Science des Données — VCOD',
    niveau: '2A',
    description: '4 UE : Stage de 8 semaines, Méthodes factorielles, Classification & Web.',
    keywords: ['but', 'sd', 's4', '2a', 'vcod', 'stage', 'factorielles', 'classification'],
    units: [
      {
        code: 'UE 4.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 4.01 - Solution décisionnelle', coefficient: 1.0 },
          { name: 'SAÉ 4.02 - Reporting multivarié', coefficient: 1.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.01 - Automatisation & test programmation', coefficient: 2.0 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
          { name: 'R4.08 - Préparation / Intégration données', coefficient: 0.25 },
          { name: 'R4.09 - Programmation web', coefficient: 0.25 },
        ],
      },
      {
        code: 'UE 4.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 4.02 - Reporting multivarié', coefficient: 1.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.02 - Méthodes factorielles', coefficient: 2.0 },
          { name: 'R4.03 - Classification automatique', coefficient: 2.0 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 4.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 4.01 - Solution décisionnelle', coefficient: 1.0 },
          { name: 'SAÉ 4.02 - Reporting multivarié', coefficient: 1.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.04 - Anglais scientifique et argumentation', coefficient: 1.5 },
          { name: 'R4.05 - Communication scientifique & argument.', coefficient: 1.5 },
          { name: 'R4.06 - Cadre juridique et économique', coefficient: 1.0 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 4.4',
        name: 'Développer un outil décisionnel (VCOD)',
        subjects: [
          { name: 'SAÉ 4.01 - Solution décisionnelle', coefficient: 2.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
          { name: 'R4.08 - Préparation / Intégration données', coefficient: 1.0 },
          { name: 'R4.09 - Programmation web', coefficient: 1.5 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 4 (2A — PARCOURS EMS)
  // ==========================================
  {
    id: 'but-sd-s4-ems',
    name: 'BUT SD — Semestre 4 (Parcours EMS)',
    shortLabel: 'BUT SD S4 EMS',
    filiere: 'Science des Données — EMS',
    niveau: '2A',
    description: '4 UE : Stage de 8 semaines, Méthodes factorielles, Classification & Modèle linéaire.',
    keywords: ['but', 'sd', 's4', '2a', 'ems', 'stage', 'modele lineaire', 'factorielles', 'regression'],
    units: [
      {
        code: 'UE 4.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 4.02 - Reporting multivarié', coefficient: 1.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.01 - Automatisation & test programmation', coefficient: 2.0 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 4.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 4.01 - Expliquer / prédire une variable quanti.', coefficient: 1.0 },
          { name: 'SAÉ 4.02 - Reporting multivarié', coefficient: 1.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.02 - Méthodes factorielles', coefficient: 2.0 },
          { name: 'R4.03 - Classification automatique', coefficient: 2.0 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 4.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 4.01 - Expliquer / prédire une variable quanti.', coefficient: 1.0 },
          { name: 'SAÉ 4.02 - Reporting multivarié', coefficient: 1.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.04 - Anglais scientifique et argumentation', coefficient: 1.5 },
          { name: 'R4.05 - Communication scientifique & argument.', coefficient: 1.5 },
          { name: 'R4.06 - Cadre juridique et économique', coefficient: 1.0 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 4.4',
        name: 'Modéliser les données (EMS)',
        subjects: [
          { name: 'SAÉ 4.01 - Expliquer / prédire une variable quanti.', coefficient: 2.0 },
          { name: 'Stage (8 semaines)', coefficient: 1.5 },
          { name: 'Portfolio S4', coefficient: 0.5 },
          { name: 'R4.07 - PPP 4', coefficient: 0.5 },
          { name: 'R4.08 - Modèle linéaire', coefficient: 3.0 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 5 (3A — PARCOURS VCOD)
  // ==========================================
  {
    id: 'but-sd-s5-vcod',
    name: 'BUT SD — Semestre 5 (Parcours VCOD)',
    shortLabel: 'BUT SD S5 VCOD',
    filiere: 'Science des Données — VCOD',
    niveau: '3A',
    description: '4 UE : NoSQL, Data mining, SIG, Dév. logiciel & Web visual.',
    keywords: ['but', 'sd', 's5', '3a', 'vcod', 'nosql', 'datamining', 'sig', 'web'],
    units: [
      {
        code: 'UE 5.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 5.01 - Outil décisionnel', coefficient: 2.0 },
          { name: 'SAÉ 5.02 - Migration NoSQL', coefficient: 1.0 },
          { name: 'R5.01 - Bases de données NoSQL', coefficient: 2.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
          { name: 'R5.08 - Système d’Information Géographique (SIG)', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 5.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 5.01 - Outil décisionnel', coefficient: 2.0 },
          { name: 'SAÉ 5.03 - Processus de Datamining', coefficient: 1.0 },
          { name: 'R5.02 - Data mining', coefficient: 3.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 5.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 5.01 - Outil décisionnel', coefficient: 2.0 },
          { name: 'SAÉ 5.02 - Migration NoSQL', coefficient: 0.5 },
          { name: 'SAÉ 5.03 - Processus de Datamining', coefficient: 0.5 },
          { name: 'R5.03 - Anglais pour la coopération internat.', coefficient: 1.0 },
          { name: 'R5.04 - Éthique & responsabilité des données', coefficient: 1.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
          { name: 'R5.09 - Environnement économique & entreprises', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 5.4',
        name: 'Développer un outil décisionnel (VCOD)',
        subjects: [
          { name: 'SAÉ 5.01 - Outil décisionnel', coefficient: 5.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
          { name: 'R5.06 - Développement logiciel', coefficient: 2.0 },
          { name: 'R5.07 - Programmation web pour la visual.', coefficient: 3.0 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 5 (3A — PARCOURS EMS)
  // ==========================================
  {
    id: 'but-sd-s5-ems',
    name: 'BUT SD — Semestre 5 (Parcours EMS)',
    shortLabel: 'BUT SD S5 EMS',
    filiere: 'Science des Données — EMS',
    niveau: '3A',
    description: '4 UE : NoSQL, Data mining, Étude statistique & Modélisation statistique avancée.',
    keywords: ['but', 'sd', 's5', '3a', 'ems', 'modelisation avancee', 'datamining', 'nosql', 'sig'],
    units: [
      {
        code: 'UE 5.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 5.01 - Étude statistique dans un domaine', coefficient: 2.0 },
          { name: 'SAÉ 5.02 - Migration NoSQL', coefficient: 1.0 },
          { name: 'R5.01 - Bases de données NoSQL', coefficient: 2.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
          { name: 'R5.08 - Système d’Information Géographique (SIG)', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 5.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 5.01 - Étude statistique dans un domaine', coefficient: 2.0 },
          { name: 'SAÉ 5.03 - Processus de Datamining', coefficient: 1.0 },
          { name: 'R5.02 - Data mining', coefficient: 3.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
        ],
      },
      {
        code: 'UE 5.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 5.01 - Étude statistique dans un domaine', coefficient: 2.0 },
          { name: 'SAÉ 5.02 - Migration NoSQL', coefficient: 0.5 },
          { name: 'SAÉ 5.03 - Processus de Datamining', coefficient: 0.5 },
          { name: 'R5.03 - Anglais pour la coopération internat.', coefficient: 1.0 },
          { name: 'R5.04 - Éthique & responsabilité des données', coefficient: 1.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
          { name: 'R5.09 - Environnement économique & entreprises', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 5.4',
        name: 'Modéliser les données (EMS)',
        subjects: [
          { name: 'SAÉ 5.01 - Étude statistique dans un domaine', coefficient: 5.0 },
          { name: 'R5.05 - PPP 5', coefficient: 0.5 },
          { name: 'R5.06 - Modélisation statistique avancée', coefficient: 5.0 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 6 (3A — PARCOURS VCOD)
  // ==========================================
  {
    id: 'but-sd-s6-vcod',
    name: 'BUT SD — Semestre 6 (Parcours VCOD)',
    shortLabel: 'BUT SD S6 VCOD',
    filiere: 'Science des Données — VCOD',
    niveau: '3A',
    description: '4 UE : Stage de 14 semaines, Big Data & Approfondissement décisionnel.',
    keywords: ['but', 'sd', 's6', '3a', 'vcod', 'stage', 'big data', 'pfe'],
    units: [
      {
        code: 'UE 6.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 6.01 - Test d’un outil décisionnel', coefficient: 1.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.01 - Big Data : stockage & extraction', coefficient: 2.0 },
        ],
      },
      {
        code: 'UE 6.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 6.01 - Test d’un outil décisionnel', coefficient: 1.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.02 - Méthodes statistiques pour le Big Data', coefficient: 2.0 },
        ],
      },
      {
        code: 'UE 6.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 6.01 - Test d’un outil décisionnel', coefficient: 1.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.03 - Anglais communication d’entreprise', coefficient: 0.5 },
          { name: 'R6.04 - Communication pour le management', coefficient: 0.5 },
          { name: 'R6.06 - Environnement éco. et entreprises 2', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 6.4',
        name: 'Développer un outil décisionnel (VCOD)',
        subjects: [
          { name: 'SAÉ 6.01 - Test d’un outil décisionnel', coefficient: 2.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.05 - Approfondissement en Big Data', coefficient: 3.0 },
        ],
      },
    ],
  },

  // ==========================================
  // SEMESTRE 6 (3A — PARCOURS EMS)
  // ==========================================
  {
    id: 'but-sd-s6-ems',
    name: 'BUT SD — Semestre 6 (Parcours EMS)',
    shortLabel: 'BUT SD S6 EMS',
    filiere: 'Science des Données — EMS',
    niveau: '3A',
    description: '4 UE : Stage de 14 semaines, Big Data & Apprentissage statistique pour l’IA.',
    keywords: ['but', 'sd', 's6', '3a', 'ems', 'stage', 'ia', 'big data', 'apprentissage statistique'],
    units: [
      {
        code: 'UE 6.1',
        name: 'Traiter les données',
        subjects: [
          { name: 'SAÉ 6.01 - Modélisation données complexes & Big Data', coefficient: 1.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.01 - Big Data : stockage & extraction', coefficient: 2.0 },
        ],
      },
      {
        code: 'UE 6.2',
        name: 'Analyser les données',
        subjects: [
          { name: 'SAÉ 6.01 - Modélisation données complexes & Big Data', coefficient: 1.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.02 - Méthodes statistiques pour le Big Data', coefficient: 2.0 },
        ],
      },
      {
        code: 'UE 6.3',
        name: 'Valoriser les données',
        subjects: [
          { name: 'SAÉ 6.01 - Modélisation données complexes & Big Data', coefficient: 1.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.03 - Anglais communication d’entreprise', coefficient: 0.5 },
          { name: 'R6.04 - Communication pour le management', coefficient: 0.5 },
          { name: 'R6.06 - Environnement éco. et entreprises 2', coefficient: 1.0 },
        ],
      },
      {
        code: 'UE 6.4',
        name: 'Modéliser les données (EMS)',
        subjects: [
          { name: 'SAÉ 6.01 - Modélisation données complexes & Big Data', coefficient: 2.0 },
          { name: 'Stage (14 semaines)', coefficient: 3.0 },
          { name: 'Portfolio S6', coefficient: 1.0 },
          { name: 'R6.05 - Apprentissage statistique pour l’IA', coefficient: 3.0 },
        ],
      },
    ],
  },
]