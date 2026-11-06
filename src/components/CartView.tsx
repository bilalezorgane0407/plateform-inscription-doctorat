import React, { useState } from 'react';
import { 
  Trash2, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  BookOpen, 
  Building2, 
  User, 
  Info,
  ExternalLink
} from 'lucide-react';
import { Topic, PlatformConfig } from '../types';

interface CartViewProps {
  selectedTopics: Topic[];
  onRemoveTopic: (topicId: string) => void;
  onContinueApplication: () => void;
  onExploreMore: () => void;
  onOpenDetails: (topic: Topic) => void;
  config: PlatformConfig;
}

export const CartView: React.FC<CartViewProps> = ({
  selectedTopics,
  onRemoveTopic,
  onContinueApplication,
  onExploreMore,
  onOpenDetails,
  config,
}) => {
  const [showRecapConfirm, setShowRecapConfirm] = useState(false);

  const count = selectedTopics.length;
  const max = config.maxSujetsParCandidat;

  const canContinue = 
    count >= 1 && 
    count <= max && 
    (!config.exigerTroisSujetsObligatoires || count === 3);

  return (
    <div className="py-6 sm:py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Title & Counter Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Mon Panier de Sujets de Thèse
              </h2>
              <span className="text-xs font-bold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full tabular-nums">
                {count} / {max}
              </span>
            </div>
            
            {/* Required prominent statement: "Les sujets ne sont pas classés par préférence" */}
            <p className="text-xs sm:text-sm font-semibold text-blue-950 mt-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-800 shrink-0" />
              <span>Les sujets ne sont pas classés par préférence.</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 block tabular-nums">
              {count === 0 ? 'Aucun sujet sélectionné' : `${count} sujet${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''} sur ${max} maximum`}
            </span>
            <span className="text-xs text-slate-500">
              {config.exigerTroisSujetsObligatoires
                ? 'Règle stricte activée : 3 choix requis'
                : 'Vous pouvez postuler à 1, 2 ou 3 sujets'}
            </span>
          </div>
        </div>

        {/* Regulatory note regarding USMBA official validation */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 font-semibold">Note administrative (Prototype) : </strong>
            Le nombre maximal de sujets et la non-hiérarchisation sont configurables par les administrateurs et doivent être confirmés par les instances de l’USMBA avant mise en production officielle.
          </div>
        </div>
      </div>

      {/* Selected Topics List */}
      {selectedTopics.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Votre panier est actuellement vide</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Vous pouvez consulter librement le catalogue et choisir jusqu'à {max} sujets de thèse avant de créer un compte ou de vous connecter.
          </p>
          <button
            onClick={onExploreMore}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
          >
            Consulter les sujets de thèse
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Choix #{index + 1} · {topic.code}
                  </span>
                  <span className="text-xs text-slate-500">{topic.anneeUniversitaire}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 hover:text-blue-900 transition-colors">
                  {topic.titre}
                </h3>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                  <span className="font-semibold text-blue-900">{topic.domaine}</span>
                  <span aria-hidden="true">·</span>
                  <span>{topic.etablissement}</span>
                  <span aria-hidden="true">·</span>
                  <span>{topic.laboratoire}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {topic.resume}
                </p>

                <div className="pt-2 flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Encadrant : {topic.encadrant.nom}
                  </span>
                  <button
                    onClick={() => onOpenDetails(topic)}
                    className="text-blue-900 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Détails & critères</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Action: Remove */}
              <div className="self-end md:self-start shrink-0">
                <button
                  onClick={() => onRemoveTopic(topic.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Retirer ce sujet du panier"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                  <span>Retirer</span>
                </button>
              </div>
            </div>
          ))}

          {/* Add more slot notice if < max */}
          {count < max && (
            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Vous pouvez encore sélectionner {max - count} sujet{max - count > 1 ? 's' : ''} supplémentaire{max - count > 1 ? 's' : ''}
                </span>
                <span className="text-xs text-slate-500">
                  Rappel : le dépôt est valide dès 1 sujet. Vous n'êtes pas obligé(e) de saturer les 3 choix.
                </span>
              </div>
              <button
                onClick={onExploreMore}
                className="px-3.5 py-2 text-xs font-semibold text-blue-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                + Ajouter un autre sujet
              </button>
            </div>
          )}

          {/* Recap confirmation block before proceeding */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-blue-800" />
              Récapitulatif de votre sélection avant candidature
            </h4>

            <ul className="text-xs text-slate-700 space-y-1.5 pl-6 list-disc">
              <li>
                Vous postulez à <strong>{count} sujet{count > 1 ? 's' : ''} de thèse</strong> au sein de l'USMBA.
              </li>
              <li>
                <strong>Aucune préférence n’est imposée</strong> : vos candidatures seront examinées de manière équivalente et indépendante par les directeurs de thèse et les laboratoires respectifs.
              </li>
              <li>
                Vos choix seront <strong>intégralement conservés</strong> lors de la connexion ou création de compte à l'étape suivante.
              </li>
            </ul>

            {/* Exact required button label: « Continuer ma candidature » */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={onExploreMore}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-center cursor-pointer"
              >
                Retourner aux sujets
              </button>

              <button
                onClick={onContinueApplication}
                disabled={!canContinue}
                className={`w-full sm:w-auto px-6 py-3 text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  canContinue
                    ? 'bg-blue-900 text-white hover:bg-blue-950 ring-2 ring-blue-900/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continuer ma candidature</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
