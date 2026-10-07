# Dossier de publication — UnfollowTracker 1.1.0

Le site est publié sur https://unfollow.yadulink.com depuis le 5 octobre 2026. La version 1.1.0 a été soumise au Chrome Web Store le 6 octobre via le pilotage natif CUA dans Brave. La [fiche officielle](https://chromewebstore.google.com/detail/unfollowtracker/ckkgnnifiojkmmfmeejeebafldholdnc) a été vérifiée publiquement installable le 7 octobre 2026 : bouton « Add to Chrome », version 1.1.0, éditeur Yadulink. Les liens d’installation FR/EN sont configurés vers cette fiche.

## Artefacts et commandes

```sh
npm ci --ignore-scripts
npm test
npm run lint
npm run test:browser
npm run build:site
npm run test:site
node scripts/generate-store-assets.js
npm run build
```

`npm ci --ignore-scripts` suffit : la génération historique des icônes utilise un module canvas natif qui n’est pas nécessaire pour construire cette version. Les tests navigateur utilisent Chromium via Playwright (`npx playwright install chromium` si absent).

- `dist/unfollowtracker-1.1.0.zip` : archive à importer dans le tableau de bord développeur, manifeste à la racine, avec empreinte `.sha256`.
- `dist/site/` : aperçu statique FR/EN avec `noindex`. Ne pas publier cet aperçu comme version SEO finale. Une copie indexable est préparée dans `dist/site-production/` ; la régénérer après tout changement de contenu.
- `docs/release/assets/` : visuels du store ; `STORE-LISTING.md` : descriptions FR/EN.
- `PRIVACY-AND-PERMISSIONS.md` : finalité unique, permissions et déclaration de données.
- `docs/weespy-reference-audit.md` : analyse de la référence et décisions de design.
- `docs/seo/` : stratégie, intentions, calendrier et domaines.
- `VALIDATION.md` : résultats des tests, revue indépendante et limites de validation.
- `PUBLICATION-IDENTITY.md` : coordonnées Yadulink et sources utilisées.

L’archive est construite sur une liste de chemins autorisés. Elle exclut tests, données de test, site, dépendances, captures privées, fichiers d’environnement, fichiers Git et notes internes. Les notices tierces MIT et la licence de la police sont incluses.

## Recharger la bonne copie en développement

Brave charge exactement le dossier sélectionné lors de « Charger l’extension non empaquetée ». Un worktree Git et le dossier principal sont deux copies distinctes : recharger l’extension ne copie pas les changements d’une copie vers l’autre.

Le dossier historique de ce poste est `/Users/feedain/Documents/github/UnfollowTracker`. Le dossier de travail courant est `/Users/feedain/.superset/worktrees/UnfollowTracker/stormy-galaxy-97f75789`. Les sources 1.1.0 et les artefacts préparés ont été synchronisés vers le dossier historique après vérification des modifications concurrentes. Les builds sont régénérables depuis l’un ou l’autre.

Dans `brave://extensions`, recharger UnfollowTracker depuis le dossier réellement chargé, puis recharger l’onglet Instagram. Le manifeste passe du popup à un panneau global. Cliquer sur l’icône pour l’ouvrir. La position gauche/droite reste un réglage du navigateur : l’API ne doit pas prétendre forcer un choix utilisateur. [Documentation Side Panel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel).

## Recette manuelle sur Instagram réel — restant à effectuer

Les tests automatisés utilisent des réponses Instagram synthétiques et une extension Manifest V3 réellement chargée dans un profil de test. Ils ne remplacent pas cette recette sur les versions publiques de Chrome et Brave :

