import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Search,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import { Application, CandidateDocument, DocumentStatus } from '../types';

interface AgentVerificationWorkspaceProps {
  applications: Application[];
  selectedAppId: string;
  onSelectApplication: (id: string) => void;
  onUpdateDocVerification: (
    appId: string,
    docId: string,
    status: DocumentStatus,
    method: 'agent_manuel' | 'non_verifie',
    motif?: string,
    actionAttendue?: string,
  ) => void;
  onUpdateApplicationStatus: (appId: string, status: Application['statut'], historyLog: string) => void;
}

type QueueFilter = 'a_traiter' | 'corrections' | 'tous';

const statusLabel: Record<DocumentStatus, string> = {
  a_deposer: 'À déposer',
  recue: 'À contrôler',
  a_corriger: 'Correction demandée',
  verification_en_cours: 'Contrôle en cours',
  verification_manuelle_requise: 'Examen humain requis',
  verifiee: 'Contrôle terminé',
};

const correctionReasons = [
  'Document manquant ou non déposé',
  'Document illisible ou flou',
  'Document incomplet ou page manquante',
  'Pièce déposée incorrecte',
  'Information à clarifier',
  'Autre motif',
];

const getRequiredProgress = (documents: CandidateDocument[]) => {
  const required = documents.filter((document) => document.obligatoire);
  return {
    checked: required.filter((document) => document.statut === 'verifiee').length,
    total: required.length,
  };
};

