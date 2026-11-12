import React from 'react';
import { 
  GraduationCap, 
  Layers, 
  FileText, 
  Clock, 
  Settings, 
  User, 
  LogOut, 
  CheckCircle2, 
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
  onChangeUserRole: (role: UserRole) => void;
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
  onChangeUserRole,
  isAuthenticated,
  currentUserNom,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  const roleLabels: Record<UserRole, string> = {
    visiteur: 'Visiteur (Public)',
    candidat: 'Candidat',
    professeur: 'Professeur / Encadrant',
    laboratoire: 'Laboratoire (LISAC/LIST)',
    cedoc: 'CEDoc Sciences & Tech',
    agent_verificateur: 'Agent Vérificateur (Scolarité)',
    administrateur: 'Administration Centrale',
  };

  const navLinks = [
    { id: 'catalogue', label: 'Sujets de Thèse', icon: Layers },
    { id: 'panier', label: `Panier (${cartCount})`, icon: Layers },
    { id: 'candidature', label: 'Ma Candidature', icon: FileText },
    { id: 'suivi', label: 'Suivi du Dossier', icon: Clock },
    { id: 'acteurs', label: 'Espaces Acteurs & Administration', icon: Settings },
  ];

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

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('catalogue')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'catalogue'
                  ? 'text-blue-950 font-semibold bg-slate-100'
                  : 'hover:text-blue-900 hover:bg-slate-50'
              }`}
            >
              Sujets de Thèse
            </button>

            <button
              onClick={() => onSelectTab('panier')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'panier'
                  ? 'text-blue-950 font-semibold bg-slate-100'
                  : 'hover:text-blue-900 hover:bg-slate-50'
              }`}
            >
              <span>Mon Panier</span>
              {cartCount > 0 && (
                <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('candidature')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'candidature'
                  ? 'text-blue-950 font-semibold bg-slate-100'
                  : 'hover:text-blue-900 hover:bg-slate-50'
              }`}
            >
              Dossier & OCR
            </button>

            <button
              onClick={() => onSelectTab('suivi')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'suivi'
                  ? 'text-blue-950 font-semibold bg-slate-100'
                  : 'hover:text-blue-900 hover:bg-slate-50'
              }`}
            >
              Suivi & Récépissé
            </button>

            <button
              onClick={() => onSelectTab('acteurs')}
              className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === 'acteurs'
                  ? 'text-blue-950 font-semibold bg-slate-100'
                  : 'hover:text-blue-900 hover:bg-slate-50'
              }`}
            >
              <span>Espaces Acteurs</span>
              <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                Multi-rôles
              </span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action Area & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Role dropdown simulator for demonstrator */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
                title="Changer de rôle pour tester les différentes vues"
              >
                <span className="text-slate-500 hidden sm:inline">Rôle :</span>
                <span className="font-semibold text-blue-950 truncate max-w-[120px] sm:max-w-[160px]">
                  {roleLabels[userRole]}
                </span>
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 text-xs"
                  onClick={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 pb-1 border-b border-slate-100">
                    <span className="font-bold text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider block">
                      Mode démonstration
                    </span>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Sélecteur de vue (simulation sans contrôle d'accès réel)
                    </span>
                  </div>
                  <div className="pt-1.5">
                    {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => onChangeUserRole(role)}
                        className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                          userRole === role ? 'font-semibold text-blue-900 bg-blue-50/50' : 'text-slate-700'
                        }`}
                      >
                        <span>{roleLabels[role]}</span>
                        {userRole === role && <CheckCircle2 className="w-4 h-4 text-blue-700" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth / Account status */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSelectTab('candidature')}
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
