# Soumettre UnfollowTracker 1.1.0

Le propriétaire a autorisé la soumission. Le navigateur connecté bloque l’automatisation de la console du Web Store avec « The extensions gallery cannot be scripted ». La soumission n’a donc pas eu lieu. Ces opérations doivent être effectuées directement dans le tableau de bord ; les fichiers et les textes sont prêts.

## Fichier à importer

Dans [le tableau de bord du propriétaire](https://chrome.google.com/webstore/devconsole/8f5cb986-87d0-436a-8570-16e07303d819), choisir le nouvel élément ou la fiche UnfollowTracker existante, puis importer `dist/unfollowtracker-1.1.0.zip`. Ne pas créer une deuxième fiche si la première existe déjà.

Archive : 22 fichiers, 82 269 octets, version 1.1.0, manifeste à la racine.

SHA-256 : `1613fca0a0f690723b6e717c4864f6c2c35cc33ca7c8807fc2e6e0bc61f918dd`.

## Fiche publique

- Nom : **UnfollowTracker**.
- Langue par défaut du manifeste : anglais. Ajouter la traduction française.
- Descriptions courte et détaillée des deux langues : [STORE-LISTING.md](STORE-LISTING.md).
- Catégorie conseillée : Social & Communication, ou sa catégorie sociale équivalente proposée par le tableau de bord actuel.
- Prix : gratuit ; visibilité publique ; aucune restriction géographique demandée par le propriétaire.
- Site : `https://unfollow.yadulink.com/en/` ; version française `https://unfollow.yadulink.com/fr/`.
- Support : `https://unfollow.yadulink.com/en/getting-started/`, email `support@yadulink.com`.
- Confidentialité : `https://unfollow.yadulink.com/en/privacy/` ; version française `/fr/privacy/`.
- Images : `docs/release/assets/icon128.png`, `promo-440x280.png`, `screenshot-en-1280x800.png`, `screenshot-fr-1280x800.png`.

## Pratiques de confidentialité

Recopier la finalité unique et les justifications de `sidePanel`, `storage`, `scripting` et de l’accès à Instagram depuis [PRIVACY-AND-PERMISSIONS.md](PRIVACY-AND-PERMISSIONS.md). Aucun code distant n’est exécuté. Déclarer le traitement des données identifiantes, de session et des listes sociales selon les catégories exactes du formulaire ; leur traitement local ne signifie pas « aucune donnée ». Les listes ne sont ni vendues ni envoyées à un serveur UnfollowTracker. Les trois engagements de non-vente, d’usage conforme à la finalité et d’absence d’usage pour le crédit correspondent au code préparé.

## Instructions pour l’équipe de vérification — texte anglais

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

Enregistrer chaque section, corriger les éventuels champs manquants signalés par le tableau de bord, puis choisir **Soumettre pour examen**. Une soumission est terminée seulement lorsque le tableau de bord affiche l’état d’examen. Une éventuelle vérification du compte développeur ou acceptation contractuelle devra être faite par le titulaire du compte.

Après validation publique : récupérer l’URL officielle de la fiche, la renseigner dans `site/publication.json` à la clé `storeUrl`, vérifier les tests et pousser sur `main`. Cela active les boutons d’installation lors du déploiement suivant. Le fait d’obtenir un identifiant de brouillon ou un état « en examen » ne suffit pas à activer ce lien.
