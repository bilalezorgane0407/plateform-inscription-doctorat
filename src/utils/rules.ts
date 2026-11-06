/**
 * Business logic and regulatory rules engine for USMBA Doctorat
 * Prototype fonctionnel - Université Sidi Mohamed Ben Abdellah de Fès
 */

import {
  AcademicPathway,
  CandidateDocument,
  CandidateProfile,
  DiagnosticResult,
  EligibilityCriterionResult,
  EligibilityDiagnostic,
  OcrExtractedData,
  PlatformConfig,
  Topic,
} from '../types/index';

/**
 * Base document templates according to pathway and regulatory requirements
 */
export function getRequiredDocumentsForPathway(
  pathway: AcademicPathway,
  isSalarie: boolean = false
): CandidateDocument[] {
  const commonDocs: CandidateDocument[] = [
    {
      id: 'doc-cin',
      code: 'cin_passeport',
      intitule: 'Carte d’Identité Nationale ou Passeport',
      description: 'Copie recto-verso nette et lisible en couleur ou PDF haute résolution (sans reflets).',
      obligatoire: true,
      applicablePathways: ['lmd_master', 'ingenieur', 'etranger_equivalence', 'autre_specifique'],
      statut: 'a_deposer',
      ocrLu: false,
    },
    {
      id: 'doc-photo',
      code: 'photo_identite',
      intitule: 'Photo d’identité récente (format officiel)',
      description: 'Photo d’identité récente de face, sur fond clair neutre.',
      obligatoire: true,
      applicablePathways: ['lmd_master', 'ingenieur', 'etranger_equivalence', 'autre_specifique'],
      statut: 'a_deposer',
      ocrLu: false,
    },
    {
      id: 'doc-cv',
      code: 'cv_detaille',
      intitule: 'Curriculum Vitae détaillé et actualisé',
      description: 'CV mentionnant le parcours universitaire, les projets de fin d’études, compétences et publications éventuelles.',
      obligatoire: true,
      applicablePathways: ['lmd_master', 'ingenieur', 'etranger_equivalence', 'autre_specifique'],
      statut: 'a_deposer',
      ocrLu: false,
    },
    {
      id: 'doc-projet',
      code: 'projet_recherche',
      intitule: 'Projet de recherche doctoral / Lettre de motivation scientifique',
      description: 'Synthèse de 3 à 5 pages décrivant l’intérêt pour le sujet, l’état de l’art préliminaire et la méthodologie envisagée.',
      obligatoire: true,
      applicablePathways: ['lmd_master', 'ingenieur', 'etranger_equivalence', 'autre_specifique'],
      statut: 'a_deposer',
      ocrLu: false,
    },
  ];

  const pathwaySpecificDocs: Record<AcademicPathway, CandidateDocument[]> = {
    lmd_master: [
      {
        id: 'doc-master-diplome',
        code: 'diplome_master',
        intitule: 'Diplôme de Master ou Attestation de réussite',
        description: 'Original ou copie certifiée du Master (Recherche ou Spécialisé) reconnu par l’État.',
        obligatoire: true,
        applicablePathways: ['lmd_master'],
        statut: 'a_deposer',
        ocrLu: false,
      },
      {
        id: 'doc-master-notes',
        code: 'releves_notes_master',
        intitule: 'Relevés de notes des 4 semestres du Master (S1, S2, S3, S4)',
        description: 'Relevés officiels comportant les notes, moyennes et mentions de chaque semestre.',
        obligatoire: true,
        applicablePathways: ['lmd_master'],
        statut: 'a_deposer',
        ocrLu: false,
      },
      {
        id: 'doc-licence',
        code: 'diplome_licence_releves',
        intitule: 'Diplôme de Licence et relevés de notes (S1 à S6)',
        description: 'Diplôme de Licence Fondamentale ou Professionnelle et ensemble des relevés de notes.',
        obligatoire: true,
        applicablePathways: ['lmd_master'],
        statut: 'a_deposer',
        ocrLu: false,
      },
    ],
    ingenieur: [
      {
        id: 'doc-ingenieur-diplome',
        code: 'diplome_ingenieur',
        intitule: 'Diplôme d’Ingénieur d’État',
        description: 'Diplôme d’Ingénieur d’État délivré par un établissement reconnu (ENSA, EMI, ENSIAS, FST, etc.).',
        obligatoire: true,
        applicablePathways: ['ingenieur'],
        statut: 'a_deposer',
        ocrLu: false,
      },
      {
        id: 'doc-ingenieur-notes',
        code: 'releves_notes_ingenieur',
        intitule: 'Relevés de notes des 5 années d’études (ou cycle préparatoire + cycle ingénieur)',
        description: 'Relevés complets attestant du cursus d’ingénieur de 5 ans.',
        obligatoire: true,
        applicablePathways: ['ingenieur'],
        statut: 'a_deposer',
        ocrLu: false,
      },
      {
        id: 'doc-ingenieur-classement',
        code: 'attestation_classement',
        intitule: 'Attestation de classement dans la promotion (si disponible)',
        description: 'Document officiel délivré par la direction des études de l’école d’ingénieurs.',
        obligatoire: false,
        applicablePathways: ['ingenieur'],
        statut: 'a_deposer',
        ocrLu: false,
      },
    ],
    etranger_equivalence: [
      {
        id: 'doc-etranger-diplome',
        code: 'diplome_etranger_original',
        intitule: 'Diplôme étranger original et traduction officielle assermentée',
        description: 'Diplôme conférant le grade de Master ou équivalent délivré par une université étrangère.',
        obligatoire: true,
        applicablePathways: ['etranger_equivalence'],
        statut: 'a_deposer',
        ocrLu: false,
      },
      {
        id: 'doc-arrete-equivalence',
        code: 'arrete_equivalence_ministere',
        intitule: 'Arrêté officiel d’équivalence ou récépissé officiel du Ministère',
        description: 'Décision d’équivalence publiée au Bulletin Officiel ou attestation délivrée par le Ministère de l’Enseignement Supérieur du Maroc.',
        obligatoire: true,
        applicablePathways: ['etranger_equivalence'],
        statut: 'a_deposer',
        ocrLu: false,
      },
      {
        id: 'doc-etranger-releves',
        code: 'releves_notes_cursus_complet',
        intitule: 'Relevés de notes de l’ensemble du cursus universitaire',
        description: 'Relevés détaillés avec système de notation et coefficient des matières.',
        obligatoire: true,
        applicablePathways: ['etranger_equivalence'],
        statut: 'a_deposer',
        ocrLu: false,
      },
    ],
    autre_specifique: [
      {
        id: 'doc-diplome-specifique',
        code: 'diplome_specifique',
        intitule: 'Diplômes antérieurs et justificatifs de parcours',
        description: 'Tout diplôme de niveau Bac+5 justifiant l’accès aux études doctorales.',
        obligatoire: true,
        applicablePathways: ['autre_specifique'],
        statut: 'a_deposer',
        ocrLu: false,
      },
      {
        id: 'doc-travaux-recherche',
        code: 'memoire_travaux_recherche',
        intitule: 'Mémoire de fin d’études ou travaux scientifiques réalisés',
        description: 'Exemplaire numérique du mémoire ou articles déjà publiés.',
        obligatoire: true,
        applicablePathways: ['autre_specifique'],
        statut: 'a_deposer',
        ocrLu: false,
      },
    ],
  };

  const situationDoc: CandidateDocument = isSalarie
    ? {
        id: 'doc-autorisation-employeur',
        code: 'autorisation_employeur',
        intitule: 'Autorisation formelle de l’employeur pour les études doctorales',
        description: 'Attestation signée par la direction des ressources humaines autorisant la poursuite des recherches doctorales.',
        obligatoire: true,
        applicablePathways: ['lmd_master', 'ingenieur', 'etranger_equivalence', 'autre_specifique'],
        statut: 'a_deposer',
        ocrLu: false,
      }
    : {
        id: 'doc-declaration-non-emploi',
        code: 'declaration_non_emploi',
        intitule: 'Déclaration sur l’honneur de non-emploi ou attestation CNSS',
        description: 'Engagement de disponibilité pour les activités de recherche au sein du laboratoire d’accueil.',
        obligatoire: false,
        applicablePathways: ['lmd_master', 'ingenieur', 'etranger_equivalence', 'autre_specifique'],
        statut: 'a_deposer',
        ocrLu: false,
      };

  return [...commonDocs, ...pathwaySpecificDocs[pathway], situationDoc];
}

