# Rapport tutoriel d’utilisation et d’évaluation

## USMBA Doctorat

### Tutoriel de prise en main du prototype

## Résumé

Ce tutoriel présente les principaux parcours du prototype USMBA Doctorat : consultation des sujets, sélection dans le panier, création d’un compte candidat, préparation du dossier, lecture OCR et contrôle par les acteurs. Il aide les testeurs à comprendre les actions possibles et les limites de la démonstration locale.

**Important :** ce document décrit une maquette de test. Les rôles, données, règles, avis, validations et convocations ne constituent pas une procédure officielle de l’USMBA.

## Présentation de l’application

USMBA Doctorat est un prototype de consultation des sujets et de candidature au doctorat. Le catalogue est accessible au visiteur sans compte. Le compte candidat devient nécessaire au moment de poursuivre une candidature. Les acteurs disposent chacun d’un espace de démonstration correspondant à leur tâche.

### Les espaces proposés

- **Visiteur :** rechercher les sujets, lire les fiches et préparer un panier.
- **Candidat :** créer un compte local, compléter le dossier, déposer les pièces et suivre la candidature.
- **Agent de scolarité :** examiner les pièces et enregistrer un contrôle ou une demande de correction.
- **Directeur de thèse / encadrant :** enregistrer un avis scientifique motivé.
- **Laboratoire :** examiner la capacité d’accueil pour chaque sujet.
- **CEDoc :** planifier les entretiens et consulter les dossiers liés à cette étape.
- **Administration :** accéder à la vue administrative du prototype.

### Ouvrir le prototype

À la racine du dépôt, exécuter `pnpm install`, puis `pnpm dev`. Ouvrir dans le navigateur l’adresse locale affichée. Le site démarre en mode Visiteur.

### Comptes de démonstration

Dans l’écran Connexion, cliquer sur la carte correspondant au rôle souhaité. Si le mot de passe est demandé, utiliser **DoctoratDemo2026!**. Les identifiants ci-dessous sont fictifs :

- Candidat — `candidat.demo@example.com`
- Directeur / encadrant — `encadrant.demo@example.com`
- Laboratoire — `laboratoire.demo@example.com`
- Agent de scolarité — `agent.demo@example.com`
- CEDoc — `cedoc.demo@example.com`
- Administration — `admin.demo@example.com`

## Parcours Visiteur : consulter les sujets

1. Parcourir les sujets affichés dans le catalogue sans ouvrir de compte.
2. Utiliser la recherche pour retrouver un sujet par titre, domaine, établissement, laboratoire ou nom d’encadrant.
3. Ouvrir **Fiche complète & prérequis** afin de consulter le résumé, les critères et le parcours accepté.
4. Cliquer sur **Ajouter au panier** pour retenir un sujet. Le panier autorise jusqu’à trois choix simultanés, sans ordre de préférence.
5. Ouvrir le panier pour vérifier la sélection, retirer un sujet si nécessaire, puis sélectionner **Continuer ma candidature**.

Le panier est conservé pendant le passage à la connexion. La création de compte candidat intervient après la consultation et le choix des sujets.

### Créer un compte candidat

Dans l’écran d’authentification, choisir **Créer un compte**, compléter les informations demandées et sélectionner la nature du parcours académique. La création locale ouvre l’espace candidat. Les comptes d’encadrant et d’administration ne se créent pas depuis le formulaire candidat : utiliser les cartes de démonstration.

Après la connexion, le candidat complète les informations de cursus et poursuit les étapes du dossier. Les informations non renseignées doivent rester à compléter : ne pas considérer les exemples de démonstration comme des données officielles.

## Parcours Candidat : préparer et soumettre le dossier

### Étape 1 — Profil et parcours

Vérifier le profil et choisir le parcours correspondant : Master LMD, diplôme d’ingénieur, diplôme étranger avec équivalence ou parcours spécifique. Renseigner l’intitulé, la spécialité, l’établissement et les autres informations de formation demandées. La liste des pièces dépend du parcours.

### Étape 2 — Pièces et OCR

