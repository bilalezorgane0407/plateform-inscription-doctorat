# Tutoriel utilisateur — Prototype USMBA Doctorat

## Objectif et périmètre

Ce tutoriel explique comment tester le prototype local de consultation des sujets, de candidature et d’instruction des dossiers. Il s’agit d’une démonstration de recherche : les rôles, les règles et les données ne remplacent pas une procédure officielle de l’USMBA.

## 1. Ouvrir le prototype

À la racine du dépôt, lancer `pnpm install`, puis `pnpm dev`. Ouvrir dans un navigateur l’adresse locale indiquée dans le terminal. Le site s’ouvre en **mode Visiteur** : aucune connexion n’est nécessaire pour explorer le catalogue.

Les comptes préconfigurés sont des accès de test fictifs. Dans **Connexion**, cliquer sur la carte de l’acteur souhaité. Le mot de passe commun, si une saisie manuelle est demandée, est `DoctoratDemo2026!`.

| Espace | Identifiant de démonstration |
|---|---|
| Candidat | candidat.demo@example.com |
| Directeur de thèse / encadrant | encadrant.demo@example.com |
| Laboratoire | laboratoire.demo@example.com |
| Agent de scolarité | agent.demo@example.com |
| CEDoc | cedoc.demo@example.com |
| Administration | admin.demo@example.com |

## 2. Parcours Visiteur : consulter les sujets

1. Parcourir les cartes de sujets sans créer de compte.
2. Utiliser la recherche par titre, discipline, établissement, laboratoire ou nom d’encadrant.
3. Ouvrir **Fiche complète & prérequis** pour lire la description et le parcours académique accepté.
4. Ajouter jusqu’à trois sujets au panier. Le choix est simultané, sans classement de préférence.
5. Ouvrir le panier pour revoir ou retirer une sélection.
6. Cliquer sur **Continuer ma candidature** pour accéder à la connexion ou à la création du compte candidat. Le panier est conservé dans le navigateur.

## 3. Parcours Candidat : préparer puis envoyer un dossier

### Étape 1 — Profil et parcours

Se connecter avec le compte Candidat ou créer un compte. La création publique concerne uniquement le rôle candidat. Choisir le type de parcours (Master LMD, diplôme d’ingénieur, diplôme étranger avec équivalence ou autre parcours). Compléter les champs du cursus affichés dans le formulaire et vérifier les informations proposées.

### Étape 2 — Déposer les pièces et utiliser l’OCR

1. Pour chaque pièce, cliquer sur **Sélectionner fichier** et choisir un PDF, une image PNG ou JPEG de 10 Mo maximum.
2. Vérifier le nom et l’aperçu du document. Le fichier est conservé dans le stockage du navigateur.
3. Pour une pièce prise en charge, cliquer sur **Aide OCR**. L’OCR traite le fichier choisi ; pour un PDF, il lit les pages une par une.
4. Relire le texte français ou arabe extrait. Pour un PDF multipage, utiliser **Page précédente** et **Page suivante**.
5. Cliquer sur **Enregistrer le texte extrait** pour l’associer à la pièce. Une erreur de chargement ou de lecture s’affiche sans produire de faux résultat.

L’OCR aide à lire un document. Son niveau de confiance mesure la qualité estimée de lecture ; il ne confirme ni l’identité, ni l’émetteur, ni la validité ou l’authenticité de la pièce.

### Étape 3 — Examiner l’adéquation

Lire le diagnostic affiché pour chaque sujet retenu. Il sert d’aide à l’orientation et ne remplace pas l’examen par le directeur de thèse, le laboratoire ou le CEDoc. En cas d’information manquante ou de parcours atypique, la décision doit rester humaine.

### Étape 4 — Vérifier et soumettre

Relire le récapitulatif : profil, sujets et pièces. Corriger les éléments manquants, puis cliquer sur **Confirmer et soumettre définitivement ma candidature**. Le dossier apparaît dans le suivi du candidat et dans les espaces de démonstration concernés.

## 4. Parcours des acteurs : examiner le dossier

Chaque carte de compte ouvre directement l’espace correspondant. Les actions sont simulées localement et leurs décisions sont conservées dans ce navigateur.

### Agent de scolarité — contrôle administratif

1. Rechercher et ouvrir le dossier dans la liste.
2. Sélectionner une pièce dans **Pièces du dossier**.
3. Examiner l’aperçu du PDF ou de l’image. Comparer le texte OCR, lorsqu’il existe, avec les informations visibles dans l’original.
4. Choisir **Valider le contrôle** si le contrôle administratif est terminé, ou **Demander une correction** et préciser le motif et l’action attendue.
5. Vérifier le message de confirmation et le nouveau statut.

Une validation administrative n’est pas une preuve d’authenticité externe. Un nom de fichier seul ne suffit pas à valider une pièce.

### Directeur de thèse / encadrant — avis scientifique

Examiner les candidatures liées aux sujets proposés, choisir un avis (favorable, réservé ou défavorable), rédiger le motif, puis enregistrer l’avis. Le motif permet au candidat et aux autres acteurs de comprendre la décision.

### Laboratoire — capacité d’accueil

Examiner chaque sujet séparément et enregistrer la capacité d’accueil ou son indisponibilité. La décision s’applique au sujet concerné, pas automatiquement à tous les sujets choisis par le candidat.

### CEDoc — entretien et délibération

Choisir une date, une heure et un établissement/lieu dans les champs proposés, puis enregistrer la convocation. Vérifier le message de confirmation et le statut du dossier. La notification est simulée : aucun courriel réel n’est envoyé.

### Administration

Consulter les informations de campagne et les vues administratives présentes dans le prototype. Les modifications de démonstration ne configurent pas le portail officiel.

## 5. Données, limites et conseils de test

- Le prototype revient en mode Visiteur après actualisation. Il faut ouvrir de nouveau un compte pour tester un autre rôle.
- Comptes créés, profils, panier, candidatures, décisions et OCR restent dans `localStorage` ; les fichiers sont dans `IndexedDB`. Ils sont disponibles uniquement dans le même navigateur et sur le même profil utilisateur.
- La réinitialisation des données de démo est accessible depuis l’écran de connexion et demande une confirmation. Elle efface les données locales du prototype.
- L’OCR charge son moteur et ses modèles depuis Internet lors de la première utilisation. En mode hors ligne, l’interface affiche une erreur.
- Pour les démonstrations, utiliser des documents fictifs portant la mention **SPÉCIMEN** ou des fichiers anonymisés. Le stockage local n’est pas chiffré.
- Les comptes ne sont pas des comptes Firebase. Aucune donnée n’est transmise à Firebase, à un service administratif, à l’université ou à un service d’authentification de document.
- Les décisions, convocations, courriels et contrôles d’authenticité réels ne sont pas exécutés par ce prototype.

## Dépannage rapide

| Situation | Action |
|---|---|
| Le compte ne s’ouvre pas | Utiliser la carte de démonstration de l’écran Connexion ; vérifier que le navigateur accepte le stockage local. |
| OCR indisponible | Vérifier la connexion Internet, puis réessayer avec une image nette ou un PDF lisible. |
| Aperçu absent | Sélectionner de nouveau le fichier depuis le formulaire candidat. Les fichiers d’exemple ne contiennent pas toujours un document réel. |
| Un dossier semble ancien après rechargement | Vérifier que le test est effectué dans le même navigateur/profil et que ses données de site n’ont pas été supprimées. |
| Un espace semble vide | Vérifier la connexion avec le compte de démonstration correspondant au rôle recherché. |