/**
 * Diagnostic logic linking candidate profile, topic criteria and document state.
 * Implements strict requirement G:
 * - 4 exact diagnostics:
 *   « Critères déclarés satisfaits »
 *   « Information manquante »
 *   « Examen humain requis »
 *   « Critère potentiellement non satisfait »
 * - Never reject automatically for name variance
 * - Human review for foreign degrees / equivalence / atypical paths
 */
export function diagnoseCandidateSubjectFit(
  profile: CandidateProfile,
  topic: Topic,
  documents: CandidateDocument[]
): DiagnosticResult {
  const criteres: EligibilityCriterionResult[] = [];

  // 1. Diplôme recevable
  const isPathwayAllowed = topic.diplomesRecevables.includes(profile.parcours);
  if (profile.parcours === 'etranger_equivalence') {
    criteres.push({
      critere: 'Recevabilité du diplôme étranger',
      status: 'examen_humain_requis',
      details: 'Examen humain obligatoire : validation requise de la conformité de l’arrêté d’équivalence ministérielle par la commission du CEDoc.',
      infosUtilisees: `Diplôme étranger déclaré : ${profile.derniereFormation.intituleDiplome || 'Non précisé'} (${profile.derniereFormation.paysObtention || 'Pays non précisé'}). N° équivalence : ${profile.derniereFormation.numeroEquivalence || 'À vérifier'}.`,
    });
  } else if (profile.parcours === 'autre_specifique') {
    criteres.push({
      critere: 'Parcours spécifique / atypique',
      status: 'examen_humain_requis',
      details: 'Parcours atypique soumis à l’appréciation de l’équipe pédagogique et du directeur de thèse.',
      infosUtilisees: `Détails déclarés : ${profile.derniereFormation.parcoursAtypiqueDetails || profile.derniereFormation.intituleDiplome || 'Non renseigné'}.`,
    });
  } else if (!isPathwayAllowed) {
    criteres.push({
      critere: 'Type de cursus recevable',
      status: 'potentiellement_non_satisfait',
      details: `Le sujet a publié une restriction aux parcours [${topic.diplomesRecevables.join(', ')}]. Le profil déclare un parcours [${profile.parcours}].`,
      infosUtilisees: `Parcours déclaré: ${profile.parcours}. Parcours publiés autorisés: ${topic.diplomesRecevables.join(', ')}.`,
    });
  } else {
    criteres.push({
      critere: 'Type de cursus recevable',
      status: 'satisfait',
      details: `Le diplôme déclaré (${profile.parcours === 'ingenieur' ? 'Ingénieur d’État' : 'Master LMD'}) correspond aux types de parcours acceptés pour ce sujet.`,
      infosUtilisees: `Cursus : ${profile.parcours === 'ingenieur' ? 'Ingénieur d’État' : 'Master LMD'}, Établissement : ${profile.derniereFormation.etablissement || 'USMBA'}.`,
    });
  }

  // 2. Pièces justificatives obligatoires
  const mandatoryDocs = documents.filter((d) => d.obligatoire);
  const missingOrUnreadDocs = mandatoryDocs.filter(
    (d) => d.statut === 'a_deposer' || d.statut === 'a_corriger'
  );
  if (missingOrUnreadDocs.length > 0) {
    criteres.push({
      critere: 'Dépôt des pièces obligatoires',
      status: 'info_manquante',
      details: `${missingOrUnreadDocs.length} pièce(s) obligatoire(s) manquante(s) ou nécessitant une correction (${missingOrUnreadDocs.map((d) => d.intitule).join(', ')}).`,
      infosUtilisees: `Pièces en attente : ${missingOrUnreadDocs.map((d) => d.intitule).join(', ')}.`,
    });
  } else {
    criteres.push({
      critere: 'Dépôt des pièces obligatoires',
      status: 'satisfait',
      details: 'Toutes les pièces obligatoires exigées pour votre parcours ont été déposées.',
      infosUtilisees: `${mandatoryDocs.length} pièces fournies et enregistrées.`,
    });
  }

  // 3. Adéquation de la spécialité et prérequis
  const candSpec = (profile.derniereFormation.specialite || '').toLowerCase();
  const candDipl = (profile.derniereFormation.intituleDiplome || '').toLowerCase();
  const topicSpec = (topic.specialite || '').toLowerCase();
  const topicDom = (topic.domaine || '').toLowerCase();

  // Words analysis to prevent naive keyword mismatch rejection
  const candWords = `${candSpec} ${candDipl}`.split(/[\s,;/-]+/).filter((w) => w.length > 3);
  const topicWords = `${topicSpec} ${topicDom} ${topic.motsCles.join(' ')}`.toLowerCase();

  const hasDirectMatch = candWords.some((word) => topicWords.includes(word));
  
  if (!candSpec && !candDipl) {
    criteres.push({
      critere: 'Spécialité du diplôme antérieur',
      status: 'info_manquante',
      details: 'L’intitulé de la spécialité ou du diplôme antérieur n’est pas encore renseigné.',
      infosUtilisees: 'Champs spécialité et intitulé vides dans le profil.',
    });
  } else if (hasDirectMatch) {
    criteres.push({
      critere: 'Adéquation de la spécialité et des compétences',
      status: 'satisfait',
      details: `La spécialité déclarée (${profile.derniereFormation.specialite}) présente une correspondance directe avec le domaine du sujet (${topic.domaine}).`,
      infosUtilisees: `Spécialité déclarée: "${profile.derniereFormation.specialite}" / Domaine sujet: "${topic.domaine}"`,
    });
  } else {
    // DO NOT automatically reject: flag for human examination!
    criteres.push({
      critere: 'Adéquation de la spécialité et des compétences',
      status: 'examen_humain_requis',
      details: 'La spécialité déclarée diffère de l’intitulé publié sans être incompatible. Un examen scientifique par l’encadrant est nécessaire pour évaluer les compétences transversales.',
      infosUtilisees: `Spécialité déclarée: "${profile.derniereFormation.specialite || 'Généraliste'}" vs Spécialité requise: "${topic.specialite}".`,
    });
  }

  // Synthesis of Global Diagnostic
  let diagnosticGlobal: EligibilityDiagnostic = 'satisfait';
  let titreDiagnostic = 'Critères déclarés satisfaits';
  let explication = 'Sur la base des déclarations et documents fournis, votre profil correspond aux critères initiaux du sujet.';
  let necessiteExamenHumain = false;

  if (criteres.some((c) => c.status === 'info_manquante')) {
    diagnosticGlobal = 'info_manquante';
    titreDiagnostic = 'Information manquante';
    explication = 'Des informations ou pièces justificatives indispensables doivent être complétées pour instruire votre candidature.';
  } else if (criteres.some((c) => c.status === 'potentiellement_non_satisfait')) {
    diagnosticGlobal = 'potentiellement_non_satisfait';
    titreDiagnostic = 'Critère potentiellement non satisfait';
    explication = 'Un ou plusieurs critères publiés par le laboratoire ne semblent pas remplis. Un examen humain approfondi reste possible sur demande motivée.';
  } else if (criteres.some((c) => c.status === 'examen_humain_requis')) {
    diagnosticGlobal = 'examen_humain_requis';
    titreDiagnostic = 'Examen humain requis';
    explication = 'Votre dossier présente une situation spécifique (diplôme étranger, équivalence, ou parcours transversal) qui sera examinée avec bienveillance par la commission scientifique.';
    necessiteExamenHumain = true;
  }

  return {
    diagnosticGlobal,
    titreDiagnostic,
    explication,
    criteres,
    necessiteExamenHumain,
  };
}

