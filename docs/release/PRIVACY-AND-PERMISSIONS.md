# Déclarations de données et permissions

**Version 1.2.0 (envoyée pour examen le 25 octobre 2026)** : ajoute des statistiques d’usage anonymes, une page de bienvenue et un sondage de désinstallation. Aucune permission n’est ajoutée. Les déclarations de la console ont été mises à jour avec cet envoi (Localisation et Activité de l’utilisateur cochées en plus), selon la section « Déclaration dans la console » ci-dessous et [SUBMIT-1.2.0.md](SUBMIT-1.2.0.md).

État 1.1.0 : déclarations du code 1.1.0 enregistrées dans la console puis soumises le 6 octobre 2026. La fiche officielle est publiquement installable depuis le 7 octobre 2026. Ce document décrit les déclarations du développeur ; l’approbation du store ne garantit pas la disponibilité des réponses Instagram.

## Finalité unique

Comparer les abonnés et abonnements du compte Instagram connecté pour identifier, consulter, exporter et gérer individuellement les abonnements non réciproques dans un panneau latéral.

## Justifications prêtes à utiliser

| Permission | Justification |
|---|---|
| `sidePanel` | Afficher les résultats et l’état du scan dans un panneau accessible au changement d’onglet. |
| `storage` | Conserver le dernier scan complet par compte, les préférences de langue/thème et l’état temporaire du scan ; permettre export et suppression. |
| `scripting` | Initialiser le script local dans un onglet Instagram déjà ouvert avant l’installation de l’extension. Aucun code distant n’est injecté. |
| `https://www.instagram.com/*` | Lire les listes du compte connecté et transmettre les désabonnements individuels confirmés à Instagram, dans l’onglet et avec la session existante. |

Pas de permission `tabs`, `cookies`, `webRequest`, `downloads`, `history`, `unlimitedStorage` ni d’accès à tous les sites. Les API de tabs utilisées pour créer/focaliser un onglet n’exigent pas la permission générale `tabs` ; les informations d’URL utilisées sont limitées au domaine autorisé. Le code et la police sont livrés localement.

## Données réellement traitées

| Données | Utilité et destination | Conservation |
|---|---|---|
| Identifiant du compte connecté | Associer et isoler le scan ; lu depuis la session Instagram | Avec le dernier résultat local |
| Identifiants, noms, pseudonymes, listes abonnés/abonnements, URL d’avatar | Comparaison, affichage, export et action individuelle | Dernier résultat complet dans `chrome.storage.local`, par compte |
| Session Instagram, cookie anti-CSRF et claim utilisé par Instagram | Authentifier les requêtes vers Instagram | Pas de copie enregistrée par l’extension ; la session reste gérée par Instagram |
| Date du scan et état courant | Afficher fraîcheur, progression et erreurs | Dernière date localement ; état transitoire dans `storage.session` |
| Langue et thème | Personnaliser le panneau | Localement jusqu’à désinstallation/changement |
| URL d’un onglet Instagram dans la fenêtre | Retrouver l’onglet qui peut exécuter le scan | Pas d’historique de navigation enregistré |
| Événements d’usage (1.2.0) : installation, mise à jour, ouverture du panneau, début, fin ou échec d’un scan, export, désabonnement, suppression, avec version, navigateur, langue de l’interface, catégorie d’erreur et tranches de valeurs | Mesurer l’usage et la fiabilité ; envoyés à l’instance Plausible de l’éditeur (Hetzner, Allemagne), désactivables dans le panneau, jamais envoyés par une extension non publiée | Agrégés et anonymes dans Plausible |
| Adresse IP, inhérente à chaque requête de statistiques | Déduire le pays et un identifiant anonyme quotidien à la réception | Non conservée par Plausible |
| Compteurs d’usage locaux : date d’installation, nombre de scans et de comptes enregistrés, issue du dernier scan, dernier jour actif, choix sur les statistiques | Calculer les tranches et l’adresse du sondage de désinstallation | Localement jusqu’à la désinstallation |

Les URL d’avatar ne sont chargées que si elles utilisent HTTPS et un domaine d’images Instagram/Meta autorisé par le contrôleur. Aucun autre serveur ne reçoit les listes. Les statistiques ne contiennent ni identifiant ni pseudonyme Instagram, ni liste, nom, photo, cookie, jeton ou URL visitée ; voir [la mesure d’audience](../analytics/MEASUREMENT.md). L’export est un fichier local demandé par l’utilisateur et reste présent même après suppression du cache.

## Déclaration dans la console

**À partir de la 1.2.0**, cocher en plus **localisation** (pays déduit de l’adresse IP par le serveur de statistiques) et **activité de l’utilisateur** (ouverture du panneau, scans, export, désabonnement, sans suivi des frappes, mouvements ni défilement). Les catégories existantes restent cochées ; code distant : toujours **Non** ; les trois attestations restent valables, l’usage des statistiques étant limité à l’amélioration de la finalité unique.

Version 1.1.0 — catégories cochées lors de la soumission : **informations personnelles identifiantes**, **informations d’authentification**, **historique Web**, **contenu du site Web**. La catégorie historique Web décrit ici uniquement l’URL de l’onglet Instagram utilisée pour le retrouver, sans enregistrement d’un historique général. Les catégories santé, finances, communications personnelles, localisation et activité de l’utilisateur sont décochées ; aucun suivi des clics, frappes ou mouvements n’est effectué. Code distant : **Non**. Les trois attestations de non-vente, d’usage limité à la finalité et d’absence d’usage pour le crédit sont cochées.

Ne pas déclarer « aucune donnée traitée » sous prétexte que le traitement est local. Examiner les catégories proposées avec les éléments ci-dessus : informations identifiantes (noms, pseudos, identifiants), informations d’authentification utilisées dans la session, contenu du site (listes sociales), activité de navigation limitée au repérage de l’onglet Instagram. Aucune donnée financière, de santé, de localisation, de message privé ou de navigation sur d’autres sites n’est utilisée.

La [FAQ officielle de Chrome sur les données utilisateur](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) demande d’expliquer le traitement même lorsqu’il reste local et de fournir une politique de confidentialité. Les textes livrés décrivent finalités, stockage, destinataires, durée et suppression, avec la déclaration « Limited Use ». La notice avant le premier scan rend le traitement visible dans le produit.

Les engagements à reporter, s’ils correspondent toujours à la version soumise : pas de vente de données ; pas d’utilisation hors de la finalité décrite ; pas de traitement à des fins de solvabilité ; pas de publicité ciblée ; pas d’accès humain par l’éditeur aux listes. Les statistiques d’usage anonymes de la 1.2.0 sont décrites dans la politique publique. Toute autre donnée envoyée, service distant ou synchronisation nécessitera de revoir ces textes et déclarations.

## Coordonnées des politiques publiques

Les coordonnées publiques reprennent Yadulink à la demande de l’utilisateur : AVICLICK (Yadulink), SAS, SIREN 979 514 627 ; 40 rue Alexandre Dumas, 75011 Paris, France ; support@yadulink.com. L’hébergement choisi pour cette landing page est Cloudflare Pages, conformément à l’autorisation de publication du 5 octobre 2026. Voir [les sources de publication](PUBLICATION-IDENTITY.md). La génération de production vérifie la présence des informations requises. Le site est livré sans formulaire ni cookie ; depuis le 25 octobre 2026 il mesure son audience avec l’instance Plausible de l’éditeur, en production uniquement.
