import React from 'react';
import { 
  Search, 
  Layers, 
  FileCheck, 
  UserCheck, 
  ShieldCheck, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { PlatformConfig } from '../types';

interface HomeHeroProps {
  config: PlatformConfig;
  onExploreTopics: () => void;
  onViewPanier: () => void;
  cartCount: number;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  config,
  onExploreTopics,
  onViewPanier,
  cartCount,
}) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-900">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              <span>Campagne Doctorale {config.anneeUniversitaireActive} · Inscriptions ouvertes jusqu’au {config.dateClotureCandidature}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Portail de Candidature au Doctorat
              <span className="block text-blue-900 text-2xl sm:text-3xl lg:text-4xl font-semibold mt-1">
                Université Sidi Mohamed Ben Abdellah de Fès
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Consultez l’ensemble des sujets de recherche proposés par nos laboratoires 
              <strong className="text-slate-900 font-semibold"> sans obligation de créer un compte préalable</strong>. 
              Sélectionnez jusqu’à {config.maxSujetsParCandidat} sujets sans ordre hiérarchique imposé, 
              déposez vos pièces avec assistance OCR et bénéficiez d’un suivi transparent de votre dossier.
            </p>

            {/* Core commitments answering user pain points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <Layers className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900 block">Panier sans classement</strong>
                  <span>Choisissez 1, 2 ou 3 sujets selon vos affinités scientifiques.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <FileCheck className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900 block">Assistance OCR intelligente</strong>
                  <span>Pré-remplissage des champs avec confirmation obligatoire du candidat.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <UserCheck className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900 block">Examen humain garanti</strong>
                  <span>Aucun rejet arbitraire sur les diplômes étrangers ou équivalences.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-slate-900 block">Dossier dématérialisé</strong>
                  <span>Correction ciblée des pièces sans recommencer tout le dossier.</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onExploreTopics}
                className="px-5 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-all flex items-center gap-2 group cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Explorer les sujets de thèse</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {cartCount > 0 ? (
                <button
                  onClick={onViewPanier}
                  className="px-5 py-3 text-sm font-semibold text-blue-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-amber-900" />
                  <span>Voir mon panier ({cartCount} sélectionné{cartCount > 1 ? 's' : ''})</span>
                </button>
              ) : (
                <button
                  onClick={onExploreTopics}
                  className="px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  Modalités & pièces exigées
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Campus image card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
              <img
                src="/src/assets/images/hero_usmba_campus_1793977190559.jpg"
                alt="Campus universitaire et recherche USMBA Fès"
                className="w-full h-80 sm:h-96 object-cover opacity-95 hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">
                  Pôle d’Excellence Doctoral · Fès
                </span>
                <p className="text-base font-semibold mt-1">
                  Centres d’Études Doctorales (CEDoc) de l’USMBA
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Sciences & Technologies · Sciences Médicales · Droit & Économie · Lettres & SHS
                </p>
              </div>
            </div>

            {/* Transparent indicator badge */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-700" />
                Dépôt 100% en ligne pour la session 2026-2027
              </span>
              <span className="tabular-nums font-mono text-[11px] text-slate-400">
                4 CEDocs · 7 Établissements
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
