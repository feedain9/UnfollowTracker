# Soumission UnfollowTracker 1.2.0 — fiche à recopier

État : **version 1.2.0 envoyée pour examen le 25 octobre 2026**, depuis la session Brave du propriétaire avec le pilotage natif CUA. Google a affiché « Votre extension a été envoyée pour examen » et l’état **En attente d’examen** ; l’option **publier automatiquement une fois examiné et approuvé** est restée cochée, comme pour la 1.1.0. Le site (politique de confidentialité, `/welcome/`, `/uninstalled/`, mesure Plausible) est en ligne depuis le commit `454a6fd`, vérifié en production. Archive : `dist/unfollowtracker-1.2.0.zip`, 23 fichiers, 88 564 octets, SHA-256 `7592d913d50bf7f7d1684b9ab4d2f6f8d23da0af909099df850655afcf49697d`. La 1.2.0 ajoute des statistiques d’usage anonymes, désactivables dans le panneau, une page de bienvenue après l’installation et un sondage de désinstallation. Aucune permission n’est ajoutée : la mise à jour automatique n’exige pas de nouvelle approbation des utilisateurs.

## Avant la soumission

1. Le site doit être déployé avec la nouvelle politique de confidentialité (`/fr/privacy/`, `/en/privacy/`), `/welcome/` et `/uninstalled/` : la 1.2.0 ouvre ces pages.
2. Construire et vérifier l’archive : `npm ci --ignore-scripts`, `npm test`, `npm run lint`, `npm run test:browser`, `npm run build:site`, `npm run test:site`, puis `npm run build`. Archive : `dist/unfollowtracker-1.2.0.zip` et son `.sha256`.
3. Les sites Plausible `unfollow.yadulink.com` et `extension.unfollow.yadulink.com` existent depuis le 25 octobre 2026, avec leurs objectifs et propriétés ([mesure d’audience](../analytics/MEASUREMENT.md)).

## Dans la console, fiche `ckkgnnifiojkmmfmeejeebafldholdnc`

- **Package** : importer `dist/unfollowtracker-1.2.0.zip` sur la fiche existante. Ne pas créer de nouvelle fiche.
- **Fiche** : remplacer les descriptions détaillées FR et EN par celles de [STORE-LISTING.md](STORE-LISTING.md). Seul le paragraphe sur les données change.
- **Pratiques de confidentialité** : finalité unique et justifications des permissions inchangées. Garder les catégories déjà cochées et cocher en plus **Localisation** et **Activité de l’utilisateur**, selon [PRIVACY-AND-PERMISSIONS.md](PRIVACY-AND-PERMISSIONS.md). Code distant : **Non**. Les trois attestations restent cochées. URL de confidentialité inchangée.
- **Instructions pour l’équipe de vérification** (440 caractères, limite 500) :

```text
No UnfollowTracker login or subscription. Use Chrome 116+ and an Instagram account controlled by the reviewer; sign in directly on instagram.com. Open the side panel, select Scan my account, keep Instagram open. Check search, profile links and JSON export; cancel the Unfollow confirmation. Anonymous usage statistics (no Instagram data) can be turned off at the bottom of the panel. Guide: https://unfollow.yadulink.com/en/getting-started/
```

## Envoi du 25 octobre 2026

- **Package** : le brouillon est passé de 1.1.0 à 1.2.0 ; autorisations affichées inchangées (`storage`, `scripting`, `sidePanel`, accès à l’hôte).
- **Fiche** : descriptions anglaise (1 716 caractères) et française (1 929 caractères) remplacées. Avant modification, le texte en ligne était identique à celui de la 1.1.0 ; seul le paragraphe sur les données a changé.
- **Confidentialité** : Localisation et Activité de l’utilisateur cochées en plus des quatre catégories existantes ; code distant Non ; attestations et URL inchangées.
- **Instructions de test** : texte ci-dessus, enregistré le 25 octobre 2026 ; identifiants de test laissés vides.
- Brouillon relu après rechargement de la page, avant l’envoi. La page État affichait alors « La publication de ce brouillon a été annulée » (origine inconnue, aucune trace dans ce dépôt), sans bloquer l’envoi.

## Après publication

Vérifier dans Plausible (`extension.unfollow.yadulink.com`) l’arrivée des premiers `Update` (utilisateurs existants), `Active` et `Install`, puis consigner la date de publication ici et dans `SUBMIT-NOW.md`.
