import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRequiredDocumentsForPathway,
  diagnoseCandidateSubjectFit,
  validateCartSelection,
  generateDossierNumber,
} from './rules.ts';
import { CandidateProfile, PlatformConfig, Topic } from '../types/index.ts';

const mockConfig: PlatformConfig = {
  maxSujetsParCandidat: 3,
  imposerClassementPreference: false,
  exigerTroisSujetsObligatoires: false,
  anneeUniversitaireActive: '2026-2027',
  dateOuvertureCandidature: '2026-09-01',
  dateClotureCandidature: '2026-11-30',
  dateEntretiens: '2026-12-15',
  dureeConservationAnnees: 5,
  ocrPreVerificationAutomatique: true,
  mentionAvertissementPrototype: 'Prototype USMBA',
};

const mockTopic: Topic = {
  id: 't-1',
  code: 'USMBA-2026-FST-01',
  titre: 'Apprentissage profond et vision par ordinateur appliqués à l’agriculture de précision dans la région Fès-Meknès',
  resume: 'Développement de modèles IA pour l’analyse multispectrale des cultures.',
  domaine: 'Informatique & IA',
  cedoc: 'CEDoc Sciences et Technologies',
  etablissement: 'FST Fès',
  laboratoire: 'Laboratoire d’Informatique, Systèmes et Télécommunications (LIST)',
  encadrant: {
    nom: 'Pr. Karim BENJELLOUN',
    titre: 'Professeur de l’Enseignement Supérieur',
    email: 'k.benjelloun@usmba.ac.ma',
    etablissement: 'FST Fès',
    laboratoire: 'LIST',
  },
  specialite: 'Informatique et Intelligence Artificielle',
  prerequisPublies: ['Python', 'PyTorch', 'Vision par ordinateur'],
  diplomesRecevables: ['lmd_master', 'ingenieur', 'etranger_equivalence'],
  motsCles: ['IA', 'Vision par ordinateur', 'Agriculture', 'Deep Learning'],
  anneeUniversitaire: '2026-2027',
  periodeCandidature: { debut: '2026-09-01', fin: '2026-11-30' },
  nbPostes: 1,
  candidaturesRecues: 4,
};

test('Cart selection permits 1, 2, or 3 topics without requiring exactly 3', () => {
  const result1 = validateCartSelection(1, mockConfig);
  assert.equal(result1.valide, true);

  const result2 = validateCartSelection(2, mockConfig);
  assert.equal(result2.valide, true);

  const result3 = validateCartSelection(3, mockConfig);
  assert.equal(result3.valide, true);

  const result0 = validateCartSelection(0, mockConfig);
  assert.equal(result0.valide, false);

  const result4 = validateCartSelection(4, mockConfig);
  assert.equal(result4.valide, false);
});

test('Document requirements differ between LMD and Engineering pathway', () => {
  const lmdDocs = getRequiredDocumentsForPathway('lmd_master');
  const ingDocs = getRequiredDocumentsForPathway('ingenieur');
  const etrDocs = getRequiredDocumentsForPathway('etranger_equivalence');

  assert.ok(lmdDocs.some((d) => d.code === 'diplome_master'));
  assert.ok(!lmdDocs.some((d) => d.code === 'diplome_ingenieur'));

  assert.ok(ingDocs.some((d) => d.code === 'diplome_ingenieur'));
  assert.ok(ingDocs.some((d) => d.code === 'releves_notes_ingenieur'));

  assert.ok(etrDocs.some((d) => d.code === 'arrete_equivalence_ministere'));
});

