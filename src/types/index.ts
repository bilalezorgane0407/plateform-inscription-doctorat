/**
 * Types definitions for USMBA Doctorat Application Platform
 * Prototype fonctionnel de candidature et d'inscription au doctorat
 * Université Sidi Mohamed Ben Abdellah de Fès
 */

export type AcademicPathway = 
  | 'lmd_master'             // Master Recherche / Spécialisé LMD
  | 'ingenieur'              // Diplôme d'Ingénieur d'État
  | 'etranger_equivalence'   // Diplôme étranger nécessitant équivalence ministérielle
  | 'autre_specifique';      // Diplôme spécifique / passerelle / parcours atypique

export type DocumentStatus = 
  | 'a_deposer'
  | 'recue'
  | 'a_corriger'
  | 'verification_en_cours'
  | 'verification_manuelle_requise'
  | 'verifiee';

export type VerificationMethod = 
  | 'qr_officiel'
  | 'emetteur_direct'
  | 'signature_electronique'
  | 'agent_manuel'
  | 'non_verifie';

export interface OcrExtractedData {
  nom?: { value: string; confidence: number; confirmed: boolean };
  prenom?: { value: string; confidence: number; confirmed: boolean };
  cneMassar?: { value: string; confidence: number; confirmed: boolean };
  cinPassport?: { value: string; confidence: number; confirmed: boolean };
  diplomeIntitule?: { value: string; confidence: number; confirmed: boolean };
  etablissement?: { value: string; confidence: number; confirmed: boolean };
  specialite?: { value: string; confidence: number; confirmed: boolean };
  mention?: { value: string; confidence: number; confirmed: boolean };
  dateObtention?: { value: string; confidence: number; confirmed: boolean };
  rawPreview?: string;
  sourceType?: 'pdf' | 'photo';
}

export interface CandidateDocument {
  id: string;
  code: string; // e.g., 'diplome_bac5', 'releves_notes', 'cin', 'cv', 'projet_recherche', 'arrete_equivalence', 'autorisation_employeur'
  intitule: string;
  description: string;
  obligatoire: boolean;
  applicablePathways: AcademicPathway[];
  statut: DocumentStatus;
  fichierNom?: string;
  fichierTaille?: string;
  fichierDate?: string;
  ocrData?: OcrExtractedData;
  ocrLu: boolean;
  methodeVerification?: VerificationMethod;
  motifCorrection?: string;
  actionAttendue?: string;
  verifiePar?: string;
  dateVerification?: string;
}

export interface EncadrantInfo {
  nom: string;
  titre: string; // e.g. "Professeur de l'Enseignement Supérieur (PES)"
  email: string;
  etablissement: string;
  laboratoire: string;
}

export interface Topic {
  id: string;
  code: string; // e.g. "USMBA-2026-FST-041"
  titre: string;
  resume: string;
  domaine: string;
  cedoc: string; // e.g. "CEDoc Sciences et Technologies (FST / FSDM / ENSA)"
  etablissement: string; // e.g. "FST Fès", "FS Dhar El Mahraz", "ENSA Fès", "ENCG Fès", "FMP Fès", "FSJES Fès"
  laboratoire: string;
  encadrant: EncadrantInfo;
  coEncadrant?: EncadrantInfo;
  specialite: string;
  prerequisPublies: string[];
  diplomesRecevables: AcademicPathway[];
  motsCles: string[];
  anneeUniversitaire: string;
  periodeCandidature: {
    debut: string;
    fin: string;
  };
  nbPostes: number;
  candidaturesRecues: number;
  axeRecherche?: string;
}

export type EligibilityDiagnostic = 
  | 'satisfait'              // « Critères déclarés satisfaits »
  | 'info_manquante'         // « Information manquante »
  | 'examen_humain_requis'   // « Examen humain requis »
  | 'potentiellement_non_satisfait'; // « Critère potentiellement non satisfait »

export interface EligibilityCriterionResult {
  critere: string;
  status: EligibilityDiagnostic;
  details: string;
  infosUtilisees: string;
}

export interface DiagnosticResult {
  diagnosticGlobal: EligibilityDiagnostic;
  titreDiagnostic: string;
  explication: string;
  criteres: EligibilityCriterionResult[];
  necessiteExamenHumain: boolean;
  notesAgent?: string;
}

export interface CandidateProfile {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  cin: string;
  cneMassar: string;
  dateNaissance: string;
  nationalite: string;
  ville: string;
  parcours: AcademicPathway;
  derniereFormation: {
    intituleDiplome: string;
    specialite: string;
    etablissement: string;
    anneeObtention: string;
    mention: string;
    moyenneGenerale: string;
    paysObtention: string;
    numeroEquivalence?: string;
    parcoursAtypiqueDetails?: string;
  };
  estSalarie: boolean;
  employeur?: string;
}

export type ApplicationStatus = 
  | 'brouillon'
  | 'soumise'
  | 'en_cours_verification_pieces'
  | 'pieces_a_corriger'
  | 'verification_validee'
  | 'examen_pedagogique'
  | 'convoque_entretien'
  | 'admis_liste_principale'
  | 'admis_liste_attente'
  | 'non_retenu'
  | 'inscrit_administratif';

export interface AuditHistoryEntry {
  id: string;
  date: string;
  acteur: string;
  role: string;
  action: string;
  motif?: string;
}

export interface Application {
  id: string;
  numeroDossier: string; // e.g., "DOC-2026-USMBA-0482"
  candidat: CandidateProfile;
  sujetsChoisis: Topic[]; // Up to 3, NOT ranked
  documents: CandidateDocument[];
  statut: ApplicationStatus;
  dateCreation: string;
  dateSoumission?: string;
  historique: AuditHistoryEntry[];
  evaluationsEncadrants: Record<string, {
    encadrantNom: string;
    avis: 'favorable' | 'reserve' | 'defavorable' | 'en_attente';
    motif: string;
    date: string;
  }>;
  validationLaboratoire: Record<string, {
    laboratoireNom: string;
    statut: 'en_attente' | 'valide' | 'demande_complement' | 'refuse';
    date?: string;
    motif?: string;
  }>;
  validationCedoc: {
    statut: 'en_attente' | 'convoque' | 'admis' | 'refuse';
    dateEntretien?: string;
    lieuEntretien?: string;
    commentaireCommission?: string;
  };
}

export interface PlatformConfig {
  maxSujetsParCandidat: number; // default 3
  imposerClassementPreference: boolean; // default false
  exigerTroisSujetsObligatoires: boolean; // default false
  anneeUniversitaireActive: string; // "2026-2027"
  dateOuvertureCandidature: string;
  dateClotureCandidature: string;
  dateEntretiens: string;
  dureeConservationAnnees: number; // default 5 ans
  ocrPreVerificationAutomatique: boolean; // default true
  mentionAvertissementPrototype: string;
}

export type UserRole = 
  | 'visiteur'
  | 'candidat'
  | 'professeur'
  | 'laboratoire'
  | 'cedoc'
  | 'agent_verificateur'
  | 'administrateur';