export const AgentVerificationWorkspace: React.FC<AgentVerificationWorkspaceProps> = ({
  applications,
  selectedAppId,
  onSelectApplication,
  onUpdateDocVerification,
  onUpdateApplicationStatus,
}) => {
  const [search, setSearch] = useState('');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('a_traiter');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showIdentifiers, setShowIdentifiers] = useState(false);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState(correctionReasons[0]);
  const [correctionDetails, setCorrectionDetails] = useState('');
  const [actionExpected, setActionExpected] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedApplication = applications.find((application) => application.id === selectedAppId) ?? applications[0];

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('fr');
    return applications.filter((application) => {
      const hasCorrection = application.documents.some((document) => document.statut === 'a_corriger');
      const hasWork = application.documents.some((document) =>
        document.obligatoire && ['recue', 'verification_en_cours', 'verification_manuelle_requise'].includes(document.statut),
      );
      const matchesFilter = queueFilter === 'tous'
        || (queueFilter === 'corrections' ? hasCorrection : hasWork || ['soumise', 'en_cours_verification_pieces'].includes(application.statut));
      const haystack = `${application.numeroDossier} ${application.candidat.nom} ${application.candidat.prenom}`.toLocaleLowerCase('fr');
      return matchesFilter && (!query || haystack.includes(query));
    });
  }, [applications, queueFilter, search]);

  const selectedDocument = selectedApplication?.documents.find((document) => document.id === selectedDocumentId)
    ?? selectedApplication?.documents.find((document) => document.statut !== 'verifiee')
    ?? selectedApplication?.documents[0];
  const selectedDocumentIndex = selectedApplication && selectedDocument
    ? selectedApplication.documents.findIndex((document) => document.id === selectedDocument.id)
    : -1;

  const progress = selectedApplication ? getRequiredProgress(selectedApplication.documents) : { checked: 0, total: 0 };
  const mandatoryDocumentsComplete = progress.total > 0 && progress.checked === progress.total;
  const pendingCorrectionCount = applications.reduce(
    (count, application) => count + application.documents.filter((document) => document.statut === 'a_corriger').length,
    0,
  );
  const pendingReviewCount = applications.reduce(
    (count, application) => count + application.documents.filter((document) =>
      document.obligatoire && ['recue', 'verification_en_cours', 'verification_manuelle_requise'].includes(document.statut),
    ).length,
    0,
  );

  const formatIdentity = (value: string) => showIdentifiers || value.length < 5
    ? value
    : `${'•'.repeat(Math.max(3, value.length - 3))}${value.slice(-3)}`;

  const saveDecision = (
    status: DocumentStatus,
    method: 'agent_manuel' | 'non_verifie',
    motif: string,
    action?: string,
  ) => {
    if (!selectedApplication || !selectedDocument) return;
    onUpdateDocVerification(selectedApplication.id, selectedDocument.id, status, method, motif, action);
    setNotice({
      type: 'success',
      text: status === 'verifiee'
        ? `Contrôle administratif mis à jour dans la démonstration pour « ${selectedDocument.intitule} ».`
        : status === 'a_corriger'
          ? `Demande de correction simulée pour « ${selectedDocument.intitule} ».`
          : `Examen humain simulé pour « ${selectedDocument.intitule} ».`,
    });
    setCorrectionOpen(false);
    setCorrectionDetails('');
    setActionExpected('');
  };

  const saveCorrection = () => {
    if (!correctionDetails.trim() || !actionExpected.trim()) {
      setNotice({ type: 'error', text: 'Ajoutez une explication et indiquez l’action attendue du candidat.' });
      return;
    }
    saveDecision('a_corriger', 'agent_manuel', `${correctionReason} — ${correctionDetails.trim()}`, actionExpected.trim());
  };

  if (!selectedApplication) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <FileCheck2 className="mx-auto h-8 w-8 text-slate-400" />
        <h3 className="mt-3 text-lg font-bold text-slate-900">Aucun dossier à afficher</h3>
        <p className="mt-1 text-sm text-slate-600">Les dossiers apparaîtront ici lorsqu’ils seront transmis au contrôle.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <FileCheck2 className="h-5 w-5" aria-hidden="true" />
              Contrôle administratif des pièces
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Dossiers à examiner</h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Ouvrez une pièce, examinez-la, puis enregistrez une décision avec son motif. L’OCR aide à lire le document; il ne confirme pas son authenticité.
            </p>
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
              Mode démonstration : les décisions et les fichiers restent temporaires dans cette session. Aucun stockage sécurisé ni envoi réel au candidat n’est connecté.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
            <div className="rounded-xl bg-blue-50 px-3 py-2.5">
              <span className="block text-xs text-blue-800">Pièces à contrôler</span>
              <strong className="text-xl text-blue-950">{pendingReviewCount}</strong>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2.5">
              <span className="block text-xs text-amber-900">Corrections en attente</span>
              <strong className="text-xl text-amber-950">{pendingCorrectionCount}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <label htmlFor="agent-queue-search" className="mb-1.5 block text-sm font-semibold text-slate-800">Rechercher un dossier</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
              <input
                id="agent-queue-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom ou numéro de dossier"
                className="min-h-11 w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1" aria-label="Filtrer les dossiers">
              {([
                ['a_traiter', 'À traiter'],
                ['corrections', 'Corrections'],
                ['tous', 'Tous'],
              ] as const).map(([filter, label]) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setQueueFilter(filter)}
                  aria-pressed={queueFilter === filter}
                  className={`min-h-9 rounded-md px-2 text-xs font-semibold ${queueFilter === filter ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto pr-1" aria-label="Dossiers correspondants">
              {visibleApplications.map((application) => {
                const currentProgress = getRequiredProgress(application.documents);
                const corrections = application.documents.filter((document) => document.statut === 'a_corriger').length;
                const active = application.id === selectedApplication.id;
                return (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => {
                      onSelectApplication(application.id);
                      setSelectedDocumentId(null);
                      setNotice(null);
                      setCorrectionOpen(false);
                    }}
                    aria-current={active ? 'true' : undefined}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${active ? 'border-blue-800 bg-blue-50 ring-2 ring-blue-800/10' : 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span>
                        <strong className="block text-sm text-slate-950">{application.candidat.prenom} {application.candidat.nom}</strong>
                        <span className="mt-0.5 block font-mono text-[11px] text-slate-600">{application.numeroDossier}</span>
                      </span>
                      {corrections > 0 && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-900">{corrections} correction{corrections > 1 ? 's' : ''}</span>
                      )}
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2 text-xs text-slate-600">
                      <span>{currentProgress.checked}/{currentProgress.total} pièces obligatoires contrôlées</span>
                      <span className="font-semibold text-blue-900">Ouvrir</span>
                    </span>
                  </button>
                );
              })}
              {visibleApplications.length === 0 && (
                <div className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-600">
                  Aucun dossier ne correspond. Essayez « Tous » ou modifiez votre recherche.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-950">Pièces du dossier</h3>
                <p className="text-xs text-slate-600">Sélectionnez une ligne pour l’examiner.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{selectedApplication.documents.length}</span>
            </div>
            <div className="max-h-[360px] space-y-1 overflow-y-auto pr-1">
              {selectedApplication.documents.map((document) => {
                const active = selectedDocument?.id === document.id;
                const icon = document.statut === 'verifiee'
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                  : document.statut === 'a_corriger'
                    ? <AlertTriangle className="h-4 w-4 text-red-700" aria-hidden="true" />
                    : document.statut === 'verification_manuelle_requise'
                      ? <Clock3 className="h-4 w-4 text-amber-700" aria-hidden="true" />
                      : <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />;
                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocumentId(document.id);
                      setCorrectionOpen(false);
                      setNotice(null);
                    }}
                    className={`flex min-h-12 w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left ${active ? 'border-blue-700 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <span className="mt-0.5">{icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-900">{document.intitule}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-600">{statusLabel[document.statut]}{document.obligatoire ? ' · obligatoire' : ' · facultative'}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-100 p-2.5 text-blue-900"><UserRound className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <span className="font-mono text-xs font-bold text-blue-900">{selectedApplication.numeroDossier}</span>
                  <h2 className="mt-0.5 text-lg font-bold text-slate-950">{selectedApplication.candidat.prenom} {selectedApplication.candidat.nom}</h2>
                  <p className="text-sm text-slate-600">{selectedApplication.candidat.derniereFormation.intituleDiplome || 'Parcours académique à préciser'} · {selectedApplication.candidat.parcours === 'ingenieur' ? 'Parcours ingénieur' : selectedApplication.candidat.parcours === 'lmd_master' ? 'Parcours LMD' : 'Parcours à examiner'}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900">{progress.checked}/{progress.total} pièces obligatoires contrôlées</span>
                <button
                  type="button"
                  onClick={() => setShowIdentifiers((value) => !value)}
                  className="min-h-9 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  aria-pressed={showIdentifiers}
                >
                  <Eye className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                  {showIdentifiers ? 'Masquer identifiants' : 'Afficher identifiants'}
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
              <p><span className="text-slate-600">CIN / passeport : </span><strong dir="auto" className="font-mono text-slate-900">{formatIdentity(selectedApplication.candidat.cin || 'Non renseigné')}</strong></p>
              <p><span className="text-slate-600">CNE / MASSAR : </span><strong dir="auto" className="font-mono text-slate-900">{formatIdentity(selectedApplication.candidat.cneMassar || 'Non renseigné')}</strong></p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {selectedDocument ? (
              <>
                <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-950">{selectedDocument.intitule}</h3>
                    <p className="mt-0.5 text-xs text-slate-600">{selectedDocument.fichierNom || 'Aucun nom de fichier'}{selectedDocument.fichierTaille ? ` · ${selectedDocument.fichierTaille}` : ''}{selectedDocument.fichierDate ? ` · Déposé le ${selectedDocument.fichierDate}` : ''}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${selectedDocument.statut === 'verifiee' ? 'bg-emerald-100 text-emerald-900' : selectedDocument.statut === 'a_corriger' ? 'bg-red-100 text-red-900' : selectedDocument.statut === 'verification_manuelle_requise' ? 'bg-amber-100 text-amber-950' : 'bg-blue-50 text-blue-950'}`}>
                      {selectedDocument.statut === 'verifiee' ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Clock3 className="h-4 w-4" aria-hidden="true" />}
                      {statusLabel[selectedDocument.statut]}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={selectedDocumentIndex <= 0}
                        onClick={() => setSelectedDocumentId(selectedApplication.documents[selectedDocumentIndex - 1].id)}
                        className="min-h-9 rounded-lg border border-slate-300 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Précédente
                      </button>
                      <span className="px-1 text-xs tabular-nums text-slate-600">{selectedDocumentIndex + 1}/{selectedApplication.documents.length}</span>
                      <button
                        type="button"
                        disabled={selectedDocumentIndex < 0 || selectedDocumentIndex >= selectedApplication.documents.length - 1}
                        onClick={() => setSelectedDocumentId(selectedApplication.documents[selectedDocumentIndex + 1].id)}
                        className="min-h-9 rounded-lg border border-slate-300 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Suivante
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
                  <div className="min-h-[300px] border-b border-slate-200 bg-slate-100 p-3 lg:border-b-0 lg:border-r">
                    <div className="flex h-[320px] items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white sm:h-[420px]">
                      {selectedDocument.fichierApercuUrl && selectedDocument.fichierTypeMime === 'application/pdf' ? (
                        <iframe src={selectedDocument.fichierApercuUrl} title={`Aperçu de ${selectedDocument.intitule}`} className="h-full w-full" />
                      ) : selectedDocument.fichierApercuUrl && selectedDocument.fichierTypeMime?.startsWith('image/') ? (
                        <img src={selectedDocument.fichierApercuUrl} alt={`Aperçu de ${selectedDocument.intitule}`} className="h-full w-full object-contain" />
                      ) : (
                        <div className="max-w-sm px-6 text-center">
                          <FileText className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
                          <p className="mt-3 font-semibold text-slate-800">Aperçu indisponible</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {selectedDocument.fichierNom
                              ? 'Un nom de fichier est présent, mais son contenu n’est pas disponible pour lecture. Le nom seul ne suffit pas pour valider cette pièce.'
                              : 'Aucun fichier n’est associé à cette pièce. Lors du test, déposez un fichier PDF ou une image dans le formulaire candidat pour essayer son aperçu.'}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-600">L’aperçu sert à examiner la lisibilité et les informations visibles. Il ne certifie pas l’authenticité.</p>
                  </div>

                  <div className="space-y-4 p-4">
                    {selectedDocument.ocrLu && selectedDocument.ocrData ? (
                      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                        <h4 className="text-sm font-bold text-blue-950">Lecture OCR — à confirmer visuellement</h4>
                        <p className="mt-1 text-xs text-blue-900">Les champs ci-dessous sont une aide de lecture. Comparez-les avec l’aperçu.</p>
                        <dl className="mt-3 space-y-2 text-sm">
                          {[
                            ['Nom', selectedDocument.ocrData.nom?.value],
                            ['Prénom', selectedDocument.ocrData.prenom?.value],
                            ['Diplôme', selectedDocument.ocrData.diplomeIntitule?.value],
                            ['Établissement émetteur', selectedDocument.ocrData.etablissement?.value],
                            ['Mention', selectedDocument.ocrData.mention?.value],
                          ].filter(([, value]) => value).map(([label, value]) => (
                            <div key={label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-2 border-t border-blue-100 pt-2 first:border-0 first:pt-0">
                              <dt className="text-xs text-slate-600">{label}</dt>
                              <dd dir="auto" className="break-words text-sm font-semibold text-slate-950">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                        Aucun champ OCR à comparer. Examinez la pièce elle-même; un document peut être contrôlé sans OCR.
                      </div>
                    )}

                    {selectedDocument.motifCorrection && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                        <h4 className="text-xs font-bold text-red-950">Motif déjà inscrit</h4>
                        <p dir="auto" className="mt-1 text-sm text-red-900">{selectedDocument.motifCorrection}</p>
                        {selectedDocument.actionAttendue && <p dir="auto" className="mt-2 text-sm text-red-900"><strong>Action attendue : </strong>{selectedDocument.actionAttendue}</p>}
                      </div>
                    )}

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
                      <strong className="block">Limite du contrôle</strong>
                      La validation ci-dessous signifie que le contrôle administratif de cette pièce est terminé. Elle ne signifie pas qu’une base externe a confirmé son authenticité.
                    </div>

                    {notice && (
                      <div role="status" aria-live="polite" className={`rounded-lg border p-3 text-sm font-semibold ${notice.type === 'success' ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-red-300 bg-red-50 text-red-950'}`}>
                        {notice.type === 'success' ? <CheckCircle2 className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="mr-1.5 inline h-4 w-4" aria-hidden="true" />}
                        {notice.text}
                      </div>
                    )}

                    {!correctionOpen ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={selectedDocument.statut === 'verifiee' || !selectedDocument.fichierApercuUrl}
                          onClick={() => saveDecision('verifiee', 'agent_manuel', 'Contrôle administratif effectué par un agent.')}
                          className="min-h-11 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                          title={!selectedDocument.fichierApercuUrl ? 'Impossible de valider sans aperçu du fichier.' : undefined}
                        >
                          <Check className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
                          Valider le contrôle
                        </button>
                        <button
                          type="button"
                          disabled={!selectedDocument.fichierApercuUrl && selectedDocument.statut !== 'a_deposer'}
                          onClick={() => { setCorrectionOpen(true); setNotice(null); }}
                          className="min-h-11 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-bold text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
                          title={!selectedDocument.fichierApercuUrl && selectedDocument.statut !== 'a_deposer' ? 'Impossible de motiver une correction sans consulter le fichier.' : undefined}
                        >
                          Demander une correction
                        </button>
                        <button
                          type="button"
                          disabled={!selectedDocument.fichierApercuUrl}
                          onClick={() => saveDecision('verification_manuelle_requise', 'non_verifie', 'Examen humain complémentaire requis.')}
                          className="min-h-11 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 sm:col-span-2"
                          title={!selectedDocument.fichierApercuUrl ? 'Impossible d’envoyer cette pièce sans consulter son contenu.' : undefined}
                        >
                          <ShieldAlert className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
                          Transmettre pour examen complémentaire
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-3">
                        <div>
                          <label htmlFor="correction-reason" className="mb-1 block text-sm font-semibold text-slate-900">Motif de la correction</label>
                          <select id="correction-reason" value={correctionReason} onChange={(event) => setCorrectionReason(event.target.value)} className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900">
                            {correctionReasons.map((reason) => <option key={reason}>{reason}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="correction-details" className="mb-1 block text-sm font-semibold text-slate-900">Explication à transmettre au candidat</label>
                          <textarea
                            id="correction-details"
                            dir="auto"
                            value={correctionDetails}
                            onChange={(event) => setCorrectionDetails(event.target.value)}
                            maxLength={1200}
                            rows={4}
                            placeholder="Décrivez précisément la partie concernée et le problème constaté. Le candidat peut répondre en français ou en arabe."
                            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500"
                          />
                          <p className="mt-1 text-right text-xs text-slate-600">{correctionDetails.length}/1200</p>
                        </div>
                        <div>
                          <label htmlFor="expected-action" className="mb-1 block text-sm font-semibold text-slate-900">Action demandée au candidat</label>
                          <textarea
                            id="expected-action"
                            dir="auto"
                            value={actionExpected}
                            onChange={(event) => setActionExpected(event.target.value)}
                            maxLength={500}
                            rows={2}
                            placeholder="Ex. déposer un scan complet et lisible au format PDF."
                            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500"
                          />
                        </div>
                        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                          <button type="button" onClick={() => setCorrectionOpen(false)} className="min-h-10 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Annuler</button>
                          <button type="button" onClick={saveCorrection} className="min-h-10 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">Enregistrer et notifier</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-600">Ce dossier ne contient pas encore de pièce à examiner.</div>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">Transmission à l’étape suivante</p>
              <p className="mt-0.5 text-xs text-slate-600">
                {mandatoryDocumentsComplete
                  ? 'Toutes les pièces obligatoires sont marquées comme contrôlées.'
                  : `Contrôlez les pièces obligatoires avant de transmettre (${progress.checked}/${progress.total}).`}
              </p>
            </div>
            <button
              type="button"
              disabled={!mandatoryDocumentsComplete}
              onClick={() => {
                onUpdateApplicationStatus(selectedApplication.id, 'verification_validee', 'Contrôle administratif terminé : les pièces obligatoires ont été contrôlées.');
                setNotice({ type: 'success', text: 'Contrôle administratif terminé. Le dossier est prêt pour l’étape suivante.' });
              }}
              className="min-h-11 shrink-0 rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {mandatoryDocumentsComplete ? 'Transmettre à l’étape suivante' : 'Transmission indisponible'}
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};
