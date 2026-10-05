# Dossier de publication — UnfollowTracker 1.1.0

L’extension et le site sont préparés. Aucun achat, changement DNS, hébergement public ni envoi au Chrome Web Store n’a été effectué.

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

## Recette manuelle avant soumission

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

Configuration dans `site/publication.json`. Cible préparée : `https://unfollow.yadulink.com` ; aucun sous-domaine n’a été créé. Les informations publiques de l’éditeur et de l’hébergeur reprennent celles de Yadulink, à la demande de l’utilisateur ; voir `PUBLICATION-IDENTITY.md`. La clé `storeUrl` reste nulle jusqu’à l’existence d’une fiche officielle ; les CTA restent honnêtement en prépublication.

Pour l’aperçu : `npm run site:dev`, puis `http://localhost:4173/fr/` ou `/en/`.

Pour le dossier indexable : `npm run build:site:production`. Cette commande génère un robots.txt ouvert, les pages avec `index,follow` et le sitemap. Elle ne déploie rien. Le mode prépublication du store peut rester actif si l’on décide d’ouvrir d’abord le site.

L’hébergeur doit servir `index.html` dans les répertoires, une vraie réponse 404, le HTTPS et les redirections. `_headers` et `_redirects` sont fournis pour les hébergeurs compatibles ; sur un autre serveur, reporter ces règles dans sa configuration. Mapper le sous-domaine à la cible DNS indiquée par l’hébergeur choisi. Ne pas modifier les enregistrements du domaine racine qui servent l’outil de prospection.

Après la mise en ligne autorisée : vérifier canoniques et alternates sur l’URL finale, la politique publique, l’absence de `noindex`, le sitemap et les réponses HTTP ; ajouter la propriété Search Console. Après acceptation du store : renseigner `storeUrl`, régénérer puis déployer le site, et vérifier le bouton d’installation.

## Décisions encore nécessaires

- Configuration Azure effective (dont journaux et proxy éventuel) et validation du sous-domaine proposé.
- Dernière recette du panneau natif sur Chrome/Brave.
- Compte développeur et paramètres de distribution du Chrome Web Store.
- Relecture et autorisation de soumettre/publier. La préparation seule ne garantit pas l’acceptation du store ni la stabilité future des endpoints Instagram.
