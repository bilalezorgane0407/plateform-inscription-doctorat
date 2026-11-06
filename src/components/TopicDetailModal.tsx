import React from 'react';
import { 
  X, 
  Building2, 
  User, 
  GraduationCap, 
  Calendar, 
  Check, 
  Plus, 
  Mail, 
  Tag, 
  BookOpen, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Topic, PlatformConfig } from '../types';

interface TopicDetailModalProps {
  topic: Topic | null;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: (topic: Topic) => void;
  isCartFull: boolean;
  config: PlatformConfig;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  onClose,
  isSelected,
  onToggleSelect,
  isCartFull,
  config,
}) => {
  if (!topic) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-topic-title"
      >
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Fermer la fiche détaillée"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2">
            <span>{topic.code}</span>
            <span aria-hidden="true">·</span>
            <span>Session {topic.anneeUniversitaire}</span>
          </div>

          <h2 id="modal-topic-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {topic.titre}
          </h2>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 mt-3">
            <span className="font-semibold text-amber-300">{topic.domaine}</span>
            <span aria-hidden="true">·</span>
            <span>{topic.etablissement}</span>
            <span aria-hidden="true">·</span>
            <span>{topic.laboratoire}</span>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-900" />
              Résumé scientifique du projet de thèse
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {topic.resume}
            </p>
          </div>

          {/* Research axis & CEDoc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs font-semibold text-slate-500 block">Formation Doctorale / CEDoc</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{topic.cedoc}</span>
              {topic.axeRecherche && (
                <span className="text-xs text-slate-600 mt-1 block">Axe : {topic.axeRecherche}</span>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs font-semibold text-slate-500 block">Capacité & Calendrier</span>
              <div className="flex items-center justify-between mt-1 text-sm">
                <span className="font-semibold text-slate-800">{topic.nbPostes} place(s) ouverte(s)</span>
                <span className="text-xs text-slate-500 tabular-nums">Période : {topic.periodeCandidature.debut} au {topic.periodeCandidature.fin}</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {topic.candidaturesRecues} candidature(s) enregistrée(s) à ce jour
              </span>
            </div>
          </div>

          {/* Published Prerequisites */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-900" />
              Compétences et prérequis scientifiques publiés
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              {topic.prerequisPublies.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-2 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Acceptable pathways */}
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2">
              Diplômes et parcours recevables pour ce sujet
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {topic.diplomesRecevables.map((p) => {
                const label = 
                  p === 'ingenieur' ? 'Diplôme d’Ingénieur d’État' :
                  p === 'lmd_master' ? 'Master Recherche / Spécialisé LMD' :
                  p === 'etranger_equivalence' ? 'Diplôme étranger (avec arrêté d’équivalence)' :
                  'Autre parcours / spécifique';
                return (
                  <span key={p} className="bg-white border border-blue-200 text-blue-900 px-2.5 py-1 rounded-md font-medium">
                    {label}
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] text-blue-900/80 mt-2">
              Important : La recevabilité définitive sera instruite sur pièces. Les diplômes étrangers font obligatoirement l'objet d'un examen humain par la commission du CEDoc.
            </p>
          </div>

          {/* Supervisors information */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-900" />
              Direction de thèse
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-xs text-slate-500 font-medium">Directeur de thèse (Encadrant principal)</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{topic.encadrant.nom}</p>
                <p className="text-xs text-slate-600">{topic.encadrant.titre}</p>
                <p className="text-xs text-blue-900 font-mono mt-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {topic.encadrant.email}
                </p>
              </div>

              {topic.coEncadrant && (
                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                  <span className="text-xs text-slate-500 font-medium">Co-encadrant</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{topic.coEncadrant.nom}</p>
                  <p className="text-xs text-slate-600">{topic.coEncadrant.titre}</p>
                  <p className="text-xs text-blue-900 font-mono mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {topic.coEncadrant.email}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <button
            onClick={() => onToggleSelect(topic)}
            disabled={!isSelected && isCartFull}
            className={`px-5 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              isSelected
                ? 'bg-blue-900 text-white hover:bg-blue-950'
                : isCartFull
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Retirer de mon panier</span>
              </>
            ) : isCartFull ? (
              <span>Panier plein ({config.maxSujetsParCandidat} max)</span>
            ) : (
              <>
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Sélectionner pour ma candidature</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
