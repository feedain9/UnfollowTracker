# Déclarations de données et permissions

État : déclarations du code 1.1.0 enregistrées dans la console puis soumises le 6 octobre 2026. La fiche officielle est publiquement installable depuis le 7 octobre 2026. Ce document décrit les déclarations du développeur ; l’approbation du store ne garantit pas la disponibilité des réponses Instagram.

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

Les URL d’avatar ne sont chargées que si elles utilisent HTTPS et un domaine d’images Instagram/Meta autorisé par le contrôleur. Aucun autre serveur ne reçoit les listes. L’export est un fichier local demandé par l’utilisateur et reste présent même après suppression du cache.

## Déclaration dans la console

Catégories cochées lors de la soumission : **informations personnelles identifiantes**, **informations d’authentification**, **historique Web**, **contenu du site Web**. La catégorie historique Web décrit ici uniquement l’URL de l’onglet Instagram utilisée pour le retrouver, sans enregistrement d’un historique général. Les catégories santé, finances, communications personnelles, localisation et activité de l’utilisateur sont décochées ; aucun suivi des clics, frappes ou mouvements n’est effectué. Code distant : **Non**. Les trois attestations de non-vente, d’usage limité à la finalité et d’absence d’usage pour le crédit sont cochées.

Ne pas déclarer « aucune donnée traitée » sous prétexte que le traitement est local. Examiner les catégories proposées avec les éléments ci-dessus : informations identifiantes (noms, pseudos, identifiants), informations d’authentification utilisées dans la session, contenu du site (listes sociales), activité de navigation limitée au repérage de l’onglet Instagram. Aucune donnée financière, de santé, de localisation, de message privé ou de navigation sur d’autres sites n’est utilisée.

La [FAQ officielle de Chrome sur les données utilisateur](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) demande d’expliquer le traitement même lorsqu’il reste local et de fournir une politique de confidentialité. Les textes livrés décrivent finalités, stockage, destinataires, durée et suppression, avec la déclaration « Limited Use ». La notice avant le premier scan rend le traitement visible dans le produit.

Les engagements à reporter, s’ils correspondent toujours à la version soumise : pas de vente de données ; pas d’utilisation hors de la finalité décrite ; pas de traitement à des fins de solvabilité ; pas de publicité ciblée ; pas d’accès humain par l’éditeur aux listes. Toute future intégration d’analytics, service distant ou synchronisation nécessitera de revoir ces textes et déclarations.

## Coordonnées des politiques publiques

Les coordonnées publiques reprennent Yadulink à la demande de l’utilisateur : AVICLICK (Yadulink), SAS, SIREN 979 514 627 ; 40 rue Alexandre Dumas, 75011 Paris, France ; support@yadulink.com. L’hébergement choisi pour cette landing page est Cloudflare Pages, conformément à l’autorisation de publication du 5 octobre 2026. Voir [les sources de publication](PUBLICATION-IDENTITY.md). La génération de production vérifie la présence des informations requises. Le site est livré sans formulaire, cookie analytique ni appel tiers.
