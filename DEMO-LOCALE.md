# Mode de démonstration locale

Cette version permet de parcourir les espaces du prototype sans Firebase, IAM, facturation Cloud ni comptes institutionnels.

## Démarrer

À la racine du dépôt :

```bash
pnpm install
pnpm dev
```

Ouvrir l’adresse locale indiquée par Vite. La page commence en mode visiteur. Pour ouvrir un espace d’acteur, choisir **Connexion**, puis cliquer sur le compte de démonstration correspondant.

## Comptes de démonstration

Le mot de passe commun est `DoctoratDemo2026!`.

| Espace | Adresse |
|---|---|
| Candidat | `candidat.demo@example.com` |
| Directeur de thèse | `encadrant.demo@example.com` |
| Laboratoire | `laboratoire.demo@example.com` |
| Agent de scolarité | `agent.demo@example.com` |
| CEDoc | `cedoc.demo@example.com` |
| Administration | `admin.demo@example.com` |

Les comptes sont fictifs et leur rôle n’est pas une autorisation de production. La création de compte candidat est enregistrée localement dans le navigateur.

## OCR et documents

Le candidat peut déposer une image JPEG/PNG ou un PDF de 10 Mo maximum. **Aide OCR** lit réellement le fichier en français et en arabe dans le navigateur : les PDF sont rendus page par page avant la reconnaissance. Les bibliothèques et modèles OCR sont chargés depuis des CDN lors de la première utilisation ; une connexion Internet est donc nécessaire. L’extraction peut échouer si le réseau est indisponible, et l’interface affiche alors une erreur au lieu d’inventer un résultat.

Le texte reconnu et son niveau moyen de confiance sont des aides de lecture. Ils ne prouvent pas l’identité du candidat, l’origine du diplôme, la validité d’un QR code ni l’authenticité d’une pièce. La validation administrative reste une décision humaine.

## Où sont conservées les données ?

Les profils, comptes de démonstration, panier, dossiers et décisions restent dans `localStorage`. Les fichiers sont conservés dans `IndexedDB` du navigateur afin que les aperçus restent accessibles après actualisation. Ces données ne sont pas synchronisées entre appareils et peuvent être effacées en supprimant les données du site dans le navigateur.

Ce stockage local n’est pas chiffré et n’est pas adapté aux dossiers officiels. Utiliser uniquement des données fictives ou des documents autorisés pour une démonstration. Aucun courriel, notification, contrôle d’authenticité ni dépôt serveur n’est effectué.
