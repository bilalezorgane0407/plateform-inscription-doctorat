import React from 'react';
import { ArrowRight, Calendar, FileText, Layers, Search } from 'lucide-react';
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
}) => (
  <section className="bg-white border-b border-slate-200" aria-labelledby="home-title">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-950">
            <Calendar className="w-4 h-4 text-blue-800" aria-hidden="true" />
            <span>Campagne {config.anneeUniversitaireActive}</span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span className="font-normal text-slate-600">Clôture : {config.dateClotureCandidature}</span>
          </div>
          <h1 id="home-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            Candidature au doctorat
          </h1>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl">
            Trouvez un sujet adapté à votre parcours. Vous pouvez consulter les sujets avant de créer un compte.
          </p>
          <p className="text-xs sm:text-sm text-slate-600">
            Université Sidi Mohamed Ben Abdellah de Fès <span className="font-semibold">(prototype de démonstration)</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2.5 lg:min-w-[270px]">
          <button
            onClick={onExploreTopics}
            className="min-h-12 px-5 py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Voir les sujets</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
          {cartCount > 0 && (
            <button
              onClick={onViewPanier}
              className="min-h-12 px-5 py-3 text-sm font-semibold text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" aria-hidden="true" />
              <span>Mon panier ({cartCount})</span>
            </button>
          )}
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5" aria-label="Les trois étapes de la candidature">
        <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">1</span>
          <span className="text-sm text-slate-800"><strong>Consultez</strong> les sujets</span>
        </li>
        <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">2</span>
          <span className="text-sm text-slate-800"><strong>Choisissez</strong> jusqu’à 3 sujets</span>
        </li>
        <li className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">3</span>
          <span className="text-sm text-slate-800"><strong>Continuez</strong> votre candidature</span>
        </li>
      </ol>

      <p className="mt-3 flex items-start gap-2 text-xs text-slate-600">
        <FileText className="w-4 h-4 shrink-0 text-slate-500" aria-hidden="true" />
        <span>La création de compte intervient après la sélection des sujets. Les règles affichées ici sont celles d’un prototype et doivent être confirmées par l’université.</span>
      </p>
    </div>
  </section>
);
