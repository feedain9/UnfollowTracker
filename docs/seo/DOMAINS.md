# Domaine : recommandation et vérifications

Le propriétaire a confirmé **yadulink.com**. Proposition de travail : **unfollow.yadulink.com**, avec la marque **UnfollowTracker**. C’est court, mémorisable, indépendant des futurs chemins et compatible avec un hébergement séparé. L’orthographe plus longue `instagramfollower.yadulink.com` n’apporte pas, à elle seule, de bénéfice SEO démontré et décrit moins précisément une comparaison de réciprocité.

## Vérification technique du 5 octobre 2026

Interrogation en lecture seule du RDAP officiel de Verisign pour quatre `.com`, sans achat ni connexion registrar :

| Domaine | Réponse RDAP | Conclusion limitée |
|---|---|---|
| [unfollowtracker.com](https://rdap.verisign.com/com/v1/domain/unfollowtracker.com) | HTTP 200 | Un enregistrement existe ; pas libre à l’enregistrement standard d’après ce registre |
| [followbackchecker.com](https://rdap.verisign.com/com/v1/domain/followbackchecker.com) | HTTP 200 | Un enregistrement existe |
| [nonfollowerschecker.com](https://rdap.verisign.com/com/v1/domain/nonfollowerschecker.com) | HTTP 404 | Aucun enregistrement trouvé à cet instant ; candidat à vérifier chez un registrar |
| [freeunfollowers.com](https://rdap.verisign.com/com/v1/domain/freeunfollowers.com) | HTTP 404 | Aucun enregistrement trouvé à cet instant ; candidat à vérifier chez un registrar |

Un 404 RDAP n’est pas une garantie d’achat : réservation, prix premium ou évolution de disponibilité restent possibles. Les prix initiaux, renouvellements, taxes et conditions n’ont pas été vérifiés. Il faut obtenir un devis registrar au moment de décider ; aucun budget ni achat n’a été engagé.

`nonfollowerschecker.com` décrit mieux le mécanisme actuel mais reste long. `freeunfollowers.com` est plus compact, avec l’ambiguïté historique du mot « unfollowers ». Aucun des deux n’est nécessaire au lancement. Si un domaine séparé est choisi, le site doit avoir un seul hôte canonique ; rediriger les autres plutôt que publier plusieurs copies.

Google indique que son système de domaine exact évite d’accorder trop de crédit aux domaines correspondant mot pour mot à une requête. La recommandation de rester sur le domaine possédé privilégie donc simplicité et cohérence ; elle ne prédit aucun classement. [Source Google](https://developers.google.com/search/docs/appearance/ranking-systems-guide).

Les DNS de yadulink.com n’ont pas été modifiés. La valeur `siteUrl` du projet reste configurable jusqu’au choix final d’hébergement et de domaine.
