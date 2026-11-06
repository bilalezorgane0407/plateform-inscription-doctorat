import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  CreditCard, 
  GraduationCap, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  Sparkles
} from 'lucide-react';
import { CandidateProfile, AcademicPathway } from '../types';
import { DEMO_PROFILES } from '../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: CandidateProfile) => void;
  cartCount: number;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  cartCount,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [cin, setCin] = useState('');
  const [cneMassar, setCneMassar] = useState('');
  const [parcours, setParcours] = useState<AcademicPathway>('lmd_master');
  const [password, setPassword] = useState('');
  
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to LMD profile or find match
    const profile = DEMO_PROFILES.lmd;
    onLoginSuccess({
      ...profile,
      email: loginEmail || profile.email,
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: CandidateProfile = {
      id: `cand-${Date.now()}`,
      nom: nom.toUpperCase(),
      prenom: prenom,
      email: email,
      telephone: telephone,
      cin: cin.toUpperCase(),
      cneMassar: cneMassar.toUpperCase(),
      dateNaissance: '2001-01-01',
      nationalite: 'Marocaine',
      ville: 'Fès',
      parcours: parcours,
      derniereFormation: {
        intituleDiplome: parcours === 'ingenieur' 
          ? 'Diplôme d’Ingénieur d’État' 
          : parcours === 'etranger_equivalence' 
            ? 'Master International' 
            : 'Master de Recherche',
        specialite: 'Informatique / Sciences',
        etablissement: parcours === 'ingenieur' ? 'ENSA Fès' : 'FS Dhar El Mahraz Fès',
        anneeObtention: '2026',
        mention: 'Bien',
        moyenneGenerale: '14.5',
        paysObtention: parcours === 'etranger_equivalence' ? 'France' : 'Maroc',
      },
      estSalarie: false,
    };
    onLoginSuccess(newProfile);
  };

  const handleQuickDemoLogin = (key: 'lmd' | 'ingenieur' | 'etranger') => {
    onLoginSuccess(DEMO_PROFILES[key]);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-amber-400 font-bold uppercase tracking-wider text-xs">
            Portail Doctorat USMBA
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {tab === 'login' ? 'Connexion Candidat' : tab === 'register' ? 'Création de Compte Candidat' : 'Récupération du mot de passe'}
          </h2>

          {cartCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/30 text-amber-300 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Votre panier ({cartCount} sujet{cartCount > 1 ? 's' : ''}) sera conservé après connexion.</span>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setFeedbackMessage(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              tab === 'login'
                ? 'border-blue-900 text-blue-950 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => { setTab('register'); setFeedbackMessage(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              tab === 'register'
                ? 'border-blue-900 text-blue-950 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5">
          
          {feedbackMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs">
              {feedbackMessage}
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="candidat@usmba.ac.ma ou email personnel"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] text-blue-900 hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Se connecter et continuer</span>
              </button>

              {/* Demo quick sign-in */}
              <div className="pt-4 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Démonstration : Connexion rapide en 1 clic
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('lmd')}
                    className="p-2 border border-slate-300 rounded-lg hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors"
                  >
                    <span className="font-bold text-slate-900 block truncate">Mehdi EL AMRANI</span>
                    <span className="text-slate-500 text-[10px]">Master LMD (FST)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ingenieur')}
                    className="p-2 border border-slate-300 rounded-lg hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors"
                  >
                    <span className="font-bold text-slate-900 block truncate">Yassine BENNANI</span>
                    <span className="text-slate-500 text-[10px]">Ingénieur (ENSA)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('etranger')}
                    className="p-2 border border-slate-300 rounded-lg hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors"
                  >
                    <span className="font-bold text-slate-900 block truncate">Salma ALAMI</span>
                    <span className="text-slate-500 text-[10px]">Diplôme Étranger</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="ex. EL AMRANI"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Identique à la CIN</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="ex. Mehdi"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>N° CIN ou Passeport *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cin}
                    onChange={(e) => setCin(e.target.value)}
                    placeholder="ex. CD718942"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900 uppercase"
                  />
                  <span className="text-[10px] text-slate-400">Pour le suivi et convocation</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Code CNE ou MASSAR *
                  </label>
                  <input
                    type="text"
                    required
                    value={cneMassar}
                    onChange={(e) => setCneMassar(e.target.value)}
                    placeholder="ex. R138492041"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Vérification cursus national</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail de contact *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom.prenom@example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Les convocations et notifications y seront transmises</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nature du parcours académique de base *
                </label>
                <select
                  value={parcours}
                  onChange={(e) => setParcours(e.target.value as AcademicPathway)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                >
                  <option value="lmd_master">Master LMD (Recherche ou Spécialisé)</option>
                  <option value="ingenieur">Diplôme d’Ingénieur d’État (Bac+5)</option>
                  <option value="etranger_equivalence">Diplôme étranger (nécessitant équivalence ministérielle)</option>
                  <option value="autre_specifique">Autre diplôme / parcours spécifique atypique</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  La liste personnalisée des pièces à fournir s’adaptera automatiquement à ce choix.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Définir un mot de passe *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 space-y-1">
                <p>
                  ✓ <strong>Activation :</strong> Un lien de validation est simulé instantanément pour cette démonstration.
                </p>
                <p>
                  ✓ <strong>Brouillon :</strong> Vos saisies et pièces déposées seront enregistrées à chaque étape.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer mon compte et continuer la candidature</span>
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Saisissez votre adresse e-mail afin de recevoir un lien sécurisé de réinitialisation de votre mot de passe.
              </p>
              <input
                type="email"
                placeholder="nom.prenom@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={() => setFeedbackMessage('Un e-mail de réinitialisation fictif a été généré avec succès.')}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors"
              >
                Envoyer le lien de réinitialisation
              </button>
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-blue-900 hover:underline block mx-auto font-medium"
              >
                Retour à la connexion
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
