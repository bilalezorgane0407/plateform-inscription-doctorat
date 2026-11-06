import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomeHero } from './components/HomeHero';
import { TopicsCatalogue } from './components/TopicsCatalogue';
import { TopicDetailModal } from './components/TopicDetailModal';
import { CartView } from './components/CartView';
import { AuthModal } from './components/AuthModal';
import { ApplicationForm } from './components/ApplicationForm';
import { TrackingView } from './components/TrackingView';
import { RoleDashboards } from './components/RoleDashboards';
import { 
  INITIAL_CONFIG, 
  MOCK_TOPICS, 
  DEMO_PROFILES, 
  SAMPLE_APPLICATIONS 
} from './data/mockData';
import { 
  Application, 
  CandidateProfile, 
  DocumentStatus, 
  PlatformConfig, 
  Topic, 
  UserRole,
  VerificationMethod
} from './types';
import { GraduationCap, ShieldCheck, HelpCircle } from 'lucide-react';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('catalogue');

  // Config
  const [config, setConfig] = useState<PlatformConfig>(INITIAL_CONFIG);

  // Topics
  const [topics, setTopics] = useState<Topic[]>(MOCK_TOPICS);
  const [selectedTopicModal, setSelectedTopicModal] = useState<Topic | null>(null);

  // Cart: Up to 3 topics by default, not ranked
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([
    MOCK_TOPICS[0].id,
    MOCK_TOPICS[1].id,
  ]);

  // Auth & Roles
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>('visiteur');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile>(DEMO_PROFILES.lmd);

  // Applications
  const [applications, setApplications] = useState<Application[]>(SAMPLE_APPLICATIONS);
  const [currentApplicationId, setCurrentApplicationId] = useState<string>(SAMPLE_APPLICATIONS[0].id);

  // Toggle topic selection in cart
  const handleToggleSelectTopic = (topic: Topic) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes(topic.id)) {
        return prev.filter((id) => id !== topic.id);
      }
      if (prev.length >= config.maxSujetsParCandidat) {
        return prev;
      }
      return [...prev, topic.id];
    });
  };

  const handleRemoveFromCart = (topicId: string) => {
    setSelectedTopicIds((prev) => prev.filter((id) => id !== topicId));
  };

  // Click on "Continuer ma candidature"
  const handleContinueApplication = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      setCurrentTab('candidature');
    }
  };

  // Successful auth: preserve cart and proceed
  const handleLoginSuccess = (profile: CandidateProfile) => {
    setCandidateProfile(profile);
    setIsAuthenticated(true);
    setUserRole('candidat');
    setAuthModalOpen(false);
    setCurrentTab('candidature');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('visiteur');
  };

  // Submit new application
  const handleSubmitApplication = (newApp: Application) => {
    setApplications((prev) => [newApp, ...prev]);
    setCurrentApplicationId(newApp.id);
    setCurrentTab('suivi');
  };

  // Update document status (for targeted correction without losing application)
  const handleUpdateDocumentStatus = (
    docId: string,
    newStatus: DocumentStatus,
    fileName?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === currentApplicationId) {
          const updatedDocs = app.documents.map((d) => {
            if (d.id === docId) {
              return {
                ...d,
                statut: newStatus,
                fichierNom: fileName || d.fichierNom,
                fichierDate: new Date().toLocaleDateString('fr-FR'),
                motifCorrection: undefined,
                actionAttendue: undefined,
              };
            }
            return d;
          });

          // Check if any pieces still need correction
          const stillNeedFix = updatedDocs.some((d) => d.statut === 'a_corriger');

          return {
            ...app,
            documents: updatedDocs,
            statut: stillNeedFix ? 'pieces_a_corriger' : 'en_cours_verification_pieces',
            historique: [
              {
                id: `h-${Date.now()}`,
                date: `${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                acteur: `${app.candidat.prenom} ${app.candidat.nom}`,
                role: 'Candidat',
                action: `Re-dépôt de la pièce corrigée : ${fileName || docId}.`,
              },
              ...app.historique,
            ],
          };
        }
        return app;
      })
    );
  };

  // Role actions
  const handleUpdateApplicationStatus = (
    appId: string,
    status: any,
    historyLog: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          return {
            ...a,
            statut: status,
            historique: [
              {
                id: `h-${Date.now()}`,
                date: `${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                acteur: 'Service Scolarité / Administration USMBA',
                role: 'Administration',
                action: historyLog,
              },
              ...a.historique,
            ],
          };
        }
        return a;
      })
    );
  };

  const handleUpdateDocVerification = (
    appId: string,
    docId: string,
    status: DocumentStatus,
    method: VerificationMethod,
    motif?: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          const updatedDocs = a.documents.map((d) => {
            if (d.id === docId) {
              return {
                ...d,
                statut: status,
                methodeVerification: method,
                motifCorrection: motif,
                actionAttendue: motif ? 'Veuillez téléverser un document net et conforme.' : undefined,
                verifiePar: 'Agent de contrôle scolarité USMBA',
                dateVerification: new Date().toLocaleDateString('fr-FR'),
              };
            }
            return d;
          });

          return {
            ...a,
            documents: updatedDocs,
            statut: status === 'a_corriger' ? 'pieces_a_corriger' : a.statut,
            historique: [
              {
                id: `h-${Date.now()}`,
                date: `${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                acteur: 'Agent de contrôle scolarité',
                role: 'Scolarité',
                action: `Contrôle de la pièce : ${status === 'verifiee' ? 'Validée' : 'Demande de correction'}.`,
                motif: motif,
              },
              ...a.historique,
            ],
          };
        }
        return a;
      })
    );
  };

  const handleSaveProfessorAvis = (
    appId: string,
    topicId: string,
    avis: 'favorable' | 'reserve' | 'defavorable',
    motif: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          return {
            ...a,
            evaluationsEncadrants: {
              ...a.evaluationsEncadrants,
              [topicId]: {
                encadrantNom: 'Pr. Karim BENJELLOUN',
                avis: avis,
                motif: motif,
                date: new Date().toLocaleDateString('fr-FR'),
              },
            },
            historique: [
              {
                id: `h-${Date.now()}`,
                date: `${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                acteur: 'Pr. Karim BENJELLOUN',
                role: 'Directeur de thèse',
                action: `Émission d'un avis ${avis.toUpperCase()} sur le sujet ${topicId}.`,
                motif: motif,
              },
              ...a.historique,
            ],
          };
        }
        return a;
      })
    );
  };

  const handleScheduleInterview = (
    appId: string,
    date: string,
    lieu: string
  ) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id === appId) {
          return {
            ...a,
            statut: 'convoque_entretien',
            validationCedoc: {
              ...a.validationCedoc,
              statut: 'convoque',
              dateEntretien: date,
              lieuEntretien: lieu,
              commentaireCommission: 'Présentez-vous avec vos pièces originales et votre projet doctoral imprimé.',
            },
            historique: [
              {
                id: `h-${Date.now()}`,
                date: `${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
                acteur: 'Commission CEDoc Sciences et Technologies',
                role: 'CEDoc',
                action: `Convocation du candidat à l'entretien oral le ${date}.`,
              },
              ...a.historique,
            ],
          };
        }
        return a;
      })
    );
  };

  // Cart topics
  const selectedTopics = topics.filter((t) => selectedTopicIds.includes(t.id));
  const activeApp = applications.find((a) => a.id === currentApplicationId) || applications[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        cartCount={selectedTopicIds.length}
        userRole={userRole}
        onChangeUserRole={(role) => {
          setUserRole(role);
          if (role !== 'visiteur') {
            setIsAuthenticated(true);
          }
          if (['agent_verificateur', 'professeur', 'laboratoire', 'cedoc', 'administrateur'].includes(role)) {
            setCurrentTab('acteurs');
          }
        }}
        isAuthenticated={isAuthenticated}
        currentUserNom={candidateProfile ? `${candidateProfile.prenom} ${candidateProfile.nom}` : undefined}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Tab 1: Catalogue & Home */}
        {currentTab === 'catalogue' && (
          <div>
            <HomeHero
              config={config}
              onExploreTopics={() => {
                const el = document.getElementById('topics-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewPanier={() => setCurrentTab('panier')}
              cartCount={selectedTopicIds.length}
            />

            <div id="topics-section">
              <TopicsCatalogue
                topics={topics}
                selectedTopicIds={selectedTopicIds}
                onToggleSelectTopic={handleToggleSelectTopic}
                onOpenTopicDetails={(t) => setSelectedTopicModal(t)}
                config={config}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Panier */}
        {currentTab === 'panier' && (
          <CartView
            selectedTopics={selectedTopics}
            onRemoveTopic={handleRemoveFromCart}
            onContinueApplication={handleContinueApplication}
            onExploreMore={() => setCurrentTab('catalogue')}
            onOpenDetails={(t) => setSelectedTopicModal(t)}
            config={config}
          />
        )}

        {/* Tab 3: Candidature Form & OCR */}
        {currentTab === 'candidature' && (
          <ApplicationForm
            candidateProfile={candidateProfile}
            selectedTopics={selectedTopics}
            onUpdateProfile={setCandidateProfile}
            onSubmitApplication={handleSubmitApplication}
            config={config}
            onExploreTopics={() => setCurrentTab('catalogue')}
          />
        )}

        {/* Tab 4: Suivi Candidat */}
        {currentTab === 'suivi' && (
          <TrackingView
            application={activeApp}
            onUpdateDocumentStatus={handleUpdateDocumentStatus}
            onSelectApplicationById={(id) => setCurrentApplicationId(id)}
            sampleApplications={applications}
          />
        )}

        {/* Tab 5: Espaces Acteurs & Administration */}
        {currentTab === 'acteurs' && (
          <RoleDashboards
            currentRole={userRole === 'candidat' || userRole === 'visiteur' ? 'agent_verificateur' : userRole}
            onChangeRole={(role) => setUserRole(role)}
            applications={applications}
            topics={topics}
            config={config}
            onUpdateConfig={setConfig}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onUpdateDocVerification={handleUpdateDocVerification}
            onSaveProfessorAvis={handleSaveProfessorAvis}
            onScheduleInterview={handleScheduleInterview}
          />
        )}

      </main>

      {/* Topic Detail Modal */}
      {selectedTopicModal && (
        <TopicDetailModal
          topic={selectedTopicModal}
          onClose={() => setSelectedTopicModal(null)}
          isSelected={selectedTopicIds.includes(selectedTopicModal.id)}
          onToggleSelect={handleToggleSelectTopic}
          isCartFull={selectedTopicIds.length >= config.maxSujetsParCandidat}
          config={config}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        cartCount={selectedTopicIds.length}
      />

      {/* Institutional Footer */}
      <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-800 text-amber-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">
                  USMBA Doctorat
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Université Sidi Mohamed Ben Abdellah de Fès (المملكة المغربية). 
                Prototype fonctionnel dédié à l’optimisation du parcours candidat et à la dématérialisation des inscriptions en doctorat.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Centres d’Études Doctorales (CEDoc)
              </h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li>CEDoc Sciences et Technologies</li>
                <li>CEDoc Sciences Médicales et Biomédicales</li>
                <li>CEDoc Droit, Économie et Gestion</li>
                <li>CEDoc Lettres, Sciences Humaines et Sociales</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Établissements USMBA
              </h4>
              <ul className="space-y-1.5 text-slate-400 text-xs">
                <li>FST Fès · Faculté des Sciences et Techniques</li>
                <li>FS Dhar El Mahraz · Faculté des Sciences</li>
                <li>ENSA Fès · École Nationale des Sciences Appliquées</li>
                <li>ENCG Fès · École Nationale de Commerce et Gestion</li>
                <li>FMP Fès · Faculté de Médecine et de Pharmacie</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">
                Garanties & Confidentialité
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Ce prototype utilise des données fictives à visée de démonstration. L'ensemble des contrôles OCR est soumis à confirmation humaine. Aucune donnée personnelle n'est transmise à des tiers.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
            <p>© 2026 Université Sidi Mohamed Ben Abdellah de Fès · Prototype de recherche & d'innovation numérique</p>
            <p>Conforme aux directives d'accessibilité et de dématérialisation des universités marocaines</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
