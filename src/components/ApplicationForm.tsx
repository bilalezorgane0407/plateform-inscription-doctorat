import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Eye, 
  Edit3, 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Info, 
  Sparkles,
  HelpCircle,
  FileCheck,
  RotateCw,
  File,
  X
} from 'lucide-react';
import { 
  AcademicPathway, 
  Application, 
  CandidateDocument, 
  CandidateProfile, 
  DocumentStatus, 
  OcrExtractedData, 
  PlatformConfig, 
  Topic,
  VerificationMethod
} from '../types';
import { 
  getRequiredDocumentsForPathway, 
  diagnoseCandidateSubjectFit, 
  simulateOcrExtraction, 
  generateDossierNumber 
} from '../utils/rules';

interface ApplicationFormProps {
  candidateProfile: CandidateProfile;
  selectedTopics: Topic[];
  onUpdateProfile: (profile: CandidateProfile) => void;
  onSubmitApplication: (application: Application) => void;
  config: PlatformConfig;
  onExploreTopics: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({
  candidateProfile,
  selectedTopics,
  onUpdateProfile,
  onSubmitApplication,
  config,
  onExploreTopics,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Local state for documents
  const [documents, setDocuments] = useState<CandidateDocument[]>(() => {
    return getRequiredDocumentsForPathway(
      candidateProfile.parcours,
      candidateProfile.estSalarie
    );
  });

  // Track active OCR extraction modal/drawer
  const [activeOcrDoc, setActiveOcrDoc] = useState<CandidateDocument | null>(null);
  const [ocrWorking, setOcrWorking] = useState(false);
  const [ocrDraftFields, setOcrDraftFields] = useState<OcrExtractedData | null>(null);

  // File upload validation errors
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  // Real file upload with format & size checking
  const handleRealFileUpload = (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setFileErrors((prev) => ({
        ...prev,
        [docId]: 'Format invalide. Seuls les fichiers PDF, JPEG et PNG sont acceptés.',
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFileErrors((prev) => ({
        ...prev,
        [docId]: 'Fichier trop volumineux. La taille maximale autorisée est de 10 Mo.',
      }));
      return;
    }

    // Clear any previous error
    setFileErrors((prev) => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
      : `${Math.round(file.size / 1024)} Ko`;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            statut: 'recue',
            fichierNom: file.name,
            fichierTaille: sizeStr,
            fichierDate: new Date().toLocaleDateString('fr-FR'),
            ocrLu: false,
          };
        }
        return d;
      })
    );
  };

  // Update documents when pathway or salary status changes
  useEffect(() => {
    setDocuments((prevDocs) => {
      const freshDocs = getRequiredDocumentsForPathway(
        candidateProfile.parcours,
        candidateProfile.estSalarie
      );
      // Keep previously uploaded files if same code exists
      return freshDocs.map((fresh) => {
        const existing = prevDocs.find((p) => p.code === fresh.code);
        return existing || fresh;
      });
    });
  }, [candidateProfile.parcours, candidateProfile.estSalarie]);

  // Compute diagnostic for each selected topic
  const topicDiagnostics = selectedTopics.map((t) => ({
    topic: t,
    diagnostic: diagnoseCandidateSubjectFit(candidateProfile, t, documents),
  }));

  // Handle OCR simulation on a document
  const handleStartOcrSimulation = (doc: CandidateDocument) => {
    setActiveOcrDoc(doc);
    setOcrWorking(true);
    setTimeout(() => {
      const extracted = simulateOcrExtraction(doc.code, candidateProfile.parcours, candidateProfile);
      setOcrDraftFields(extracted);
      setOcrWorking(false);
    }, 700);
  };

