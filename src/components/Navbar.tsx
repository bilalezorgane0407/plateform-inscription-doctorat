import React from 'react';
import { 
  GraduationCap, 
  Layers, 
  FileText, 
  Clock, 
  Settings, 
  User, 
  LogOut, 
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  cartCount: number;
  userRole: UserRole;
  isAuthenticated: boolean;
  currentUserNom?: string;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  cartCount,
  userRole,
  isAuthenticated,
  currentUserNom,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const roleLabels: Record<UserRole, string> = {
    visiteur: 'Visiteur (Public)',
    candidat: 'Candidat',
    professeur: 'Professeur / Encadrant',
    laboratoire: 'Laboratoire (LISAC/LIST)',
    cedoc: 'CEDoc Sciences & Tech',
    agent_verificateur: 'Agent Vérificateur (Scolarité)',
    administrateur: 'Administration Centrale',
  };

  const publicLinks = [
    { id: 'catalogue', label: 'Sujets', icon: Layers },
    { id: 'panier', label: `Panier${cartCount ? ` (${cartCount})` : ''}`, icon: Layers },
  ];
  const candidateLinks = [
    ...publicLinks,
    { id: 'candidature', label: 'Mon dossier', icon: FileText },
    { id: 'suivi', label: 'Suivi', icon: Clock },
  ];
  const navLinks = userRole === 'visiteur'
    ? publicLinks
    : userRole === 'candidat'
      ? candidateLinks
      : [{ id: 'acteurs', label: 'Espace de travail', icon: Settings }];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Disclaimer Prototype Banner */}
      <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b border-amber-600">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded">
              Prototype Expérimental
            </span>
            <span className="truncate text-slate-900 font-medium">
              Plateforme pilote de candidature et inscription au doctorat — Université Sidi Mohamed Ben Abdellah de Fès (USMBA).
            </span>
          </div>
          <div className="text-[11px] text-amber-950 hidden md:flex items-center gap-2 shrink-0">
            <span>Hypothèses & règles configurables</span>
            <span aria-hidden="true">·</span>
            <span className="italic">Non affilié à la production officielle</span>
          </div>
        </div>
      </div>

      {/* Main Top Bar (Conforming to Top Bar Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Single element Brand Wordmark */}
          <button
            onClick={() => onSelectTab('catalogue')}
            className="flex items-center gap-2.5 text-left focus:outline-hidden group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-blue-800 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-blue-950 block leading-tight">
                USMBA Doctorat
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Fès · Portail des Thèses
              </span>
            </div>
          </button>

          {/* La navigation ne montre que les actions utiles au rôle actif. */}
          <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  aria-current={currentTab === item.id ? 'page' : undefined}
                  className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                    currentTab === item.id
                      ? 'text-blue-950 font-semibold bg-blue-50'
                      : 'hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action Area & Role Switcher */}
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 rounded-md px-2.5 py-2">
              <span className="text-slate-500 hidden sm:inline">{isAuthenticated ? 'Compte démo : ' : 'Mode : '}</span>
              <span>{roleLabels[userRole]}</span>
            </div>

            {/* Auth / Account status */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectTab(userRole === 'candidat' ? 'candidature' : 'acteurs')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-950 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-800" />
                  <span className="truncate max-w-[110px]">{currentUserNom || 'Mon Compte'}</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Déconnexion"
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-md transition-colors shadow-xs"
              >
                Connexion
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              aria-label="Menu principal"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          <div className="pb-2 mb-2 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {userRole === 'visiteur' ? 'Découvrir les sujets' : userRole === 'candidat' ? 'Espace candidat' : 'Espace équipe'}
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center justify-between ${
                  currentTab === item.id
                    ? 'bg-blue-50 text-blue-950 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
