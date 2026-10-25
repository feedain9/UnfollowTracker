# Soumission UnfollowTracker 1.2.0 — fiche à recopier

État au 25 octobre 2026 : **préparée, non soumise**. La 1.2.0 ajoute des statistiques d’usage anonymes, désactivables dans le panneau, une page de bienvenue après l’installation et un sondage de désinstallation. Aucune permission n’est ajoutée : la mise à jour automatique n’exige pas de nouvelle approbation des utilisateurs.

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

## Après publication

Vérifier dans Plausible (`extension.unfollow.yadulink.com`) l’arrivée des premiers `Update` (utilisateurs existants), `Active` et `Install`, puis consigner la date de publication ici et dans `SUBMIT-NOW.md`.
