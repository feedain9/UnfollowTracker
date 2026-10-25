# Mesure d’audience et statistiques d’usage

Mis en place le 25 octobre 2026, sur décision du propriétaire du 24 octobre : mesurer le trafic du site, les installations, l’usage et les désinstallations, **sans jamais identifier un compte Instagram**. Outil unique : l’instance Plausible Community Edition auto-hébergée `analytics.krilup.com` (Hetzner, Allemagne), déjà utilisée par yadulink.com et agency.yadulink.com.

## Où regarder

| Question | Source |
|---|---|
| Trafic du site, provenance, pages lues, pays, clics vers le store | Plausible [`unfollow.yadulink.com`](https://analytics.krilup.com/unfollow.yadulink.com) |
| Installations, usage, échecs de scan, désinstallations et leurs raisons | Plausible [`extension.unfollow.yadulink.com`](https://analytics.krilup.com/extension.unfollow.yadulink.com) (domaine virtuel, aucune page n’y est servie) |
| Totaux officiels : installations, désinstallations, utilisateurs hebdomadaires ; vues de la fiche par paramètre UTM | Tableau de bord développeur Chrome Web Store → Analytics (*Installs & Uninstalls*, *Impressions*, *Weekly Users*) |
| Requêtes Google, impressions, positions, indexation | Search Console : propriété **domaine** `yadulink.com` du compte Google de l’éditeur, qui couvre le sous-domaine. Filtrer *Performances* sur « Page contient `unfollow.yadulink.com` ». Sitemap `https://unfollow.yadulink.com/sitemap.xml` envoyé le 25 octobre 2026 |

Le Chrome Web Store reste la référence pour les **totaux** : il compte tout le monde, y compris les utilisateurs qui ont désactivé les statistiques ou bloquent Plausible. Plausible sert à **comprendre** : pays, navigateurs, langues, profils de comptes, erreurs, raisons de départ, pages qui convertissent.

## Site web

- Pages vues, temps de lecture et défilement, sauf sur `/welcome/` et `/uninstalled/`, ouvertes par l’extension.
- Événement `Install Click` avec la propriété `placement` : `header`, `hero`, `closing`, `installation`, `article`, `uninstalled`.
- L’adresse est réduite à l’origine et au chemin, plus `utm_source`, `utm_medium` et `utm_campaign`. Le referrer est réduit à son origine. Aucune autre propriété n’est acceptée.
- Chaque lien vers le store porte `utm_source=unfollow.yadulink.com&utm_medium=website&utm_campaign=<langue>-<page>` (par exemple `fr-home` ou `en-blog-export-instagram-results-json`). L’onglet *Impressions* du store ventile ainsi les visites de la fiche par page du site. D’après la [documentation Chrome](https://developer.chrome.com/blog/cws-analytics-revamp), cette ventilation porte sur les vues de la fiche, pas sur les installations.
- Plausible n’est chargé que par le build `--production`, et n’envoie rien hors du domaine `unfollow.yadulink.com` : les aperçus, les déploiements de branche et les tests locaux ne mesurent rien.

## Extension

Envoyés par `src/scripts/telemetry.js` (service worker) ; `Uninstall` et `Uninstall Reason` sont envoyés par la page de désinstallation du site.

| Événement | Déclencheur | Propriétés spécifiques |
|---|---|---|
| `Install` | Installation depuis le store | — |
| `Update` | Mise à jour de version | `from` |
| `Active` | Ouverture du panneau, au plus une fois par jour UTC | `age`, `scans`, `accounts` |
| `Scan Start` | Début d’un scan | `first` |
| `Scan Complete` | Scan complet enregistré | `first`, `followers`, `following`, `non_reciprocal`, `duration`, `accounts` |
| `Scan Error` | Échec, ou onglet Instagram fermé ou rechargé pendant le scan | `error` |
| `Export` | Export JSON | `count` |
| `Unfollow` | Désabonnement confirmé par Instagram | — |
| `Clear Data` | Suppression des scans enregistrés | — |
| `Uninstall` | Page de désinstallation ouverte | `version`, `browser`, `age`, `scans`, `last` |
| `Uninstall Reason` | Raison choisie dans le sondage | `reason` (+ les propriétés de `Uninstall` si disponibles) |

Propriétés communes aux événements de l’extension : `version`, `browser` (`chrome`, `brave`, `edge`, `opera`, `chromium`, `other`) et `ui_lang`, la langue de l’interface du navigateur (`fr`, `en-US`, `pt-BR`…). Plausible déduit pays, région, ville et système d’exploitation à la réception, sans conserver l’adresse IP.

Valeurs possibles, toujours par tranches :

- `followers`, `following` : `0-99`, `100-299`, `300-999`, `1000-2999`, `3000-9999`, `10000-49999`, `50000+`.
- `non_reciprocal`, `count` : `0`, `1-9`, `10-49`, `50-199`, `200-999`, `1000+`.
- `scans` (scans terminés sur l’installation) : `0`, `1`, `2-5`, `6-20`, `21+`. `accounts` (comptes enregistrés) : `0`, `1`, `2`, `3+`.
- `age` (depuis l’installation) : `0d`, `1-6d`, `7-29d`, `30-89d`, `90d+`, `unknown` (installé avant la 1.2.0).
- `duration` : `0-1min`, `1-5min`, `5-15min`, `15min+`. `first` : `yes`, `no`. `last` : `none`, `complete`, `error`.
- `error` : `rate_limited`, `verification`, `hidden_list`, `incomplete`, `timeout`, `account_changed`, `tab_closed`, `invalid_response`, `http_error`, `network`, `other`.
- `reason` : `scan_failed`, `instagram_limit`, `too_slow`, `wanted_history`, `done`, `privacy`, `other`.

## Ce qui n’est jamais collecté

Identifiant ou pseudonyme Instagram, listes, noms, photos, cookies ou jetons, adresses des pages visitées, valeurs exactes, messages d’erreur bruts, texte libre. Aucun identifiant d’installation ou de navigateur n’est créé. Toute évolution vers des données identifiantes exige une nouvelle décision du propriétaire, un consentement explicite et une mise à jour des déclarations du store.

## Garde-fous techniques

- Seule une installation depuis le store (manifeste avec `update_url`) tient des compteurs, ouvre les pages et envoie des événements. Une extension non empaquetée ou testée n’envoie rien.
- Interrupteur « Partager des statistiques d’usage anonymes » dans le panneau (clé locale `shareUsageStats`, activée par défaut). Désactivé : plus aucun événement, et l’adresse de désinstallation devient `/uninstalled/?o=1`.
- L’envoi ne bloque jamais la file d’enregistrement des scans : requête non attendue, délai maximal de 10 s, erreurs seulement journalisées.
- **Ne pas ajouter de `host_permissions`** pour Plausible : l’API répond `Access-Control-Allow-Origin: *`. Une nouvelle permission désactiverait l’extension chez les utilisateurs existants jusqu’à leur nouvelle approbation.
- Pour un nouvel événement ou une nouvelle propriété : liste blanche de `telemetry.js` ou de `site.js`, tests, ce document, politique de confidentialité (`scripts/build-site.js`), objectifs et propriétés dans Plausible.

## Lire les données

- **Installations par pays** : site extension → objectif `Install` → Locations.
- **Activation** : `Scan Complete` avec `first = yes`, rapporté à `Install` sur la même période.
- **Fiabilité** : `Scan Error` par `error`, comparé à `Scan Complete`.
- **Profil des comptes** : `Scan Complete` → `followers`, `following`, `non_reciprocal`, `accounts`.
- **Départs** : `Uninstall` par `age` et `last` ; raisons avec `Uninstall Reason` → `reason`.
- **Conversion du site** : `Install Click` par page et `placement`, puis vues de la fiche par `utm_campaign` dans le store.
- **Prochaines langues** : `Install` et `Active` par `ui_lang` ; utile pour prioriser le SEO international.

## Limites connues

- Plausible compte les visiteurs uniques par jour (identifiant anonyme renouvelé chaque jour). Sur une période, « visiteurs » se rapproche d’une somme de visiteurs quotidiens : utiliser *Weekly Users* du store pour le nombre d’utilisateurs.
- Les utilisateurs de la 1.1.0 n’émettent pas `Install` ; ils apparaissent avec `Update` lors de la mise à jour automatique, avec `age = unknown`.
- La page de désinstallation s’ouvre lors d’une désinstallation depuis le navigateur ; un départ sans cette page n’est visible que dans le store.
- Les bloqueurs de publicité peuvent masquer une partie du trafic du site. Le pays dépend de l’adresse IP (VPN).
- Pour exclure vos propres visites dans un navigateur, exécuter une fois dans la console de unfollow.yadulink.com : `localStorage.plausible_ignore = "true"`.

## Ordre de mise en production

1. Déployer le site (fusion dans `main`) : politique de confidentialité, pages de bienvenue et de désinstallation et mesure du site doivent être en ligne avant la diffusion de la 1.2.0.
2. Soumettre `dist/unfollowtracker-1.2.0.zip`, en mettant à jour les descriptions ([STORE-LISTING.md](../release/STORE-LISTING.md)) et les pratiques de confidentialité ([PRIVACY-AND-PERMISSIONS.md](../release/PRIVACY-AND-PERMISSIONS.md)). Fait le 25 octobre 2026 : version en attente d’examen, publication automatique après approbation.
3. Après publication : vérifier l’arrivée des premiers `Update`, `Active` et `Install`.