1. Sans onglet Instagram, ouvrir l’extension depuis un site quelconque. Le panneau propose « Ouvrir Instagram », ne crée aucun onglet et ne lance aucun scan spontanément.
2. Choisir d’ouvrir Instagram, se connecter sur le site, puis démarrer le scan. Changer d’onglet : le panneau reste disponible et le scan continue.
3. Fermer le panneau, le rouvrir, puis vérifier la reprise d’état. Ne pas fermer l’onglet Instagram pendant la lecture.
4. Rechercher un résultat au-delà des 50 premières lignes, afficher la suite, ouvrir un profil, exporter le JSON. Vérifier que le téléchargement correspond à la totalité du résultat.
5. Ouvrir une confirmation de désabonnement puis annuler. Toute validation réelle doit être une décision de l’utilisateur sur un compte qu’il veut effectivement ne plus suivre.
6. Vérifier FR/EN, thème clair/sombre et suppression volontaire des scans. Ne pas effacer les données d’un compte réel pour un simple test sans décision de son propriétaire.
7. En cas d’erreur Instagram, vérifier l’arrêt du chargement et la conservation du dernier résultat complet daté. Ne pas provoquer volontairement une limitation du compte.

La validation visuelle du panneau natif dans la session Brave de l’utilisateur reste à faire. Un précédent accès automatisé à une URL d’extension avait été refusé ; aucun contournement n’a été utilisé. Le test du conteneur HTML dans le navigateur isolé vérifie le contrôleur, le service worker et les réponses de scan, mais pas le placement visuel natif de Brave.

## Site et sous-domaine

Configuration dans `site/publication.json`. Domaine public : `https://unfollow.yadulink.com`, CNAME vers `unfollowtracker.pages.dev`, HTTPS actif. Les informations publiques de l’éditeur et de l’hébergeur reprennent celles de Yadulink, à la demande de l’utilisateur ; voir `PUBLICATION-IDENTITY.md`. La clé `storeUrl` contient l’URL officielle du Chrome Web Store, vérifiée publiquement installable le 7 octobre 2026 ; les CTA proposent l’installation gratuite.

Pour l’aperçu : `npm run site:dev`, puis `http://localhost:4173/fr/` ou `/en/`.

Pour le dossier indexable : `npm run build:site:production`. Cette commande génère un robots.txt ouvert, les pages avec `index,follow` et le sitemap. Elle ne déploie rien. Un éventuel retour en prépublication nécessite de remettre `storeUrl` à `null` et de vérifier les textes publics correspondants.

L’hébergeur doit servir `index.html` dans les répertoires, une vraie réponse 404, le HTTPS et les redirections. `_headers` et `_redirects` sont fournis pour les hébergeurs compatibles ; sur un autre serveur, reporter ces règles dans sa configuration. Mapper le sous-domaine à la cible DNS indiquée par l’hébergeur choisi. Ne pas modifier les enregistrements du domaine racine qui servent l’outil de prospection.

À chaque déploiement : vérifier canoniques et alternates sur l’URL finale, la politique publique, l’absence de `noindex`, le sitemap, les réponses HTTP et les liens d’installation. La propriété Search Console reste un suivi SEO distinct.

## Exploitation et prochaine étape

Le projet Cloudflare Pages `unfollowtracker` est lié au dépôt `feedain9/UnfollowTracker`, branche `main`. Chaque push lance `node scripts/build-site.js --production`, sert `dist/site` et utilise `SKIP_DEPENDENCY_INSTALL=true`. La règle de sécurité Host a reçu uniquement le nom `unfollow.yadulink.com` dans la liste des hôtes publics autorisés ; la condition `.php`, les autres hôtes et les autres protections restent identiques.

L’automatisation Superset « UnfollowTracker — article quotidien » (ID `5ef77198-81f8-4fbd-b12b-0755ef7f8f05`) exécute Codex chaque jour à 09:00 Europe/Zurich, dans un nouvel espace du projet. Elle fonctionne sur le Mac configuré, qui doit être disponible avec Superset. Voir `docs/seo/DAILY-PUBLISHING.md`. Le premier article est envoyé automatiquement dans les deux langues.

La première version est publiée. Voir `SUBMIT-NOW.md` pour le relevé de soumission et de publication, le ZIP, les textes, les images, les liens publics et les instructions de test enregistrées. Toute prochaine mise à jour du package passe par la fiche existante et un nouvel examen. La recette réelle du panneau Brave reste une validation distincte de la publication.