1. Pour chaque pièce, cliquer sur **Sélectionner fichier** et choisir un document PDF, PNG ou JPEG de 10 Mo maximum.
2. Vérifier le nom du fichier et consulter son aperçu.
3. Pour les documents pris en charge, lancer **Aide OCR**. Le fichier choisi est traité dans le navigateur. Les modèles français et arabe nécessitent une connexion Internet lors de leur chargement.
4. Lire le texte extrait. Pour un PDF de plusieurs pages, utiliser les commandes **Page précédente** et **Page suivante**.
5. Cliquer sur **Enregistrer le texte extrait** pour conserver le résultat avec la pièce.

**À retenir :** l’OCR extrait du texte, mais n’authentifie pas un document. Le niveau de confiance mesure l’estimation de lecture du moteur, pas la validité d’une pièce. Une erreur de lecture doit être corrigée ou examinée par une personne.

### Étape 3 — Aide à l’adéquation

Examiner le diagnostic affiché pour les sujets choisis. Il aide à repérer les informations manquantes, mais ne décide pas seul de l’éligibilité du candidat. Un parcours atypique ou une discordance appelle une vérification humaine.

## Soumission et contrôle administratif

### Étape 4 — Vérification et soumission

1. Relire le profil, les sujets retenus et les pièces.
2. Corriger les pièces obligatoires manquantes ou signalées à corriger.
3. Cliquer sur **Confirmer et soumettre définitivement ma candidature**.
4. Consulter le suivi du dossier et vérifier le statut affiché.

### Espace Agent de scolarité

1. Rechercher puis ouvrir un dossier.
2. Sélectionner une pièce dans la liste. Parcourir les documents avec **Précédente** et **Suivante**.
3. Examiner l’aperçu du fichier original. Si un résultat OCR est disponible, comparer le texte extrait avec le document.
4. Choisir **Valider le contrôle** ou **Demander une correction**. Pour une correction, saisir un motif compréhensible et indiquer l’action attendue.
5. Vérifier le message de confirmation et le nouveau statut.

Un nom de fichier ne suffit pas pour valider une pièce. Certains dossiers d’exemple affichent un nom fictif sans fichier réel : l’aperçu est alors indisponible et l’action de validation ne peut pas être effectuée. Une validation administrative ne certifie pas l’authenticité externe d’un document.

## Espaces des acteurs, données et limites

### Directeur de thèse / encadrant

Examiner les candidatures liées aux sujets concernés, choisir un avis favorable, réservé ou défavorable, rédiger le motif puis enregistrer la décision.

### Laboratoire

Examiner les candidatures et choisir séparément, pour chaque sujet, si la capacité d’accueil est confirmée ou indisponible. Vérifier que la décision affichée concerne bien le sujet retenu.

### CEDoc

Choisir une date, une heure et un lieu d’entretien à l’aide des champs de sélection, enregistrer la convocation et vérifier le statut. Dans le prototype, la convocation ne transmet pas de courriel réel.

### Administration

Consulter la vue administrative et les informations de campagne proposées. Les changements restent des réglages de démonstration.

### Conservation et confidentialité

Les profils, comptes créés, paniers, candidatures, décisions et résultats OCR sont conservés dans le navigateur utilisé ; les fichiers sont gardés dans IndexedDB. Les données ne sont pas synchronisées entre appareils. Le mode démo n’utilise pas Firebase, Firebase Admin, Storage ou Google Document AI.

Le stockage du navigateur n’est pas chiffré. Utiliser des documents fictifs marqués **SPÉCIMEN** ou des fichiers anonymisés. Ne pas déposer de pièces officielles ou sensibles. Les comptes de démonstration ne sont pas des comptes sécurisés de production.

### Réinitialiser ou dépanner

La réinitialisation des données de démonstration est accessible depuis l’écran Connexion et demande confirmation. En cas d’échec OCR, vérifier Internet et la lisibilité du document. En cas d’aperçu absent, déposer de nouveau le fichier depuis l’espace candidat. Si les données semblent disparues, vérifier le navigateur utilisé et que ses données de site n’ont pas été supprimées.
