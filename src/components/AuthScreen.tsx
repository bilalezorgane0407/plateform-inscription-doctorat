import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  CreditCard, 
  GraduationCap, 
  CheckCircle2, 
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { CandidateProfile, AcademicPathway, Topic } from '../types';
import { DEMO_PROFILES } from '../data/mockData';
import { findDemoAccount, registerDemoCandidate, resetDemoData } from '../utils/demoStorage';
import { UserRole } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (profile: CandidateProfile, role?: UserRole, displayName?: string) => void;
  onCancel: () => void;
  selectedTopics: Topic[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onCancel,
  selectedTopics,
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

  const cartCount = selectedTopics.length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const account = findDemoAccount(loginEmail, loginPassword);
    if (!account) {
      setFeedbackMessage('Adresse ou mot de passe incorrect. Pour tester, utilisez un compte de démonstration ci-dessous.');
      return;
    }
    const profile = account.profile || (account.role === 'candidat'
      ? DEMO_PROFILES.lmd
      : { ...DEMO_PROFILES.lmd, id: `staff-demo-${account.role}`, email: account.email, prenom: account.displayName.split(' ')[0], nom: account.displayName.split(' ').slice(1).join(' ') });
    onLoginSuccess(profile, account.role, account.displayName);
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
      dateNaissance: '',
      nationalite: 'Marocaine',
      ville: 'Fès',
      parcours: parcours,
      derniereFormation: {
        intituleDiplome: '',
        specialite: '',
        etablissement: '',
        anneeObtention: '',
        mention: '',
        moyenneGenerale: '',
        paysObtention: parcours === 'etranger_equivalence' ? 'France' : 'Maroc',
      },
      estSalarie: false,
    };
    try {
      registerDemoCandidate({ email, password, role: 'candidat', displayName: `${prenom} ${nom.toUpperCase()}`, profile: newProfile });
      onLoginSuccess(newProfile, 'candidat', `${prenom} ${nom.toUpperCase()}`);
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : 'Impossible de créer ce compte local.');
    }
  };

  const demoLogins = [
    ['candidat.demo@example.com', 'Candidat'],
    ['encadrant.demo@example.com', 'Directeur de thèse'],
    ['laboratoire.demo@example.com', 'Laboratoire'],
    ['agent.demo@example.com', 'Agent de scolarité'],
    ['cedoc.demo@example.com', 'CEDoc'],
    ['admin.demo@example.com', 'Administration'],
  ] as const;
  const openDemoAccount = (emailAddress: string) => {
    setLoginEmail(emailAddress);
    setLoginPassword('DoctoratDemo2026!');
    const account = findDemoAccount(emailAddress, 'DoctoratDemo2026!');
    if (!account) return;
    const profile = account.profile || (account.role === 'candidat'
      ? DEMO_PROFILES.lmd
      : { ...DEMO_PROFILES.lmd, id: `staff-demo-${account.role}`, email: account.email, prenom: account.displayName.split(' ')[0], nom: account.displayName.split(' ').slice(1).join(' ') });
    onLoginSuccess(profile, account.role, account.displayName);
  };
  const handleResetDemo = async () => {
    if (!window.confirm('Effacer les comptes créés, candidatures, fichiers et décisions de démonstration enregistrés dans ce navigateur ? Cette action ne peut pas être annulée.')) return;
    try { await resetDemoData(); window.location.reload(); }
    catch (error) { setFeedbackMessage(error instanceof Error ? error.message : 'La réinitialisation a échoué.'); }
  };

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      
      {/* Return navigation */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retourner au panier ({cartCount} sujet{cartCount > 1 ? 's' : ''})</span>
      </button>

      {/* Cart Preservation Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                Panier conservé
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {cartCount === 0 ? 'Aucun sujet actuellement dans le panier' : `${cartCount} sujet${cartCount > 1 ? 's' : ''} de thèse en attente de dépôt`}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Votre sélection de sujets est préservée intacte. Vous pourrez finaliser votre candidature immédiatement après votre connexion.
            </p>
          </div>

          {cartCount > 0 && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              <div className="flex -space-x-1.5">
                {selectedTopics.map((t) => (
                  <span
                    key={t.id}
                    title={t.titre}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-900 text-amber-300 font-mono text-[10px] font-bold border-2 border-white shadow-xs"
                  >
                    {t.code.slice(-2)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected topic chips */}
        {selectedTopics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200/60 flex flex-wrap gap-2">
            {selectedTopics.map((t) => (
              <span key={t.id} className="text-xs bg-white border border-blue-200 rounded px-2.5 py-1 text-blue-950 font-medium">
                <strong>{t.code}</strong> : {t.titre.substring(0, 42)}...
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <span className="text-amber-400 font-bold uppercase tracking-wider text-xs block mb-1">
            Espace Candidat Doctorat · USMBA Fès
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {tab === 'login' ? 'Connexion à votre espace candidat' : tab === 'register' ? 'Création de votre compte candidat' : 'Récupération du mot de passe'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Accédez à la saisie de votre parcours, déposez vos pièces avec assistance OCR et suivez l'instruction de votre dossier en temps réel.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => { setTab('login'); setFeedbackMessage(null); }}
            className={`flex-1 py-3.5 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'login'
                ? 'border-blue-900 text-blue-950 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => { setTab('register'); setFeedbackMessage(null); }}
            className={`flex-1 py-3.5 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'register'
                ? 'border-blue-900 text-blue-950 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {feedbackMessage && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs">
              {feedbackMessage}
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <div className="space-y-6">
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
                      placeholder="candidat@usmba.ac.ma ou e-mail personnel"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
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
                      className="text-xs text-blue-900 hover:underline font-medium"
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
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-900 text-slate-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter et continuer la candidature</span>
                </button>
              </form>

              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Comptes de démonstration — accès par rôle</span>
                  <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Local uniquement</span>
                </div>
                <p className="text-xs text-slate-600">Mot de passe commun : <strong>DoctoratDemo2026!</strong>. Ces comptes sont fictifs et ne sont pas des comptes institutionnels.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {demoLogins.map(([address, label]) => (
                    <button key={address} type="button" onClick={() => openDemoAccount(address)} className="p-3 border border-slate-300 rounded-xl hover:border-blue-900 hover:bg-blue-50/50 text-left transition-colors">
                      <span className="font-bold text-slate-900 block">{label}</span>
                      <span className="text-slate-500 text-[10px] break-all">{address}</span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={handleResetDemo} className="text-xs font-semibold text-rose-800 underline underline-offset-2">Réinitialiser les données de démonstration de ce navigateur</button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <span className="text-[10px] text-slate-400">Identique à la carte d’identité (CIN)</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    N° CIN ou Passeport *
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
                  <span className="text-[10px] text-slate-400">Vérification cursus national marocain</span>
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
                  <option value="lmd_master">Master LMD (Recherche ou Spécialisé - Bac+5)</option>
                  <option value="ingenieur">Diplôme d’Ingénieur d’État (Bac+5)</option>
                  <option value="etranger_equivalence">Diplôme étranger (nécessitant équivalence ministérielle)</option>
                  <option value="autre_specifique">Autre diplôme / parcours spécifique atypique</option>
                </select>
                <span className="text-[10px] text-slate-500">
                  La checklist personnalisée des pièces à fournir s’adaptera automatiquement à ce choix.
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

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
              <p>✓ <strong>Compte local :</strong> créé et conservé dans ce navigateur pour cette démonstration.</p>
                <p>
                  ✓ <strong>Conservation du panier :</strong> Vos {cartCount} sujet(s) seront rattachés directement à votre candidature.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer mon compte et continuer ma candidature</span>
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
                onClick={() => setFeedbackMessage('Un e-mail de réinitialisation fictif a été généré avec succès pour cette démonstration.')}
                className="w-full py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
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

          {/* Explicit disclaimer about simulated auth */}
      <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              <strong>Démonstration locale :</strong> les comptes, profils et dossiers restent dans ce navigateur. Ne saisissez pas de données personnelles réelles ni de pièces officielles ; ce prototype ne fournit ni sécurité ni authentification institutionnelle.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
