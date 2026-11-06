import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  Printer, 
  ArrowRight, 
  Building2, 
  User, 
  MessageSquare, 
  Upload, 
  History,
  Info,
  Check
} from 'lucide-react';
import { Application, CandidateDocument, DocumentStatus } from '../types';
import { ReceiptModal } from './ReceiptModal';

interface TrackingViewProps {
  application: Application | null;
  onUpdateDocumentStatus: (docId: string, newStatus: DocumentStatus, fileName?: string) => void;
  onSelectApplicationById?: (appId: string) => void;
  sampleApplications: Application[];
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  application,
  onUpdateDocumentStatus,
  onSelectApplicationById,
  sampleApplications,
}) => {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [correctionFileReplacing, setCorrectionFileReplacing] = useState<string | null>(null);

  // Fallback to first sample application if none selected
  const activeApp = application || sampleApplications[0];

  if (!activeApp) {
    return (
      <div className="py-12 max-w-4xl mx-auto px-4 text-center">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Aucun dossier de candidature trouvé</h3>
        <p className="text-sm text-slate-500">
          Veuillez créer une candidature ou charger un dossier de démonstration ci-dessous.
        </p>
      </div>
    );
  }

  // Calculate timeline progress
  const getTimelineSteps = () => {
    const isSubmitted = activeApp.statut !== 'brouillon';
    const isPiecesChecked = ['verification_validee', 'examen_pedagogique', 'convoque_entretien', 'admis_liste_principale', 'inscrit_administratif'].includes(activeApp.statut);
    const isPiecesNeedFix = activeApp.statut === 'pieces_a_corriger';
    const isPedagogiqueDone = ['convoque_entretien', 'admis_liste_principale', 'inscrit_administratif'].includes(activeApp.statut);
    const isConvoque = ['convoque_entretien', 'admis_liste_principale', 'inscrit_administratif'].includes(activeApp.statut);
    const isAdmis = ['admis_liste_principale', 'inscrit_administratif'].includes(activeApp.statut);
    const isInscrit = activeApp.statut === 'inscrit_administratif';

    return [
      {
        id: 1,
        title: 'Candidature déposée',
        desc: activeApp.dateSoumission ? `Soumis le ${activeApp.dateSoumission}` : 'Enregistré',
        status: isSubmitted ? 'done' : 'current',
      },
      {
        id: 2,
        title: 'Contrôle des pièces',
        desc: isPiecesNeedFix ? 'Une pièce nécessite une correction' : isPiecesChecked ? 'Toutes pièces validées' : 'En cours par le service scolarité',
        status: isPiecesNeedFix ? 'warning' : isPiecesChecked ? 'done' : 'current',
      },
      {
        id: 3,
        title: 'Avis des encadrants & Labos',
        desc: isPedagogiqueDone ? 'Avis favorables émis' : 'En cours d’évaluation scientifique',
        status: isPedagogiqueDone ? 'done' : isPiecesChecked ? 'current' : 'upcoming',
      },
      {
        id: 4,
        title: 'Entretien oral & Commission CEDoc',
        desc: activeApp.validationCedoc?.dateEntretien ? `Convoqué le ${activeApp.validationCedoc.dateEntretien}` : 'Session prévue mi-décembre',
        status: isConvoque ? 'done' : 'upcoming',
      },
      {
        id: 5,
        title: 'Sélection & Inscription',
        desc: isAdmis ? 'Candidat retenu en liste principale' : 'Publication des résultats finaux',
        status: isAdmis ? 'done' : 'upcoming',
      },
    ];
  };

  const timelineSteps = getTimelineSteps();

  // Check if any document is in "À corriger"
  const docsNeedCorrection = activeApp.documents.filter((d) => d.statut === 'a_corriger');

  const handleSimulateReplaceCorrection = (docId: string) => {
    onUpdateDocumentStatus(docId, 'recue', 'Diplome_Master_Scanne_HauteResolution_300DPI.pdf');
    setCorrectionFileReplacing(null);
  };

  return (
    <div className="py-6 sm:py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Sample Dossier Switcher (for prototype testing) */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Tester d’autres dossiers types :
          </span>
          <span className="text-slate-500 hidden md:inline">
            (Exemples représentatifs des différents états d'avancement)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
          {sampleApplications.map((app) => (
            <button
              key={app.id}
              onClick={() => onSelectApplicationById && onSelectApplicationById(app.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                activeApp.id === app.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {app.candidat.prenom} ({app.statut.replace(/_/g, ' ')})
            </button>
          ))}
        </div>
      </div>

      {/* Main Dossier Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-md tabular-nums">
              N° {activeApp.numeroDossier}
            </span>
            <span className="text-xs text-slate-500">
              Déposé le {activeApp.dateSoumission || activeApp.dateCreation}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Suivi de Candidature : {activeApp.candidat.prenom} {activeApp.candidat.nom}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600">
            Parcours : {activeApp.candidat.parcours === 'ingenieur' ? 'Diplôme d’Ingénieur d’État' : activeApp.candidat.parcours === 'lmd_master' ? 'Master Recherche LMD' : 'Diplôme étranger (avec équivalence)'} · {activeApp.sujetsChoisis.length} sujet(s) postulé(s).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-900" />
            <span>Accusé de réception numérique</span>
          </button>
        </div>
      </div>

      {/* ALERT BOX IF A PIECE NEEDS CORRECTION (CRITICAL PROMPT REQUIREMENT) */}
      {docsNeedCorrection.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 shadow-xs space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-red-950">
                Action requise : {docsNeedCorrection.length} pièce(s) à corriger sur votre dossier
              </h3>
              <p className="text-xs sm:text-sm text-red-900">
                <strong>Vous n’avez pas besoin de refaire tout votre dossier.</strong> Corrigez simplement la ou les pièces signalées ci-dessous par le service scolarité de l'USMBA.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {docsNeedCorrection.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-white border border-red-200 rounded-lg shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{doc.intitule}</span>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      À corriger
                    </span>
                  </div>
                  <div className="text-red-950">
                    <strong>Motif : </strong>
                    <span>{doc.motifCorrection || 'Document flou ou illisible'}</span>
                  </div>
                  <div className="text-slate-700">
                    <strong>Action attendue : </strong>
                    <span>{doc.actionAttendue || 'Re-déposer une numérisation nette en couleur (PDF)'}</span>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleSimulateReplaceCorrection(doc.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-amber-300" />
                    <span>Re-déposer cette pièce</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Convocation Card if scheduled */}
      {activeApp.validationCedoc?.dateEntretien && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 shadow-xs flex items-start gap-4">
          <Calendar className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm text-emerald-950">
            <h4 className="font-bold text-emerald-950 text-base">
              Convocation à l’entretien oral d’admissibilité
            </h4>
            <p>
              <strong>Date & Heure : </strong>{activeApp.validationCedoc.dateEntretien}
            </p>
            <p>
              <strong>Lieu : </strong>{activeApp.validationCedoc.lieuEntretien || 'Salle des actes de la Faculté / Établissement de rattachement'}
            </p>
            <p className="text-xs text-emerald-800 pt-1">
              Consignes : {activeApp.validationCedoc.commentaireCommission || 'Munissez-vous de votre CIN originale et de vos originaux de diplômes.'}
            </p>
          </div>
        </div>
      )}

      {/* Timeline of Application Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-blue-900" />
          Chronologie des étapes d’instruction du dossier
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {timelineSteps.map((step) => {
            const isDone = step.status === 'done';
            const isWarning = step.status === 'warning';
            const isCurrent = step.status === 'current';

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs space-y-2 ${
                  isDone
                    ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                    : isWarning
                      ? 'border-red-300 bg-red-50 text-red-950'
                      : isCurrent
                        ? 'border-blue-500 bg-blue-50/50 text-blue-950 font-medium ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider">
                    Étape {step.id}
                  </span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  ) : null}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 leading-snug">{step.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topics Applied to & Supervisor Evaluations */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Statut par sujet de recherche postulé
        </h3>

        <div className="space-y-4">
          {activeApp.sujetsChoisis.map((topic) => {
            const evalEncadrant = activeApp.evaluationsEncadrants[topic.id];
            const labValidation = activeApp.validationLaboratoire[topic.id];

            return (
              <div
                key={topic.id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {topic.code}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {topic.titre}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-0.5">
                      <span>{topic.etablissement}</span>
                      <span>·</span>
                      <span>{topic.laboratoire}</span>
                      <span>·</span>
                      <span>Directeur : {topic.encadrant.nom}</span>
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-auto">
                    {evalEncadrant?.avis === 'favorable' ? (
                      <span className="text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Avis favorable encadrant
                      </span>
                    ) : evalEncadrant?.avis === 'reserve' ? (
                      <span className="text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        Avec réserve
                      </span>
                    ) : (
                      <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        En cours d'examen
                      </span>
                    )}
                  </div>
                </div>

                {/* Supervisor feedback */}
                {evalEncadrant && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-semibold text-slate-900">
                        Appréciation de l'encadrant ({evalEncadrant.encadrantNom}) :
                      </span>
                      <span className="text-[11px] text-slate-400">{evalEncadrant.date}</span>
                    </div>
                    <p className="text-slate-700">{evalEncadrant.motif}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit History Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4.5 h-4.5 text-blue-900" />
          Journal d’audit et traçabilité des décisions
        </h3>
        <p className="text-xs text-slate-500">
          Chaque acteur (candidat, scolarité, encadrant, laboratoire, CEDoc) est horodaté avec motif explicite.
        </p>

        <div className="divide-y divide-slate-100 text-xs">
          {activeApp.historique.map((entry) => (
            <div key={entry.id} className="py-2.5 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900">{entry.acteur}</strong>
                  <span className="text-slate-500 text-[11px]">({entry.role})</span>
                </div>
                <p className="text-slate-700">{entry.action}</p>
                {entry.motif && (
                  <p className="text-slate-500 text-[11px] italic">Motif : {entry.motif}</p>
                )}
              </div>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                {entry.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Official Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          application={activeApp}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
};
