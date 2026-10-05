# Photos de profil — correctif du 5 octobre 2026

## Diagnostic

Le panneau conservait les initiales lorsque le chargement direct d’une photo échouait. Les URL étaient bien présentes dans la réponse de la liste Instagram : les 12 entrées observées comportaient `profile_pic_url`.

Dans Brave, une même URL a été testée depuis une page locale et depuis l’onglet Instagram, sans ouvrir l’URL interne de l’extension :

- Hors d’Instagram, le chargement d’image ordinaire a échoué avec `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` (`corp-not-same-origin`).
- Ajouter uniquement `crossOrigin="anonymous"` a également échoué (`MissingAllowOriginHeader`).
- Depuis l’onglet Instagram, une requête CORS avec `credentials: 'omit'` a reçu HTTP 200, `image/jpeg`, 2 240 octets.

L’essai initial avec une réponse CDN synthétique permissive passait déjà avant correction. Il ne reproduisait pas le problème et n’a pas été utilisé comme preuve de résolution. Le scénario de régression distingue désormais la requête extérieure refusée de celle autorisée depuis Instagram. Il échouait avant le correctif.

Aucune URL de photo réelle, aucun cookie et aucune liste réelle n’ont été enregistrés dans le dépôt ou les captures de test.

## Correction

Le panneau essaie d’abord l’image directe. En cas d’échec, il demande à son onglet Instagram connecté de télécharger l’image dans le contexte CORS normal de cette page. Le contenu est renvoyé au panneau comme une image locale en mémoire.

- Uniquement les hôtes HTTPS `cdninstagram.com` et `fbcdn.net`, avec leurs sous-domaines ; refus des identifiants dans l’URL, des ports non standards et des redirections.
- Aucun cookie ou en-tête d’authentification API envoyé au serveur d’images ; aucune permission ajoutée au manifeste.
- Trois téléchargements simultanés au maximum, délai de 10 secondes, limite de 256 Kio par photo, formats JPEG/PNG/WebP/AVIF/GIF.
- Cache mémoire de 64 réponses, succès comme échecs ; aucune boucle de retry, aucune requête supplémentaire aux listes d’abonnements ou aux endpoints de profil.
- Refus d’un résultat si le compte a changé ; les initiales restent visibles pour une photo absente, expirée ou indisponible.
- Le protocole panneau/contenu passe à 3 afin qu’un ancien onglet propose son rechargement au lieu de déclarer une compatibilité incomplète.

## Validation

`npm test` : 79 tests réussis. `npm run lint`, `npm run test:browser` et `npm run test:avatars` réussis. Les tests de photos couvrent le refus hors contexte Instagram, le chargement direct, les erreurs, la taille maximale, le délai, la concurrence, le cache, le changement de compte et la conservation du scan enregistré.

Capture avec comptes fictifs : `.impeccable/review/profile-photos-fixture.png`. Le panneau natif de la session Brave réelle reste à vérifier manuellement ; son accès avait été refusé par le contrôle d’approbation automatique.

## Appliquer dans Brave

La copie chargée depuis `/Users/feedain/Documents/github/UnfollowTracker` est synchronisée avec le correctif. Dans `brave://extensions`, recharger UnfollowTracker, puis actualiser l’onglet Instagram et rouvrir le panneau. Les résultats enregistrés sont conservés. Une photo dont l’URL a expiré nécessite un nouveau scan pour obtenir une URL récente.