  // Confirm OCR extracted values
  const handleConfirmOcrFields = () => {
    if (!activeOcrDoc || !ocrDraftFields) return;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === activeOcrDoc.id) {
          return {
            ...d,
            statut: 'recue',
            fichierNom: `${d.code}_scan_certifie.pdf`,
            fichierTaille: '1.4 Mo',
            fichierDate: new Date().toLocaleDateString('fr-FR'),
            ocrLu: true,
            ocrData: ocrDraftFields,
            // Per rule 9 & F: scan / OCR is NOT automatically authenticated!
            methodeVerification: d.code === 'cin_passeport' ? 'qr_officiel' : 'agent_manuel',
          };
        }
        return d;
      })
    );

    // Auto-update profile with verified fields if confirmed
    if (ocrDraftFields.diplomeIntitule?.value) {
      onUpdateProfile({
        ...candidateProfile,
        derniereFormation: {
          ...candidateProfile.derniereFormation,
          intituleDiplome: ocrDraftFields.diplomeIntitule.value,
          etablissement: ocrDraftFields.etablissement?.value || candidateProfile.derniereFormation.etablissement,
          mention: ocrDraftFields.mention?.value || candidateProfile.derniereFormation.mention,
        },
      });
    }

    setActiveOcrDoc(null);
    setOcrDraftFields(null);
  };

  // Handle direct file upload simulation
  const handleSimulateUpload = (docId: string, fileName: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          return {
            ...d,
            statut: 'recue',
            fichierNom: fileName,
            fichierTaille: '1.2 Mo',
            fichierDate: new Date().toLocaleDateString('fr-FR'),
            ocrLu: false,
          };
        }
        return d;
      })
    );
  };

  // Status badge styling helper
  const renderStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'verifiee':
        return (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Vérifiée
          </span>
        );
      case 'recue':
        return (
          <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Reçue
          </span>
        );
      case 'a_corriger':
        return (
          <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            À corriger
          </span>
        );
      case 'verification_manuelle_requise':
        return (
          <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            Vérification manuelle requise
          </span>
        );
      case 'verification_en_cours':
        return (
          <span className="text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
            Vérification en cours
          </span>
        );
      default:
        return (
          <span className="text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            À déposer
          </span>
        );
    }
  };

  const mandatoryPendingCount = documents.filter(
    (d) => d.obligatoire && (d.statut === 'a_deposer' || d.statut === 'a_corriger')
  ).length;

  // Final submission handler
  const handleFinalSubmit = () => {
    const num = generateDossierNumber(482, '2026');
    const newApp: Application = {
      id: `app-${Date.now()}`,
      numeroDossier: num,
      candidat: candidateProfile,
      sujetsChoisis: selectedTopics,
      documents: documents,
      statut: 'soumise',
      dateCreation: new Date().toLocaleDateString('fr-FR'),
      dateSoumission: `${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      historique: [
        {
          id: `h-${Date.now()}`,
          date: `${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          acteur: `${candidateProfile.prenom} ${candidateProfile.nom}`,
          role: 'Candidat',
          action: `Soumission du dossier de candidature avec ${selectedTopics.length} sujet(s) de thèse.`,
        },
      ],
      evaluationsEncadrants: Object.fromEntries(
        selectedTopics.map((t) => [
          t.id,
          {
            encadrantNom: t.encadrant.nom,
            avis: 'en_attente',
            motif: 'Dossier transmis au directeur de thèse pour évaluation scientifique.',
            date: new Date().toLocaleDateString('fr-FR'),
          },
        ])
      ),
      validationLaboratoire: Object.fromEntries(
        selectedTopics.map((t) => [
          t.id,
          {
            laboratoireNom: t.laboratoire,
            statut: 'en_attente',
          },
        ])
      ),
      validationCedoc: {
        statut: 'en_attente',
      },
    };

    onSubmitApplication(newApp);
  };

  return (
    <div className="py-6 sm:py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Stepper Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          <button
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
              currentStep === 1
                ? 'bg-blue-900 text-white font-bold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              1
            </div>
            <div className="truncate">
              <span className="text-xs block">Étape 1</span>
              <span className="text-xs font-semibold block truncate">Profil & Parcours</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
              currentStep === 2
                ? 'bg-blue-900 text-white font-bold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </div>
            <div className="truncate">
              <span className="text-xs block">Étape 2</span>
              <span className="text-xs font-semibold block truncate">Pièces & OCR</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
              currentStep === 3
                ? 'bg-blue-900 text-white font-bold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              3
            </div>
            <div className="truncate">
              <span className="text-xs block">Étape 3</span>
              <span className="text-xs font-semibold block truncate">Aide à l’Adéquation</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentStep(4)}
            className={`p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
              currentStep === 4
                ? 'bg-blue-900 text-white font-bold'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 4 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              4
            </div>
            <div className="truncate">
              <span className="text-xs block">Étape 4</span>
              <span className="text-xs font-semibold block truncate">Validation & Envoi</span>
            </div>
          </button>

        </div>
      </div>

      {/* Selected Topics banner reminder */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sujets retenus pour ce dossier ({selectedTopics.length} / {config.maxSujetsParCandidat})
          </span>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-blue-950">
            {selectedTopics.map((t) => (
              <span key={t.id} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {t.code} · {t.titre.substring(0, 48)}...
              </span>
            ))}
          </div>
          <span className="text-[11px] text-slate-500 italic block">
            Rappel : Les sujets ne sont pas hiérarchisés par préférence.
          </span>
        </div>

        <button
          onClick={onExploreTopics}
          className="text-xs font-semibold text-blue-900 hover:underline shrink-0"
        >
          Modifier mes choix
        </button>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PROFIL & PARCOURS ACADÉMIQUE */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Profil du candidat et cursus académique de base
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Précisez votre parcours afin d'ajuster la liste conditionnelle des pièces justificatives.
            </p>
          </div>

          {/* Academic Pathway selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Type de parcours universitaire *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'lmd_master',
                  title: 'Parcours LMD : Master de Recherche ou Spécialisé',
                  desc: 'Diplôme conférant le grade de Master (Bac+5) délivré par une université marocaine.',
                },
                {
                  id: 'ingenieur',
                  title: 'Parcours Ingénieur : Diplôme d’Ingénieur d’État',
                  desc: 'Diplôme d’Ingénieur d’État (Bac+5) délivré par une école ou institut national (ENSA, FST, etc.).',
                },
                {
                  id: 'etranger_equivalence',
                  title: 'Diplôme étranger (équivalence ministérielle)',
                  desc: 'Diplôme obtenu à l’étranger avec arrêté ministériel d’équivalence ou récépissé officiel.',
                },
                {
                  id: 'autre_specifique',
                  title: 'Autre parcours / Passerelle spécifique',
                  desc: 'Parcours atypique, validation des acquis ou diplôme équivalent à examiner par la commission.',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onUpdateProfile({
                      ...candidateProfile,
                      parcours: opt.id as AcademicPathway,
                    })
                  }
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    candidateProfile.parcours === opt.id
                      ? 'border-blue-900 ring-2 ring-blue-900/10 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{opt.title}</span>
                    {candidateProfile.parcours === opt.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Specific Pathway notice */}
          {candidateProfile.parcours === 'etranger_equivalence' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <strong className="font-semibold block flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-800" />
                Examen humain obligatoire pour les diplômes étrangers
              </strong>
              <p>
                Conformément aux directives de l'USMBA, aucun rejet automatique n'est appliqué aux diplômes étrangers. 
                Une commission pédagogique examinera l'équivalence ministérielle et les relevés de notes complets.
              </p>
            </div>
          )}

          {/* Detailed Formation Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intitulé précis du dernier diplôme *
              </label>
              <input
                type="text"
                value={candidateProfile.derniereFormation.intituleDiplome}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    derniereFormation: {
                      ...candidateProfile.derniereFormation,
                      intituleDiplome: e.target.value,
                    },
                  })
                }
                placeholder="ex. Master de Recherche en Intelligence Artificielle"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Spécialité / Option *
              </label>
              <input
                type="text"
                value={candidateProfile.derniereFormation.specialite}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    derniereFormation: {
                      ...candidateProfile.derniereFormation,
                      specialite: e.target.value,
                    },
                  })
                }
                placeholder="ex. Génie Logiciel, Data Science, Thermique..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Établissement émetteur *
              </label>
              <input
                type="text"
                value={candidateProfile.derniereFormation.etablissement}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    derniereFormation: {
                      ...candidateProfile.derniereFormation,
                      etablissement: e.target.value,
                    },
                  })
                }
                placeholder="ex. FST Fès, ENSA Fès, Université de Strasbourg..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Année d’obtention du diplôme *
              </label>
              <input
                type="text"
                value={candidateProfile.derniereFormation.anneeObtention}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    derniereFormation: {
                      ...candidateProfile.derniereFormation,
                      anneeObtention: e.target.value,
                    },
                  })
                }
                placeholder="ex. 2026"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mention obtenue
              </label>
              <input
                type="text"
                value={candidateProfile.derniereFormation.mention}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    derniereFormation: {
                      ...candidateProfile.derniereFormation,
                      mention: e.target.value,
                    },
                  })
                }
                placeholder="ex. Très Bien, Bien, Assez Bien"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Moyenne générale (/20)
              </label>
              <input
                type="text"
                value={candidateProfile.derniereFormation.moyenneGenerale}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    derniereFormation: {
                      ...candidateProfile.derniereFormation,
                      moyenneGenerale: e.target.value,
                    },
                  })
                }
                placeholder="ex. 15.20"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Professional Status toggle */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Situation professionnelle (Candidat salarié)
              </span>
              <span className="text-xs text-slate-500">
                Si vous êtes en activité professionnelle, une autorisation formelle de l'employeur est exigée par le CEDoc.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={candidateProfile.estSalarie}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    estSalarie: e.target.checked,
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
            </label>
          </div>

          {candidateProfile.estSalarie && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organisme employeur / Entreprise
              </label>
              <input
                type="text"
                value={candidateProfile.employeur || ''}
                onChange={(e) =>
                  onUpdateProfile({
                    ...candidateProfile,
                    employeur: e.target.value,
                  })
                }
                placeholder="ex. Ministère de la Santé, Société Générale Maroc, Entreprise privée..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Valider le profil et passer aux pièces</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DÉPÔT DES PIÈCES & OCR AVEC EXTRACTION/CONFIRMATION */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          
          {/* Advice card for readable photos */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-blue-900" />
              Consignes pour des pièces nettes et immédiatement vérifiables
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 font-semibold block">Document entier</strong>
                <span>Les 4 coins doivent être visibles sans rognage des signatures ou sceaux.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 font-semibold block">Bonne luminosité</strong>
                <span>Privilégiez la lumière naturelle, sans flash direct ni ombres portées.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <strong className="text-slate-900 font-semibold block">Format & Lisibilité</strong>
                <span>Formats acceptés : PDF haute résolution ou JPEG/PNG haute qualité.</span>
              </div>
            </div>
          </div>

          {/* Administrative Disclaimer for Document Checklist */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-900 block">Note de conception (Prototype) :</strong>
              <span>
                La liste des pièces exigées et les critères d’admissibilité constituent des hypothèses de travail pour ce prototype et doivent être confirmés par les autorités compétentes de l’USMBA avant tout déploiement officiel.
              </span>
            </div>
          </div>

          {/* Checklist of dynamic required documents */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Checklist personnalisée des pièces ({documents.length} pièces demandées)
                </h3>
                <p className="text-xs text-slate-500">
                  Adaptée à votre statut : {candidateProfile.parcours === 'ingenieur' ? 'Ingénieur d’État' : candidateProfile.parcours === 'lmd_master' ? 'Master LMD' : 'Diplôme étranger avec équivalence'}.
                </p>
              </div>

              <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg tabular-nums self-start sm:self-auto">
                {documents.filter((d) => d.statut !== 'a_deposer').length} / {documents.length} déposée{documents.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* List of documents */}
            <div className="space-y-4">
              {documents.map((doc) => {
                const isNeedCorrection = doc.statut === 'a_corriger';
                const fileError = fileErrors[doc.id];
                const isForeignAtypical = candidateProfile.parcours === 'etranger_equivalence' || candidateProfile.parcours === 'autre_specifique' || doc.code === 'arrete_equivalence';

                return (
                  <div
                    key={doc.id}
                    className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3 ${
                      isNeedCorrection
                        ? 'border-red-300 bg-red-50/40'
                        : doc.statut === 'recue' || doc.statut === 'verifiee'
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            {doc.intitule}
                          </span>
                          {doc.obligatoire ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                              Obligatoire
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              Optionnel
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {doc.description}
                        </p>

                        {/* File attached information */}
                        {doc.fichierNom && (
                          <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
                            <span className="flex items-center gap-1 text-blue-900 font-semibold">
                              <File className="w-3.5 h-3.5" />
                              {doc.fichierNom}
                            </span>
                            <span>{doc.fichierTaille}</span>
                            <span>Déposé le {doc.fichierDate}</span>
                          </div>
                        )}

                        {/* Inline upload error message */}
                        {fileError && (
                          <div className="p-2 bg-red-100 border border-red-300 rounded-lg text-xs text-red-900 font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-700 shrink-0" />
                            <span>{fileError}</span>
                          </div>
                        )}

                        {/* Specific Correction reason if marked "À corriger" */}
                        {isNeedCorrection && (
                          <div className="mt-2 p-3 bg-red-100/70 border border-red-300 rounded-lg text-xs text-red-950 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-red-900">
                              <AlertTriangle className="w-4 h-4 text-red-700" />
                              <span>Motif de la demande de correction :</span>
                            </div>
                            <p>{doc.motifCorrection}</p>
                            <div className="font-semibold text-red-900 pt-0.5">
                              Action attendue : <span className="font-normal">{doc.actionAttendue}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right side: Status and actions */}
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        {renderStatusBadge(doc.statut)}

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* Real file upload input */}
                          <label className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-slate-600" />
                            <span>{doc.statut === 'a_deposer' ? 'Sélectionner fichier' : 'Remplacer'}</span>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                              onChange={(e) => handleRealFileUpload(doc.id, e)}
                              className="hidden"
                            />
                          </label>

                          {/* Quick simulated OCR assistant for diploma & CIN */}
                          {(doc.code === 'diplome_master' || doc.code === 'diplome_ingenieur' || doc.code === 'cin_passeport') && (
                            <button
                              onClick={() => handleStartOcrSimulation(doc)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                              title="Déclencher l'analyse OCR assistée"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>{doc.statut === 'a_deposer' ? 'Aide OCR' : 'Re-scanner OCR'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Visually Separated 4 Document Status Indicators */}
                    {doc.statut !== 'a_deposer' && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                            États de vérification du document :
                          </span>
                          <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Démonstration — vérification réelle non connectée
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          {/* 1. OCR Extraction status */}
                          <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                            doc.ocrLu
                              ? 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Texte extrait par OCR</span>
                          </div>

                          {/* 2. Candidate confirmed status */}
                          <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                            doc.ocrLu && doc.ocrData
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Confirmé par candidat</span>
                          </div>

                          {/* 3. Issuer verification pending */}
                          <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                            doc.statut === 'recue' || doc.statut === 'verification_en_cours'
                              ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Vérif. émetteur en attente</span>
                          </div>

                          {/* 4. Human examination required */}
                          <div className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                            isForeignAtypical || doc.statut === 'verification_manuelle_requise'
                              ? 'bg-purple-50 border-purple-200 text-purple-900 font-medium'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Examen humain requis</span>
                          </div>
                        </div>

                        {/* OCR text display if available */}
                        {doc.ocrLu && doc.ocrData && (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                            <span>
                              Données lues : Nom : <strong>{doc.ocrData.nom?.value || candidateProfile.nom}</strong> · Diplôme : <strong>{doc.ocrData.diplomeIntitule?.value || candidateProfile.derniereFormation.intituleDiplome}</strong>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                              OCR ≠ Authentification officielle
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Bottom navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour au profil</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Étape suivante : Diagnostic d’adéquation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: AIDE AU TRI & DIAGNOSTIC D’ADÉQUATION (STRICT CONFORMITY REQUIREMENT G) */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Aide au tri et diagnostic d’adéquation aux critères publiés
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ce module compare votre profil déclaré et les pièces justificatives fournies aux critères de chaque sujet sélectionné.
              </p>
            </div>

            {/* Mandatory Principle Banner */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
                <span>Garanties administratives de l’Université Sidi Mohamed Ben Abdellah :</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>
                  <strong>Aucun rejet automatique :</strong> Une simple divergence entre le titre de votre diplôme et celui du sujet ne provoque pas de refus automatique.
                </li>
                <li>
                  <strong>Examen humain systématique :</strong> Les équivalences ministérielles, diplômes étrangers et parcours atypiques sont instruits par les enseignants-chercheurs et la commission du CEDoc.
                </li>
                <li>
                  <strong>Droit de correction :</strong> Vous pouvez rectifier à tout moment une donnée issue de l'OCR ou apporter une pièce complémentaire.
                </li>
              </ul>
            </div>

            {/* Diagnostics for each chosen topic */}
            <div className="space-y-5 pt-2">
              {topicDiagnostics.map(({ topic, diagnostic }, index) => {
                
                // Color badge for the 4 exact diagnostic labels
                const getDiagBadge = () => {
                  switch (diagnostic.diagnosticGlobal) {
                    case 'satisfait':
                      return (
                        <span className="text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Critères déclarés satisfaits
                        </span>
                      );
                    case 'info_manquante':
                      return (
                        <span className="text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          Information manquante
                        </span>
                      );
                    case 'examen_humain_requis':
                      return (
                        <span className="text-blue-900 bg-blue-50 border border-blue-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-blue-700" />
                          Examen humain requis
                        </span>
                      );
                    case 'potentiellement_non_satisfait':
                      return (
                        <span className="text-purple-900 bg-purple-50 border border-purple-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <Info className="w-4 h-4 text-purple-700" />
                          Critère potentiellement non satisfait
                        </span>
                      );
                  }
                };

                return (
                  <div
                    key={topic.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {topic.code} · Sujet sélectionné
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {topic.titre}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                          <span>{topic.domaine}</span>
                          <span>·</span>
                          <span>Encadrant : {topic.encadrant.nom}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {getDiagBadge()}
                      </div>
                    </div>

                    {/* Overall diagnostic narrative */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                      <strong className="text-slate-900 font-semibold block mb-0.5">
                        Diagnostic de recevabilité : {diagnostic.titreDiagnostic}
                      </strong>
                      <p>{diagnostic.explication}</p>
                    </div>

                    {/* Breakdown per criteria */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        Détail des critères examinés :
                      </span>
                      {diagnostic.criteres.map((crit, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-lg border border-slate-200 text-xs space-y-1 bg-white"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{crit.critere}</span>
                            <span className="text-[11px] font-semibold text-slate-600">
                              Statut : {crit.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-600">{crit.details}</p>
                          <div className="text-[11px] text-slate-500 pt-0.5 italic">
                            Données utilisées : {crit.infosUtilisees}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Bottom navigation */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour aux pièces</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Passer au récapitulatif & soumission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: RÉCAPITULATIF & SOUMISSION DÉFINITIVE */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Récapitulatif général de la candidature
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Vérifiez l’ensemble des informations avant la transmission définitive de votre dossier.
            </p>
          </div>

          {/* Dossier Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Identity & Contact */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block text-sm">
                État Civil & Identifiants
              </span>
              <div>
                <span className="text-slate-500 block">Nom & Prénom</span>
                <span className="font-semibold text-slate-900">{candidateProfile.nom} {candidateProfile.prenom}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">CIN / Passeport</span>
                  <span className="font-semibold text-slate-900 font-mono">{candidateProfile.cin}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">CNE / MASSAR</span>
                  <span className="font-semibold text-slate-900 font-mono">{candidateProfile.cneMassar}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block">Courriel de contact</span>
                <span className="font-semibold text-slate-900">{candidateProfile.email}</span>
              </div>
            </div>

            {/* Academic profile */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block text-sm">
                Cursus Universitaire
              </span>
              <div>
                <span className="text-slate-500 block">Parcours de base</span>
                <span className="font-semibold text-slate-900">
                  {candidateProfile.parcours === 'ingenieur' ? 'Diplôme d’Ingénieur d’État' : candidateProfile.parcours === 'lmd_master' ? 'Master LMD' : 'Diplôme étranger avec équivalence'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Dernier diplôme & Établissement</span>
                <span className="font-semibold text-slate-900">
                  {candidateProfile.derniereFormation.intituleDiplome} ({candidateProfile.derniereFormation.etablissement})
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block">Mention / Moyenne</span>
                  <span className="font-semibold text-slate-900">
                    {candidateProfile.derniereFormation.mention} ({candidateProfile.derniereFormation.moyenneGenerale}/20)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Situation</span>
                  <span className="font-semibold text-slate-900">
                    {candidateProfile.estSalarie ? `Salarié (${candidateProfile.employeur})` : 'Non salarié (Disponible)'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Chosen Topics */}
          {/* Chosen Topics with Dynamic Diagnostic Badges (Fix Rule 18) */}
          <div className="p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
              {selectedTopics.length} Sujet(s) postulé(s) (sans hiérarchisation)
            </span>
            <div className="space-y-2">
              {selectedTopics.map((t) => {
                const topicDiag = topicDiagnostics.find((item) => item.topic.id === t.id)?.diagnostic;
                const status = topicDiag?.diagnosticGlobal;

                let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                let badgeLabel = 'Critères déclarés satisfaits';
                if (status === 'info_manquante') {
                  badgeColor = 'text-amber-800 bg-amber-50 border-amber-300';
                  badgeLabel = 'Information manquante';
                } else if (status === 'examen_humain_requis') {
                  badgeColor = 'text-blue-800 bg-blue-50 border-blue-300';
                  badgeLabel = 'Examen humain requis';
                } else if (status === 'potentiellement_non_satisfait') {
                  badgeColor = 'text-purple-800 bg-purple-50 border-purple-300';
                  badgeLabel = 'Critère à examiner';
                }

                return (
                  <div key={t.id} className="p-3 bg-slate-50 rounded-lg text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-[11px] text-slate-600 font-bold mr-2">{t.code}</span>
                      <strong className="text-slate-900">{t.titre}</strong>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {t.etablissement} · {t.laboratoire} · Encadrant : {t.encadrant.nom}
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending warning if mandatory docs missing */}
          {mandatoryPendingCount > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900 block">
                  Attention : {mandatoryPendingCount} pièce(s) obligatoire(s) sont encore en attente ou à corriger.
                </strong>
                <span>
                  Vous pouvez enregistrer votre dossier comme brouillon pour le compléter ultérieurement, ou soumettre si vous avez déposé les pièces requises.
                </span>
              </div>
            </div>
          )}

          {/* Final Submission Statement */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="mt-0.5 rounded border-slate-300 text-blue-900" />
              <span>
                Je certifie sur l’honneur l’exactitude de l’ensemble des informations déclarées et des documents joints à cette candidature pour l’Université Sidi Mohamed Ben Abdellah de Fès. Je prends acte qu'un récépissé numérique avec horodatage me sera délivré.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au diagnostic</span>
            </button>

            <button
              onClick={handleFinalSubmit}
              className="px-6 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer ring-2 ring-blue-900/20"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>Confirmer et soumettre définitivement ma candidature</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* OCR EXTRACTION & VERIFICATION MODAL (SCREEN 8 - REQUIREMENT F) */}
      {/* ========================================================================= */}
      {activeOcrDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => { setActiveOcrDoc(null); setOcrDraftFields(null); }}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Extraction optique OCR assistée</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                Lecture et confirmation : {activeOcrDoc.intitule}
              </h3>
              
              {/* Critical Rule 9 & F separation note */}
              <p className="text-xs text-slate-300 mt-1">
                La lecture OCR extrait le texte pour vous éviter les répétitions de saisie. Elle ne constitue pas une authentification du document.
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              
              {ocrWorking ? (
                <div className="py-12 text-center space-y-3">
                  <RotateCw className="w-8 h-8 text-blue-900 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-800">
                    Analyse du document et reconnaissance optique en cours...
                  </p>
                  <p className="text-xs text-slate-500">
                    Détection des sceaux, intitulé de diplôme, nom et notes.
                  </p>
                </div>
              ) : ocrDraftFields ? (
                <div className="space-y-4">
                  
                  {/* Visual separation banner */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-900 block">Vérification obligatoire par le candidat :</strong>
                      Veuillez vérifier et corriger si nécessaire les champs extraits ci-dessous. Les valeurs à confiance modérée sont signalées en ambre.
                    </div>
                  </div>

                  {/* Raw simulated snippet */}
                  {ocrDraftFields.rawPreview && (
                    <div className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                        Flux brut détecté sur le document :
                      </span>
                      <pre className="whitespace-pre-wrap text-[11px]">{ocrDraftFields.rawPreview}</pre>
                    </div>
                  )}

                  {/* Form fields for candidate confirmation */}
                  <div className="space-y-3">
                    
                    {ocrDraftFields.nom && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Nom de famille extrait</label>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            ocrDraftFields.nom.confidence > 0.9 
                              ? 'text-emerald-800 bg-emerald-50' 
                              : 'text-amber-800 bg-amber-50'
                          }`}>
                            Confiance : {Math.round(ocrDraftFields.nom.confidence * 100)}%
                          </span>
                        </div>
                        <input
                          type="text"
                          value={ocrDraftFields.nom.value}
                          onChange={(e) =>
                            setOcrDraftFields({
                              ...ocrDraftFields,
                              nom: { ...ocrDraftFields.nom!, value: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 font-semibold"
                        />
                      </div>
                    )}

                    {ocrDraftFields.prenom && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Prénom extrait</label>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                            Confiance : {Math.round(ocrDraftFields.prenom.confidence * 100)}%
                          </span>
                        </div>
                        <input
                          type="text"
                          value={ocrDraftFields.prenom.value}
                          onChange={(e) =>
                            setOcrDraftFields({
                              ...ocrDraftFields,
                              prenom: { ...ocrDraftFields.prenom!, value: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 font-semibold"
                        />
                      </div>
                    )}

                    {ocrDraftFields.diplomeIntitule && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Intitulé du diplôme extrait</label>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                            Confiance : {Math.round(ocrDraftFields.diplomeIntitule.confidence * 100)}%
                          </span>
                        </div>
                        <input
                          type="text"
                          value={ocrDraftFields.diplomeIntitule.value}
                          onChange={(e) =>
                            setOcrDraftFields({
                              ...ocrDraftFields,
                              diplomeIntitule: { ...ocrDraftFields.diplomeIntitule!, value: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    )}

                    {ocrDraftFields.etablissement && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Établissement émetteur</label>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                            Confiance : {Math.round(ocrDraftFields.etablissement.confidence * 100)}%
                          </span>
                        </div>
                        <input
                          type="text"
                          value={ocrDraftFields.etablissement.value}
                          onChange={(e) =>
                            setOcrDraftFields({
                              ...ocrDraftFields,
                              etablissement: { ...ocrDraftFields.etablissement!, value: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    )}

                    {ocrDraftFields.mention && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">Mention & moyenne détectée</label>
                          <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold">
                            Vérifier manuellement ({Math.round(ocrDraftFields.mention.confidence * 100)}%)
                          </span>
                        </div>
                        <input
                          type="text"
                          value={ocrDraftFields.mention.value}
                          onChange={(e) =>
                            setOcrDraftFields({
                              ...ocrDraftFields,
                              mention: { ...ocrDraftFields.mention!, value: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 text-xs border border-amber-300 rounded-lg text-slate-900 bg-amber-50/20"
                        />
                      </div>
                    )}

                  </div>

                </div>
              ) : null}

            </div>

            {/* Modal footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => { setActiveOcrDoc(null); setOcrDraftFields(null); }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                onClick={handleConfirmOcrFields}
                disabled={ocrWorking}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Confirmer et valider cette pièce</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