test('Foreign diploma with equivalence triggers "Examen humain requis"', () => {
  const candidateEtranger: CandidateProfile = {
    id: 'c-etranger',
    nom: 'ALAMI',
    prenom: 'Salma',
    email: 's.alami@example.com',
    telephone: '0612345678',
    cin: 'CD999111',
    cneMassar: 'R140998822',
    dateNaissance: '2000-05-10',
    nationalite: 'Marocaine',
    ville: 'Fès',
    parcours: 'etranger_equivalence',
    derniereFormation: {
      intituleDiplome: 'Master Sciences des Données',
      specialite: 'Informatique et Intelligence Artificielle',
      etablissement: 'Université de Bordeaux',
      anneeObtention: '2026',
      mention: 'Très Bien',
      moyenneGenerale: '16.2',
      paysObtention: 'France',
      numeroEquivalence: 'EQ-2026-MESRSFC-849',
    },
    estSalarie: false,
  };

  const docs = getRequiredDocumentsForPathway('etranger_equivalence').map((d) => ({
    ...d,
    statut: 'recue' as const,
  }));

  const diagnostic = diagnoseCandidateSubjectFit(candidateEtranger, mockTopic, docs);
  assert.equal(diagnostic.diagnosticGlobal, 'examen_humain_requis');
  assert.equal(diagnostic.titreDiagnostic, 'Examen humain requis');
  assert.equal(diagnostic.necessiteExamenHumain, true);
});

test('Missing mandatory documents result in "Information manquante"', () => {
  const candidateLmd: CandidateProfile = {
    id: 'c-lmd',
    nom: 'EL AMRANI',
    prenom: 'Mehdi',
    email: 'm.elamrani@example.com',
    telephone: '0655443322',
    cin: 'CD718942',
    cneMassar: 'R138492041',
    dateNaissance: '2001-02-14',
    nationalite: 'Marocaine',
    ville: 'Fès',
    parcours: 'lmd_master',
    derniereFormation: {
      intituleDiplome: 'Master Recherche Informatique',
      specialite: 'Informatique et Intelligence Artificielle',
      etablissement: 'Faculté des Sciences Dhar El Mahraz Fès',
      anneeObtention: '2026',
      mention: 'Bien',
      moyenneGenerale: '14.85',
      paysObtention: 'Maroc',
    },
    estSalarie: false,
  };

  // Keep docs in 'a_deposer'
  const docs = getRequiredDocumentsForPathway('lmd_master');
  const diagnostic = diagnoseCandidateSubjectFit(candidateLmd, mockTopic, docs);

  assert.equal(diagnostic.diagnosticGlobal, 'info_manquante');
  assert.equal(diagnostic.titreDiagnostic, 'Information manquante');
});

test('Fully compliant engineer candidate with all docs uploaded gets "Critères déclarés satisfaits"', () => {
  const candidateIngenieur: CandidateProfile = {
    id: 'c-ing',
    nom: 'BENNANI',
    prenom: 'Yassine',
    email: 'y.bennani@example.com',
    telephone: '0666778899',
    cin: 'CD654321',
    cneMassar: 'N134567890',
    dateNaissance: '2000-09-21',
    nationalite: 'Marocaine',
    ville: 'Fès',
    parcours: 'ingenieur',
    derniereFormation: {
      intituleDiplome: 'Diplôme d’Ingénieur d’État en Génie Informatique',
      specialite: 'Informatique et Intelligence Artificielle',
      etablissement: 'ENSA Fès',
      anneeObtention: '2026',
      mention: 'Très Bien',
      moyenneGenerale: '15.9',
      paysObtention: 'Maroc',
    },
    estSalarie: false,
  };

  const docs = getRequiredDocumentsForPathway('ingenieur').map((d) => ({
    ...d,
    statut: 'recue' as const,
  }));

  const diagnostic = diagnoseCandidateSubjectFit(candidateIngenieur, mockTopic, docs);
  assert.equal(diagnostic.diagnosticGlobal, 'satisfait');
  assert.equal(diagnostic.titreDiagnostic, 'Critères déclarés satisfaits');
});

test('generateDossierNumber formats proper USMBA reference', () => {
  const num = generateDossierNumber(482, '2026');
  assert.equal(num, 'DOC-2026-USMBA-0482');
});