/**
 * Validates cart rules according to user configuration
 */
export function validateCartSelection(
  count: number,
  config: PlatformConfig
): { valide: boolean; message?: string } {
  if (count === 0) {
    return { valide: false, message: 'Veuillez sélectionner au moins un sujet de thèse.' };
  }
  if (count > config.maxSujetsParCandidat) {
    return {
      valide: false,
      message: `Vous ne pouvez pas sélectionner plus de ${config.maxSujetsParCandidat} sujets (actuellement ${count}).`,
    };
  }
  if (config.exigerTroisSujetsObligatoires && count < 3) {
    return {
      valide: false,
      message: 'La règle administrative configurée exige obligatoirement 3 choix de sujets.',
    };
  }
  return { valide: true };
}

/**
 * Generate official dossier tracking reference
 */
export function generateDossierNumber(sequence: number, annee: string = '2026'): string {
  const pad = String(sequence).padStart(4, '0');
  return `DOC-${annee}-USMBA-${pad}`;
}

/**
 * Simulate OCR field extraction from a sample document
 */
export function simulateOcrExtraction(
  docCode: string,
  pathway: AcademicPathway,
  candidatDefault?: Partial<CandidateProfile>
): OcrExtractedData {
  if (docCode === 'cin_passeport') {
    return {
      nom: { value: candidatDefault?.nom || 'EL AMRANI', confidence: 0.98, confirmed: false },
      prenom: { value: candidatDefault?.prenom || 'Mehdi', confidence: 0.97, confirmed: false },
      cinPassport: { value: candidatDefault?.cin || 'CD718942', confidence: 0.94, confirmed: false },
      dateObtention: { value: '2021-04-12', confidence: 0.88, confirmed: false },
      rawPreview: `ROYAUME DU MAROC / CARTE NATIONALE D'IDENTITE\nNom: ${candidatDefault?.nom || 'EL AMRANI'}\nPrénom: ${candidatDefault?.prenom || 'Mehdi'}\nN°: ${candidatDefault?.cin || 'CD718942'}\nValable jusqu'au: 12/04/2031`,
      sourceType: 'photo',
    };
  }

  if (docCode === 'diplome_master' || docCode === 'diplome_ingenieur' || docCode === 'diplome_etranger_original') {
    const isIng = pathway === 'ingenieur';
    const isEtr = pathway === 'etranger_equivalence';
    
    return {
      nom: { value: candidatDefault?.nom || 'EL AMRANI', confidence: 0.96, confirmed: false },
      prenom: { value: candidatDefault?.prenom || 'Mehdi', confidence: 0.95, confirmed: false },
      cneMassar: { value: candidatDefault?.cneMassar || 'R138492041', confidence: 0.91, confirmed: false },
      diplomeIntitule: {
        value: isIng 
          ? 'Diplôme d’Ingénieur d’État en Génie Informatique' 
          : isEtr 
            ? 'Master Européen en Sciences des Données et Systèmes Complexes'
            : 'Master de Recherche en Intelligence Artificielle & Systèmes Embarqués',
        confidence: 0.89,
        confirmed: false,
      },
      etablissement: {
        value: isIng
          ? 'École Nationale des Sciences Appliquées de Fès (ENSA)'
          : isEtr
            ? 'Université de Lyon / INSA Lyon (France)'
            : 'Faculté des Sciences Dhar El Mahraz - USMBA Fès',
        confidence: 0.93,
        confirmed: false,
      },
      specialite: {
        value: isIng ? 'Génie Logiciel & Data' : 'Informatique et Intelligence Artificielle',
        confidence: 0.85,
        confirmed: false,
      },
      mention: {
        value: 'Bien (Moyenne : 14.85/20)',
        confidence: 0.76, // intentionally moderate confidence to prompt candidate verification!
        confirmed: false,
      },
      dateObtention: {
        value: '2026-07-15',
        confidence: 0.92,
        confirmed: false,
      },
      rawPreview: `RÉPUBLIQUE / ROYAUME - ATTESTATION OFFICIELLE DE DIPLÔME\nLe Doyen/Directeur atteste que M./Mme ${candidatDefault?.nom || 'EL AMRANI'} ${candidatDefault?.prenom || 'Mehdi'}\nN° CNE/MASSAR: ${candidatDefault?.cneMassar || 'R138492041'}\na obtenu avec succès le grade Bac+5.\nMention: Bien - Session Juillet 2026`,
      sourceType: 'pdf',
    };
  }

  return {
    rawPreview: 'Document textuel numérisé. Analyse optique préliminaire effectuée.',
    sourceType: 'pdf',
  };
}
