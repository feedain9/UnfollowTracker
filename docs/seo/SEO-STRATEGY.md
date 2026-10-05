# Stratégie SEO — UnfollowTracker

Plan du 5 octobre 2026. Cible proposée : `unfollow.yadulink.com`. Deux langues confirmées : français et anglais. Produit gratuit, actuellement non publié. Aucune donnée Search Console, aucun volume de recherche payant, aucune mesure d’autorité de domaine ou conversion n’est disponible. Les priorités ci-dessous sont qualitatives et fondées sur l’intention, le produit réel et un échantillon de résultats de recherche consultés ce jour.

## Positionnement

Un outil gratuit qui compare les abonnés et abonnements Instagram dans un panneau persistant, utilise la session déjà ouverte et conserve le dernier résultat complet localement. La différence à défendre est l’usage : on comprend la liste, on peut continuer à naviguer, et on garde la maîtrise des actions. La gratuité ne se limite pas à un quota d’essai commercial ; les restrictions imposées par Instagram restent possibles.

L’expression « unfollowers » peut amener du trafic, mais ne doit pas changer la promesse. La version 1.1.0 ne détecte pas l’historique des désabonnements. Le site cible cette ambiguïté avec une réponse utile et un guide distinct, pas une affirmation trompeuse dans le titre principal.

## Carte des intentions

| Priorité | Intention et requêtes françaises | Équivalent anglais | Page et angle |
|---|---|---|---|
| P0 | qui ne me suit pas en retour Instagram ; extension Instagram abonnements non réciproques | who doesn’t follow me back on Instagram ; Instagram non followers checker | Landing : proposition, démonstration, gratuité, installation |
| P0 | comment voir qui ne me suit pas sur Instagram | how to check who doesn’t follow you back on Instagram | Guide non-followers : méthode, exemple, limites et première utilisation |
| P1 | qui s’est désabonné Instagram ; différence unfollower non follower | who unfollowed me vs who doesn’t follow back | Guide de distinction : expliquer honnêtement ce que le produit sait et ne sait pas faire |
| P1 | scan Instagram bloqué ; erreur abonnés Instagram extension | Instagram unfollower scan stuck ; Instagram scan rate limited | Dépannage : symptômes, session, backoff, dernière liste complète |
| P1 | UnfollowTracker ; UnfollowTracker gratuit ; installer UnfollowTracker | UnfollowTracker free extension | Accueil + fiche du store + guide d’installation |
| P2 | extension unfollow Instagram sans mot de passe | Instagram unfollower extension without password | Section données + politique : utilise la session, ne signifie pas « sans accès aux listes » |
| À différer | export Instagram JSON abonnés ; comparer deux exports | compare Instagram follower exports | Autre méthode ; futur contenu uniquement si démonstration testée et utile. Ne pas faire croire que l’import est intégré. |

Ne pas viser les recherches d’achat d’abonnés, d’accès aux profils privés ou de désabonnement automatique en masse : elles ne correspondent pas au produit. Éviter plusieurs pages quasi identiques pour « unfollower gratuit », « non followers gratuit » et « checker gratuit » ; une page principale suffit tant qu’il n’existe pas une intention distincte à servir.

## Bases déjà implémentées

- HTML statique complet par langue ; pas de dépendance JavaScript pour le contenu éditorial.
- Titres et descriptions propres, une H1 par page, canonique absolue et alternates `fr`, `en`, `x-default` réciproques.
- Trois guides complets dans chaque langue, aide de démarrage, confidentialité et mentions légales.
- Liens contextuels entre guides et vers le produit ; pages accessibles via le footer.
- Schémas `SoftwareApplication` et `Article`, sans faux avis ni notes. L’offre gratuite et le lien de téléchargement ne sont ajoutés qu’avec une URL de boutique réelle.
- Images sociales FR/EN, police auto-hébergée, trois photographies locales, pas de script analytics ni de vidéo tiers.
- Build d’aperçu `noindex` + robots fermé. Build de production avec sitemap, avec l’identité publique Yadulink renseignée.

## Mesures et objectif des 90 premiers jours

| Indicateur | Référence actuelle | Objectif de travail, pas une prévision |
|---|---|---|
| Indexabilité | Non publié | Zéro erreur de canonique, hreflang ou statut HTTP sur les pages publiques |
| Couverture | Non mesurée | Toutes les pages éditoriales utiles découvertes ; enquêter sur les exclusions, sans exiger l’indexation de pages légales |
| Impressions hors marque | Non mesurées | Identifier les premières requêtes qui correspondent au produit et les comparer sur fenêtres de 28 jours |
| Clics organiques | Non mesurés | Améliorer les pages déjà vues selon leur intention réelle ; pas de volume garanti |
| Installations | Non publiées | Suivre les statistiques agrégées du Chrome Web Store après mise en ligne |
| Conversion site → store | Non instrumentée | D’abord vérifier le parcours ; décider explicitement d’une mesure respectueuse des données avant d’ajouter un outil |
| Expérience | Tests locaux, pas de données terrain | Viser de bons CWV sur mobile/desktop, puis vérifier avec Search Console/CrUX quand les données existent |

Ne pas inventer un taux de conversion ou attribuer les installations à une campagne sans dispositif qui permet cette attribution. Le site livré ne collecte pas d’événement : l’absence d’analytics est un choix réel, pas un paramètre caché.

## Acquisition et autorité

Une fiche Chrome Web Store précise, les pages d’aide et une page produit liée depuis un emplacement pertinent de yadulink.com offrent des entrées cohérentes. Préparer ensuite une annonce de lancement documentée, une courte démonstration du panneau et une présentation transparente de la confidentialité. Les références à des projets open source doivent conserver leur attribution et ne pas laisser entendre un partenariat.

Une présence communautaire peut servir à répondre à de vraies questions de comparaison de listes, avec la mention du lien avec le produit. Aucun envoi, publication de message, achat de lien ou campagne d’outreach n’a été réalisé. Éviter les annuaires en masse, liens artificiels et pages de mots-clés clonées.

## Domaine et exact match

Recommandation de préparation : rester sur `unfollow.yadulink.com`, court et cohérent avec le domaine existant, puis garder **UnfollowTracker** comme nom visible. Le sous-domaine facilite l’hébergement séparé. Il ne garantit pas un transfert d’autorité SEO du domaine principal.

Google décrit un système qui évite d’accorder trop de crédit aux noms de domaine correspondant exactement à une requête. Un EMD n’est donc pas, à lui seul, une stratégie de classement. Prioriser qualité, utilité, disponibilité du produit et cohérence des liens. [Guide officiel des systèmes de classement](https://developers.google.com/search/docs/appearance/ranking-systems-guide).

Les vérifications RDAP et leurs limites figurent dans [DOMAINS.md](DOMAINS.md). Aucun achat n’est nécessaire pour continuer le travail préparé.
