import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Building2, 
  User, 
  Calendar, 
  Check, 
  Plus, 
  ExternalLink, 
  GraduationCap, 
  Tag, 
  Info,
  CheckCircle2,
  X
} from 'lucide-react';
import { Topic, PlatformConfig } from '../types';

interface TopicsCatalogueProps {
  topics: Topic[];
  selectedTopicIds: string[];
  onToggleSelectTopic: (topic: Topic) => void;
  onOpenTopicDetails: (topic: Topic) => void;
  config: PlatformConfig;
}

export const TopicsCatalogue: React.FC<TopicsCatalogueProps> = ({
  topics,
  selectedTopicIds,
  onToggleSelectTopic,
  onOpenTopicDetails,
  config,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('all');
  const [selectedEtablissement, setSelectedEtablissement] = useState('all');
  const [selectedCedoc, setSelectedCedoc] = useState('all');
  const [filterPathway, setFilterPathway] = useState<'all' | 'lmd_master' | 'ingenieur' | 'etranger_equivalence'>('all');
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);

  // Extract unique filter lists
  const domaines = useMemo(() => {
    return Array.from(new Set(topics.map((t) => t.domaine)));
  }, [topics]);

  const etablissements = useMemo(() => {
    return Array.from(new Set(topics.map((t) => t.etablissement)));
  }, [topics]);

  const cedocs = useMemo(() => {
    return Array.from(new Set(topics.map((t) => t.cedoc)));
  }, [topics]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        t.titre.toLowerCase().includes(q) ||
        t.resume.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.domaine.toLowerCase().includes(q) ||
        t.etablissement.toLowerCase().includes(q) ||
        t.cedoc.toLowerCase().includes(q) ||
        t.encadrant.nom.toLowerCase().includes(q) ||
        t.laboratoire.toLowerCase().includes(q) ||
        t.specialite.toLowerCase().includes(q) ||
        t.motsCles.some((k) => k.toLowerCase().includes(q));

      const matchDomaine = selectedDomaine === 'all' || t.domaine === selectedDomaine;
      const matchEtab = selectedEtablissement === 'all' || t.etablissement === selectedEtablissement;
      const matchCedoc = selectedCedoc === 'all' || t.cedoc === selectedCedoc;
      const matchPathway = filterPathway === 'all' || t.diplomesRecevables.includes(filterPathway);

      return matchQuery && matchDomaine && matchEtab && matchCedoc && matchPathway;
    });
  }, [topics, searchQuery, selectedDomaine, selectedEtablissement, selectedCedoc, filterPathway]);

  const isCartFull = selectedTopicIds.length >= config.maxSujetsParCandidat;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedDomaine('all');
    setSelectedEtablissement('all');
    setSelectedCedoc('all');
    setFilterPathway('all');
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Catalogue des Sujets de Thèse (Session {config.anneeUniversitaireActive})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Accès libre sans création de compte requise. Vous pouvez sélectionner 1, 2 ou 3 sujets pour votre candidature.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg tabular-nums">
              {filteredTopics.length} sujet{filteredTopics.length > 1 ? 's' : ''} disponible{filteredTopics.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg tabular-nums">
              {selectedTopicIds.length} / {config.maxSujetsParCandidat} sélectionnés
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div>
          <label htmlFor="topic-search" className="block text-sm font-semibold text-slate-800 mb-1.5">
            Rechercher un sujet
          </label>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              id="topic-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex. intelligence artificielle, nom d’un professeur ou laboratoire"
              aria-describedby="topic-search-help"
              className="w-full min-h-12 pl-11 pr-10 py-3 text-base bg-white border border-slate-300 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-900 text-slate-900 transition-colors"
            />
          </div>
          <p id="topic-search-help" className="mt-1 text-xs text-slate-600">
            Vous pouvez chercher par sujet, domaine, établissement, laboratoire ou encadrant.
          </p>
        </div>

        {/* Faceted Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 pt-1 items-end">
          {/* Domaine */}
          <div>
            <label htmlFor="domain-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Domaine disciplinaire
            </label>
            <select
              id="domain-filter"
              value={selectedDomaine}
              onChange={(e) => setSelectedDomaine(e.target.value)}
              className="w-full min-h-11 text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900 text-slate-800"
            >
              <option value="all">Tous les domaines</option>
              {domaines.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedFiltersOpen((open) => !open)}
            aria-expanded={advancedFiltersOpen}
            className="min-h-11 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-blue-950 flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-900"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            {advancedFiltersOpen ? 'Masquer les autres filtres' : 'Autres filtres'}
          </button>
        </div>

        {advancedFiltersOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-lg bg-slate-50 border border-slate-200 p-4" aria-label="Filtres supplémentaires">
            <div>
              <label htmlFor="establishment-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Établissement</label>
              <select id="establishment-filter" value={selectedEtablissement} onChange={(e) => setSelectedEtablissement(e.target.value)} className="w-full min-h-11 text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-slate-800">
                <option value="all">Tous les établissements</option>
                {etablissements.map((etab) => <option key={etab} value={etab}>{etab}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="cedoc-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Centre doctoral</label>
              <select id="cedoc-filter" value={selectedCedoc} onChange={(e) => setSelectedCedoc(e.target.value)} className="w-full min-h-11 text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-slate-800">
                <option value="all">Tous les centres</option>
                {cedocs.map((ced) => <option key={ced} value={ced}>{ced}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="pathway-filter" className="block text-sm font-semibold text-slate-700 mb-1.5">Parcours académique</label>
              <select id="pathway-filter" value={filterPathway} onChange={(e) => setFilterPathway(e.target.value as typeof filterPathway)} className="w-full min-h-11 text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-slate-800">
                <option value="all">Tous les parcours</option>
                <option value="lmd_master">Master LMD</option>
                <option value="ingenieur">Ingénieur d’État</option>
                <option value="etranger_equivalence">Diplôme étranger / équivalence</option>
              </select>
            </div>
          </div>
        )}

        {/* Active filters reminder & reset */}
        {(searchQuery || selectedDomaine !== 'all' || selectedEtablissement !== 'all' || selectedCedoc !== 'all' || filterPathway !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Filtres actifs appliqués</span>
            <button
              onClick={resetFilters}
              className="text-blue-900 hover:underline font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

      </div>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            Aucun sujet ne correspond à vos critères de recherche
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Essayez d'élargir votre recherche ou de réinitialiser les filtres pour afficher l'ensemble des sujets ouverts à l'USMBA.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors"
          >
            Afficher tous les sujets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTopics.map((topic) => {
            const isSelected = selectedTopicIds.includes(topic.id);
            return (
              <div
                key={topic.id}
                className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-sm bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Topic Header metadata */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {topic.code}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Session {topic.anneeUniversitaire}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-blue-900 transition-colors">
                    {topic.titre}
                  </h3>

                  {/* Clean unboxed metadata with separators (Anti-Pill Rule) */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 font-medium">
                    <span className="text-blue-900 font-semibold">{topic.domaine}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span>{topic.etablissement}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="truncate max-w-[200px]">{topic.laboratoire}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {topic.resume}
                  </p>

                  {/* Supervisor & prerequisites summary */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-900 font-semibold">{topic.encadrant.nom}</span>
                      <span className="text-slate-500 text-[11px]">({topic.encadrant.titre})</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <div className="truncate">
                        <span className="font-medium text-slate-700">Cursus acceptés : </span>
                        <span>
                          {topic.diplomesRecevables
                            .map((p) => (p === 'ingenieur' ? 'Ingénieur d’État' : p === 'lmd_master' ? 'Master LMD' : 'Diplôme étranger'))
                            .join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenTopicDetails(topic)}
                    className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1.5 py-1.5"
                  >
                    <span>Fiche complète & prérequis</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onToggleSelectTopic(topic)}
                    disabled={!isSelected && isCartFull}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-900 text-white hover:bg-blue-950'
                        : isCartFull
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-amber-100 text-amber-950 hover:bg-amber-200 border border-amber-300'
                    }`}
                    title={
                      !isSelected && isCartFull
                        ? `Limite de ${config.maxSujetsParCandidat} sujets atteinte dans le panier`
                        : undefined
                    }
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Sélectionné</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-amber-900" />
                        <span>Ajouter au panier</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Cart helper reminder bar if topics selected */}
      {selectedTopicIds.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-3xl mx-auto z-30 bg-slate-900 text-white rounded-xl p-3 sm:p-4 shadow-xl border border-slate-700 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm tabular-nums">
              {selectedTopicIds.length}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {selectedTopicIds.length} sujet{selectedTopicIds.length > 1 ? 's' : ''} sélectionné{selectedTopicIds.length > 1 ? 's' : ''} sur {config.maxSujetsParCandidat} maximum
              </p>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Les sujets ne sont pas classés par préférence.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('panier-tab-trigger');
              if (el) el.click();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Voir le panier & continuer
          </button>
        </div>
      )}

    </div>
  );
};
