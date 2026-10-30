# Requêtes cibles

Relevé du 25 octobre 2026 : suggestions de recherche Google (`suggestqueries.google.com`, `hl=fr&gl=fr` et `hl=en&gl=us`) et requêtes déjà vues dans Search Console. Les suggestions prouvent qu’une formulation est tapée, pas son volume : aucune donnée de volume payante n’est utilisée. Les priorités combinent l’intention, l’adéquation au produit et la concurrence observée. Mettre à jour la colonne « État » à chaque publication, et revoir les priorités chaque mois avec Search Console (*Performances* filtré sur `unfollow.yadulink.com`).

Règles :

- Un groupe d’intention = une page. Les variantes (« gratuit », « sans application », « 2026 », « reddit ») enrichissent la page du groupe ; elles ne justifient pas un nouvel article.
- Le titre et la H1 reprennent la formulation réelle de la requête dans chaque langue. Le slug reste commun aux deux langues.
- Ne jamais promettre ce que le produit ne fait pas : pas d’historique automatique des désabonnements, pas d’import d’archive, pas de désabonnement en masse, pas de version mobile.

## Groupes d’intention

| Prio. | Groupe | Requêtes FR | Requêtes EN | Page cible | État |
|---|---|---|---|---|---|
| P0 | Qui ne me suit pas en retour | qui ne me suit pas en retour instagram ; voir / savoir qui ne me suit pas en retour ; comment savoir qui ne nous suit pas sur instagram ; application / site pour voir qui ne nous suit pas | who doesn’t follow me back instagram (free, app, website, online, checker) ; how to see who doesn’t follow you back on instagram (free, without app, compare lists) ; instagram non followers (checker, extension) ; instagram follow back checker | `guides/non-followers/` | Réécrit le 25/10/2026 |
| P0 | Qui s’est désabonné | qui s’est désabonné instagram ; voir qui ne me suit plus sur instagram ; comment savoir qui s’est désabonné (gratuit) ; application pour savoir qui ne me suit plus | how to see who unfollowed you on instagram (without an app, compare lists, on computer) ; instagram unfollowers (tracker, app, free, check) | `guides/unfollowers-vs-non-followers/` | Réécrit le 25/10/2026 |
| P1 | Exporter et comparer ses listes | exporter / télécharger liste abonnés instagram (gratuit) ; comparer abonnés instagram ; comparer liste abonnés | export instagram followers list (free, to excel) ; instagram followers json compare (online) ; compare two lists instagram followers json ; does instagram data download include followers | Nouvel article : comparer deux listes dans un tableur, pas à pas | Publié le 26/10/2026 |
| P1 | Délai de l’export Instagram | — | how long does it take for instagram to download data ; can you download your instagram data | Nouvel article : délais officiels (lien jusqu’à 30 jours, 4 jours pour télécharger) | Publié le 30/10/2026 |
| P1 | Sécurité des applis « unfollow » | application unfollow instagram gratuit ; unfollow instagram sans mot de passe | safe unfollow app for instagram (reddit) ; safest unfollow app for instagram ; who doesn’t follow me back instagram reddit | Nouvel article : liste de contrôle avant d’installer une appli ou une extension | À faire |
| P1 | Extensions de navigateur | extension instagram abonnés ; extension abonnés instagram chrome | instagram followers chrome extension ; instagram unfollowers chrome extension ; instagram non followers extension | Page d’accueil + guide principal ; article seulement pour une question distincte | Couvert par la page d’accueil |
| P1 | Limites et désabonnements | limite d’abonnement instagram (par jour, par heure) ; pourquoi je ne peux pas me désabonner sur instagram | instagram unfollow limit (per day, per hour) ; why can’t i unfollow on instagram ; can i unfollow on instagram without them knowing | Nouvel article, uniquement avec une source officielle sur les restrictions ; aucun chiffre inventé | À faire |
| P1 | Limite de 7 500 abonnements | limite abonnement instagram ; maximum abonnement instagram | instagram following limit | `blog/instagram-7500-following-limit/` | Publié le 25/10/2026 |
| P2 | Supprimer un abonné | supprimer un abonné / follower instagram | remove follower instagram (notification, meaning, web) | `blog/instagram-unfollow-vs-remove-follower/` | Publié le 22/10/2026 |
| P2 | Abonnés fantômes | abonnés fantômes instagram ; abonné fantôme c’est quoi | instagram ghost followers (check, meaning) | Nouvel article explicatif : ce que le scan voit et ne voit pas (pas de mesure d’activité) | À faire |
| P2 | Demandes de suivi en attente | instagram demande de suivi en attente | instagram follow request pending (how long, list) | `blog/instagram-pending-follow-requests/` | Publié le 24/10/2026 |
| P2 | Compteurs incohérents | — | instagram follower count wrong / incorrect ; why is my instagram follower count wrong | `blog/instagram-counts-vs-non-reciprocal-accounts/` ; article distinct seulement si la cause diffère | Partiel |
| P2 | Ordre des listes | voir abonnements instagram dans l’ordre (chronologique) | instagram following list order (meaning) | Nouvel article, uniquement avec une source officielle sur le tri des listes | À faire |

## À ne pas viser

Achat d’abonnés, consultation de profils privés, robots de désabonnement en masse, applications APK, « services » de suppression d’abonnés fantômes, données de comptes tiers. Ces intentions contredisent le produit ou ses règles.

## Requêtes hors sujet vues dans Search Console

« instagram insights to json », « export instagram insights to json », « export instagram public data to json » mènent à l’article sur l’export JSON des résultats, qui ne traite pas des statistiques Instagram. Ne pas réécrire cet article pour ces requêtes.
