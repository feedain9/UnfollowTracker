# Soumission UnfollowTracker 1.1.0

Version **1.1.0 envoyée pour examen le 6 octobre 2026**, depuis la session Brave du propriétaire avec le pilotage natif CUA. Google a affiché « Votre extension a été envoyée pour examen » et l’état **En attente d’examen**. L’option **publier automatiquement une fois examiné et approuvé** est activée. L’extension n’est pas encore approuvée ni disponible à l’installation publique.

La restriction de script DOM de la galerie ne bloquait pas le formulaire en mode ordinateur. Les descriptions et captures FR/EN, l’icône, la vignette promotionnelle, les déclarations de confidentialité et les instructions de test ont été enregistrées avant cet envoi. Distribution : **Sans frais**, **Public**, **Toutes les régions**. Capture locale de confirmation : `.impeccable/review/store-submitted.jpg` (non publiée dans le dépôt).

## Package soumis

Fiche existante **ckkgnnifiojkmmfmeejeebafldholdnc** dans [le tableau de bord du propriétaire](https://chrome.google.com/webstore/devconsole/8f5cb986-87d0-436a-8570-16e07303d819/ckkgnnifiojkmmfmeejeebafldholdnc/edit). La version 1.1.0 déjà importée a été vérifiée sur la page Package ; aucune deuxième fiche n’a été créée. Archive locale correspondante : `dist/unfollowtracker-1.1.0.zip`.

Archive : 22 fichiers, 82 269 octets, version 1.1.0, manifeste à la racine.

SHA-256 : `1613fca0a0f690723b6e717c4864f6c2c35cc33ca7c8807fc2e6e0bc61f918dd`.

## Fiche publique

- Nom : **UnfollowTracker**.
- Langue par défaut du manifeste : anglais ; traduction française enregistrée.
- Descriptions courte et détaillée des deux langues : [STORE-LISTING.md](STORE-LISTING.md).
- Catégorie sélectionnée dans le tableau de bord : **Réseaux sociaux**.
- Prix : gratuit ; visibilité publique ; aucune restriction géographique demandée par le propriétaire.
- Site : `https://unfollow.yadulink.com/en/` ; version française `https://unfollow.yadulink.com/fr/`.
- Support : `https://unfollow.yadulink.com/en/getting-started/`, email `support@yadulink.com`.
- Confidentialité : `https://unfollow.yadulink.com/en/privacy/` ; version française `/fr/privacy/`.
- Images : `docs/release/assets/icon128.png`, `promo-440x280.png`, `screenshot-en-1280x800.png`, `screenshot-fr-1280x800.png`.

## Pratiques de confidentialité

Finalité unique et justifications de `sidePanel`, `storage`, `scripting` et de l’accès à Instagram enregistrées en anglais, conformément à [PRIVACY-AND-PERMISSIONS.md](PRIVACY-AND-PERMISSIONS.md). Code distant : **Non**. Catégories cochées : informations personnelles identifiantes, informations d’authentification, historique Web et contenu du site Web. L’historique Web correspond uniquement au repérage de l’URL de l’onglet Instagram ; aucun historique général n’est enregistré. Les trois engagements de non-vente, d’usage conforme à la finalité et d’absence d’usage pour le crédit sont cochés.

## Instructions enregistrées pour l’équipe de vérification

Le formulaire limite ce champ à 500 caractères. Le texte suivant de 455 caractères a été enregistré. Les champs d’identifiant et de mot de passe sont vides : l’équipe utilise son propre compte Instagram, sans identifiants du propriétaire.

```text
No UnfollowTracker login or subscription. Use Chrome 116+ and an Instagram account controlled by the reviewer; sign in directly on instagram.com. Open the side panel, select Scan my account, and keep Instagram open. Check search, profile links and JSON export; cancel the per-account Unfollow confirmation. Test FR/EN and light/dark modes. Instagram rate limits/challenges are shown without bypass. Guide: https://unfollow.yadulink.com/en/getting-started/
```

## Guide de vérification détaillé — référence interne

```text
UnfollowTracker is a free desktop extension with a persistent side panel. It compares the current follower and following lists of the Instagram account already signed in within the user's browser. It does not offer historical unfollower tracking or bulk unfollowing.

1. Use Chrome 116 or later. Click the extension action to open the side panel.
2. With no Instagram tab, the panel offers an explicit Open Instagram action and starts no scan automatically.
3. Sign in directly at https://www.instagram.com with an Instagram account controlled by the reviewer. There is no separate UnfollowTracker account, password form, subscription or payment. No developer account credentials are embedded or required.
4. Choose Scan my account and keep the Instagram tab open. The side panel remains available while switching tabs. You may close and reopen the panel while the scan runs.
5. After a complete scan, inspect the non-reciprocal list, search for a username, open a profile or export the entire result as a local JSON file.
6. An individual Unfollow action first opens a confirmation. Cancel to test this interaction without changing the Instagram account.
7. Switch between English/French and light/dark mode. Delete saved scans only when using a disposable reviewer account/result.

Instagram may return a rate limit or require a security challenge. The extension pauses or stops with an explanation and retains the previous complete scan. It does not bypass these restrictions. A complete scan requires access to the reviewer's own Instagram account and normal Instagram responses; the extension has no independent test login. Store screenshots contain explicitly labeled fictional data.

Code, styles and fonts are packaged locally. Instagram requests go directly to Instagram. Profile images load from authorized Instagram/Meta image hosts. The publisher receives no follower lists, authentication tokens, passwords, advertising data or analytics. Full policy: https://unfollow.yadulink.com/en/privacy/
```

## Après l’examen

Attendre la décision de Google. Ne pas annuler ni renvoyer la version déjà en attente sans motif. Si Google demande une correction, conserver son motif exact et préparer les changements correspondants.

Après validation publique : récupérer l’URL officielle de la fiche, la renseigner dans `site/publication.json` à la clé `storeUrl`, vérifier les tests et pousser sur `main`. Cela active les boutons d’installation lors du déploiement suivant. Le fait d’obtenir un identifiant de brouillon ou un état « en examen » ne suffit pas à activer ce lien.
