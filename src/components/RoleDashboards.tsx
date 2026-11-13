import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Calendar, 
  X, 
  RotateCw,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { 
  Application, 
  PlatformConfig, 
  Topic, 
  UserRole,
  DocumentStatus,
  VerificationMethod
} from '../types';
import { AgentVerificationWorkspace } from './AgentVerificationWorkspace';

interface RoleDashboardsProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  applications: Application[];
  topics: Topic[];
  config: PlatformConfig;
  onUpdateConfig: (newConfig: PlatformConfig) => void;
  onUpdateApplicationStatus: (appId: string, status: any, historyLog: string) => void;
  onUpdateDocVerification: (appId: string, docId: string, status: DocumentStatus, method: VerificationMethod, motif?: string, actionAttendue?: string) => void;
  onSaveProfessorAvis: (appId: string, topicId: string, avis: 'favorable' | 'reserve' | 'defavorable', motif: string) => void;
  onScheduleInterview: (appId: string, date: string, lieu: string) => void;
}

export const RoleDashboards: React.FC<RoleDashboardsProps> = ({
  currentRole,
  onChangeRole,
  applications,
  topics,
  config,
  onUpdateConfig,
  onUpdateApplicationStatus,
  onUpdateDocVerification,
  onSaveProfessorAvis,
  onScheduleInterview,
}) => {
  // Local state for professor rating
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [profAvis, setProfAvis] = useState<'favorable' | 'reserve' | 'defavorable'>('favorable');
  const [profMotif, setProfMotif] = useState('');
  
  // Local state for CEDoc interview planning
  const [interviewDate, setInterviewDate] = useState('18 Décembre 2026 à 10h00');
  const [interviewLieu, setInterviewLieu] = useState('Salle des Actes, FST Fès');

  // Local state for Admin campaign config
  const [localMaxSujets, setLocalMaxSujets] = useState(config.maxSujetsParCandidat);
  const [localClassement, setLocalClassement] = useState(config.imposerClassementPreference);
  const [localExigerTrois, setLocalExigerTrois] = useState(config.exigerTroisSujetsObligatoires);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      maxSujetsParCandidat: Number(localMaxSujets),
      imposerClassementPreference: localClassement,
      exigerTroisSujetsObligatoires: localExigerTrois,
    });
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  // KPIs
  const totalApps = applications.length;
  const incompletsCount = applications.filter((a) => a.statut === 'pieces_a_corriger').length;
  const enVerifCount = applications.filter((a) => a.statut === 'en_cours_verification_pieces').length;
  const convoquesCount = applications.filter((a) => a.statut === 'convoque_entretien').length;

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Role Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Espace de démonstration — choisissez une vue
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { id: 'agent_verificateur', label: 'Contrôle des pièces' },
            { id: 'professeur', label: 'Encadrant' },
            { id: 'laboratoire', label: 'Laboratoire' },
            { id: 'cedoc', label: 'CEDoc' },
            { id: 'administrateur', label: 'Administration' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeRole(tab.id as UserRole)}
              aria-pressed={currentRole === tab.id}
              className={`min-h-11 rounded-lg px-2 py-2 text-xs sm:text-sm transition-colors ${
                currentRole === tab.id
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {currentRole === 'agent_verificateur' && (
        <AgentVerificationWorkspace
          applications={applications}
          selectedAppId={selectedAppId}
          onSelectApplication={setSelectedAppId}
          onUpdateDocVerification={onUpdateDocVerification}
          onUpdateApplicationStatus={onUpdateApplicationStatus}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. PROFESSEUR / ENCADRANT (AVIS SCIENTIFIQUE SUR SUJET) */}
      {/* ========================================================================= */}
      {currentRole === 'professeur' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-900" />
                Espace Encadrant : Examen Scientifique & Avis Motivé
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Évaluez l’adéquation des candidats ayant sélectionné votre sujet de thèse.
              </p>
            </div>

            <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg">
              Pr. Karim BENJELLOUN (LIST · FST Fès)
            </div>
          </div>

          {/* Dossiers to examine */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Candidatures reçues sur votre sujet : USMBA-2026-FST-041 (Intelligence Artificielle)
            </h4>

            <div className="space-y-4">
              {applications.map((app) => {
                const topic = app.sujetsChoisis[0] || topics[0];
                const currentAvis = app.evaluationsEncadrants[topic.id];

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {app.numeroDossier}
                        </span>
                        <h5 className="text-base font-bold text-slate-900 mt-0.5">
                          {app.candidat.nom} {app.candidat.prenom}
                        </h5>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                          <span>Diplôme : {app.candidat.derniereFormation.intituleDiplome}</span>
                          <span>·</span>
                          <span>Moyenne : {app.candidat.derniereFormation.moyenneGenerale}/20</span>
                          <span>·</span>
                          <span>Mention : {app.candidat.derniereFormation.mention}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {currentAvis ? (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            currentAvis.avis === 'favorable'
                              ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                              : 'text-amber-800 bg-amber-50 border-amber-300'
                          }`}>
                            Avis actuel : {currentAvis.avis.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Non statué
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Form to submit review */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Décision motivée :
                        </label>
                        <select
                          value={profAvis}
                          onChange={(e) => setProfAvis(e.target.value as any)}
                          className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-md font-semibold text-slate-800"
                        >
                          <option value="favorable">Avis Favorable</option>
                          <option value="reserve">Avec Réserve</option>
                          <option value="defavorable">Avis Défavorable</option>
                        </select>
                      </div>

                      <div className="sm:col-span-6">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Commentaire scientifique motivé :
                        </label>
                        <input
                          type="text"
                          value={profMotif}
                          onChange={(e) => setProfMotif(e.target.value)}
                          placeholder="Appréciation du mémoire de fin d’études, compétences en codage..."
                          className="w-full text-xs py-2 px-3 bg-white border border-slate-300 rounded-md text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          onClick={() => {
                            onSaveProfessorAvis(
                              app.id,
                              topic.id,
                              profAvis,
                              profMotif || 'Avis émis par le directeur de thèse.'
                            );
                            setProfMotif('');
                          }}
                          className="w-full py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors cursor-pointer shadow-xs"
                        >
                          Enregistrer mon avis
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LABORATOIRE DE RECHERCHE */}
      {/* ========================================================================= */}
      {currentRole === 'laboratoire' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-900" />
              Direction de Laboratoire : Validation des Capacités d'Accueil
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Validation des dossiers par le conseil de laboratoire, quota des postes de doctorat et conformité des équipements.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Dossiers en attente d’arbitrage par le Conseil de Laboratoire
            </h4>

            <div className="divide-y divide-slate-200 text-xs">
              {applications.map((app) => (
                <div key={app.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <strong className="text-sm text-slate-900">{app.candidat.nom} {app.candidat.prenom}</strong>
                    <div className="text-slate-500">
                      Dossier : {app.numeroDossier} · Sujets : {app.sujetsChoisis.map((s) => s.code).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onUpdateApplicationStatus(
                          app.id,
                          'examen_pedagogique',
                          'Validation formelle par le conseil de laboratoire.'
                        )
                      }
                      className="px-3 py-1.5 font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors cursor-pointer"
                    >
                      Valider capacité d'accueil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FORMATION DOCTORALE / CEDOC (PLANIFICATION ENTRETIENS) */}
      {/* ========================================================================= */}
      {currentRole === 'cedoc' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-900" />
              Centre d’Études Doctorales (CEDoc) : Entretiens & Jurys
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Convocations aux entretiens d'admissibilité, délibérations des jurys et publication des listes.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Programmation des entretiens oraux d’admissibilité
            </h4>

            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <strong className="text-sm text-slate-900">{app.candidat.nom} {app.candidat.prenom}</strong>
                      <span className="text-slate-500 ml-2">({app.numeroDossier})</span>
                    </div>

                    {app.validationCedoc?.dateEntretien ? (
                      <span className="text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                        Convoqué : {app.validationCedoc.dateEntretien}
                      </span>
                    ) : (
                      <span className="text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                        Non convoqué
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      placeholder="Date et heure de l'entretien"
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900"
                    />
                    <input
                      type="text"
                      value={interviewLieu}
                      onChange={(e) => setInterviewLieu(e.target.value)}
                      placeholder="Lieu / Salle des actes"
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-900"
                    />
                    <button
                      onClick={() => onScheduleInterview(app.id, interviewDate, interviewLieu)}
                      className="px-4 py-1.5 font-bold text-white bg-blue-900 hover:bg-blue-800 rounded transition-colors cursor-pointer"
                    >
                      Notifier & Convoquer le candidat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADMINISTRATION CENTRALE (CONFIG RÈGLES & STATS) */}
      {/* ========================================================================= */}
      {currentRole === 'administrateur' && (
        <div className="space-y-6">
          
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Dossiers totaux reçus</span>
              <span className="text-2xl font-extrabold text-blue-950 mt-1 block tabular-nums">{totalApps}</span>
              <span className="text-[11px] text-slate-400">Session {config.anneeUniversitaireActive}</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Pièces à corriger</span>
              <span className="text-2xl font-extrabold text-red-600 mt-1 block tabular-nums">{incompletsCount}</span>
              <span className="text-[11px] text-slate-400">Notification envoyée</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">En cours de vérification</span>
              <span className="text-2xl font-extrabold text-amber-600 mt-1 block tabular-nums">{enVerifCount}</span>
              <span className="text-[11px] text-slate-400">Guichet scolarité</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Délai moyen de traitement</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1 block tabular-nums">48h</span>
              <span className="text-[11px] text-slate-400">Gain de 8 jours vs papier</span>
            </div>
          </div>

          {/* Configuration Form (Requirement 6) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-900" />
                  Paramétrage des Règles Administratives de la Campagne
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Les règles suivantes régissent le panier et les critères d’admissibilité des candidats.
                </p>
              </div>

              {configSavedToast && (
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold animate-in fade-in">
                  ✓ Paramètres enregistrés avec succès
                </div>
              )}
            </div>

            {/* Regulatory Caution Notice (Strict Requirement 6) */}
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900 block">
                  Avertissement Réglementaire Obligatoire :
                </strong>
                <span>
                  Le nombre maximal de sujets (actuellement {config.maxSujetsParCandidat}), l'absence de classement par préférence et les règles d'éligibilité doivent être <strong>formellement confirmés par le Conseil de l'Université Sidi Mohamed Ben Abdellah (USMBA)</strong> avant tout usage officiel en production.
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre maximal de sujets par candidat
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={localMaxSujets}
                    onChange={(e) => setLocalMaxSujets(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900 font-bold"
                  />
                  <span className="text-[10px] text-slate-500">Hypothèse prototype : 3 choix</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Imposer un classement par ordre de préférence
                  </label>
                  <select
                    value={localClassement ? 'true' : 'false'}
                    onChange={(e) => setLocalClassement(e.target.value === 'true')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="false">Non (Sujets non hiérarchisés - Règle USMBA)</option>
                    <option value="true">Oui (Imposer 1er, 2e, 3e choix)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Obligation de choisir 3 sujets
                  </label>
                  <select
                    value={localExigerTrois ? 'true' : 'false'}
                    onChange={(e) => setLocalExigerTrois(e.target.value === 'true')}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="false">Non (1, 2 ou 3 choix autorisés)</option>
                    <option value="true">Oui (Exiger exactement 3 choix)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Sauvegarder la configuration de la campagne
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
