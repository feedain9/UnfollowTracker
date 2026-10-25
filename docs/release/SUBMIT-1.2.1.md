# Soumission UnfollowTracker 1.2.1 — fiche à recopier

État au 25 octobre 2026 : **préparée sur la branche `release-1.2.1`, non soumise**. À soumettre une fois la 1.2.0 publiée : une seule version peut être en cours d’examen. Archive : `dist/unfollowtracker-1.2.1.zip`, 23 fichiers, 89 507 octets, SHA-256 `b4f108dcee351f99adf6715595ed1c6ef3a7274b353d9878842fc9d98dcc1a71`. Aucune permission n’est ajoutée.

## Ce qui change

- **Nom de la fiche**, issu du package et traduit : « UnfollowTracker – Qui ne vous suit pas en retour sur Instagram » et « UnfollowTracker – Who doesn’t follow you back on Instagram » (`_locales/*/messages.json`, 75 caractères maximum). Le nom court reste « UnfollowTracker ». Objectif : apparaître sur ces recherches dans le Chrome Web Store. Décision du propriétaire du 25 octobre 2026.
- **Invitation à laisser un avis** : une carte discrète, à côté d’un résultat complet, après trois scans complets d’une installation du store. Un clic sur « Laisser un avis » ou « Non merci » la ferme définitivement. Aucune contrepartie, conformément au règlement du store sur les avis.
- **Événement anonyme `Review Click`** quand l’utilisateur ouvre la page d’avis. La politique de confidentialité le mentionne, ainsi que la réponse mémorisée localement.

## Avant la soumission

1. Vérifier que la 1.2.0 est publiée.
2. Fusionner `release-1.2.1` dans `main` : la politique de confidentialité qui mentionne le nouvel événement doit être en ligne avant l’envoi.
3. Dans Plausible (`extension.unfollow.yadulink.com`), ajouter l’objectif personnalisé `Review Click`.
4. `npm ci --ignore-scripts`, `npm test`, `npm run lint`, `npm run test:browser`, `npm run build:site`, `npm run test:site`, puis `npm run build`. Comparer l’empreinte de l’archive.

## Dans la console, fiche `ckkgnnifiojkmmfmeejeebafldholdnc`

- **Package** : importer `dist/unfollowtracker-1.2.1.zip`. Vérifier sur la fiche que le titre issu du package s’affiche en français et en anglais.
- **Fiche** : descriptions inchangées ([STORE-LISTING.md](STORE-LISTING.md)).
- **Confidentialité** : inchangée ; « Activité de l’utilisateur » est déclarée depuis la 1.2.0. Code distant : Non.
- **Instructions de test** : inchangées.
- Envoyer pour examen, publication automatique après approbation.

Si l’examen refuse le nouveau nom (mots-clés jugés excessifs), revenir à « UnfollowTracker » dans les deux fichiers de langue et resoumettre ; l’invitation à laisser un avis peut rester.

## Après publication

Vérifier le titre de la fiche publique en français et en anglais, puis la position de la fiche sur « who doesn’t follow you back » et « qui ne me suit pas en retour » dans la recherche du store. Suivre `Review Click` et le nombre d’avis dans le tableau de bord.
