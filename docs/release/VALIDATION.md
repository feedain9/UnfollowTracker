# Validation de préparation — 5 octobre 2026

Version 1.1.0 préparée, soumise au Chrome Web Store le 6 octobre 2026 et publiquement installable le 7 octobre 2026. Site déployé sur Cloudflare Pages et domaine actif. Les vérifications techniques ci-dessous restent celles de la préparation du 5 octobre ; la soumission ne vaut pas validation du fonctionnement dans la session Instagram réelle.

## Vérifications effectuées

| Vérification | Résultat et portée |
| --- | --- |
| `npm test` | 79 tests réussis : pagination, réponses incohérentes, limitation, délais, stockage par compte, restauration du scan propriétaire, états du panneau, recherche, langues, confirmations, conservation du focus et chargement borné des photos. |
| `npm run lint` | Réussi, y compris les générateurs et les tests. |
| `npm run test:browser` | Réussi avec une extension MV3 chargée dans Chromium isolé ; toutes les réponses Instagram sont synthétiques. Scan et pagination, fermeture/réouverture, échec du refresh, reprise après 429, ouverture explicite, FR/EN, thème, annulation d’un désabonnement ; zéro erreur JavaScript. |
| `npm run test:avatars` | Réussi dans une extension MV3 isolée : chargement direct ou depuis l’onglet Instagram, photos expirées/absentes, hôtes non autorisés, cache mémoire après changement de langue, conservation du scan. Aucune requête réelle ni requête API. |
| `npm run test:site` | Réussi : FR/EN, liens et ancres, clavier, démonstration persistante, export fictif, FAQ, navigation mobile, largeurs responsives, données structurées, contenu sans JavaScript ; aucune requête externe. |
| Aperçu dans Brave | Landing locale ouverte et contenu visible, avec lien de contact Yadulink. |
| Builds aperçu / production | 18 pages localisées chacun, avec le blog et son premier article FR/EN. Aperçu fermé à l’indexation ; copie indexable conservée dans `dist/site-production`. La génération ne déploie rien. |
| Archive | 22 fichiers, manifeste à la racine, notices et licences présentes, intégrité ZIP vérifiée. Aucune dépendance, donnée de test, note interne ou donnée de compte réel incluse. |
| `git diff --check` | Réussi. |

Empreinte de l’archive préparée `dist/unfollowtracker-1.1.0.zip` (82 269 octets) :

```text
1613fca0a0f690723b6e717c4864f6c2c35cc33ca7c8807fc2e6e0bc61f918dd
```

La commande d’empaquetage régénère aussi le fichier `.sha256`, à consulter après toute modification future.

## Revue visuelle

Disposition indépendante : **ship**, sur le périmètre des artefacts préparés. Le rôle spécialisé n’étant pas disponible, un agent généraliste neuf a suivi le contrat de revue dégradée d’Impeccable. Un second agent a documenté le système livré dans `DESIGN.md` et `.impeccable/design.json`.

Captures desktop 1440, grand écran 2560, mobile 390, panneau FR sombre avant/après scan et panneau EN clair inspectées. Aucun correctif visuel matériel demandé. Deux passes initiales de contrôle visuel ont été effectuées. Le suivi demandé par le hook a ensuite fait l’objet d’une correction ciblée de lisibilité et d’une revue indépendante concluant **ship**, sans relancer une recherche générale de retouches.

Le détecteur a fonctionné en mode de repli par expressions régulières, ses parseurs avancés étant indisponibles. Son résultat vide ne constitue pas une mesure de contraste, de Core Web Vitals ni une certification WCAG. Aucun benchmark visuel externe ni maquette approuvée n’était attendu pour cette adaptation directe de la référence.

Le contrôle du générateur de visuels a signalé cinq couleurs et six tailles typographiques hors de l’échelle d’interface. Ces variantes sont intentionnelles dans les images marketing de dimensions fixes ; elles sont conservées par onze exceptions limitées aux valeurs concernées et à `scripts/generate-store-assets.js`. Aucun fichier ou règle entière n’est ignoré. L’erreur de lint du générateur a été corrigée ; aucun problème de design identifié n’a été laissé sans traitement.

La provenance est inscrite dans les 14 rasters livrés (icônes existantes, photos de démonstration, images sociales et store). Les comptes et chiffres des illustrations sont fictifs.

## Suivi du contrôle final

Le contrôle Stop a ensuite signalé les valeurs absentes de la documentation dans trois feuilles de style. Le [triage détaillé](DESIGN-HOOK-TRIAGE.md) distingue les correctifs de lisibilité, les rôles manquants et les exceptions propres aux illustrations. Le contrôle ciblé ne remonte plus d’alerte. Les tests site et navigateur passent à nouveau ; le test de persistance a été synchronisé sur l’accusé de démarrage et une réponse de test retenue explicitement, pour éliminer une course entre fermeture du panneau et réponses synthétiques. Les captures et l’archive ci-dessus incluent ces corrections.

## Limites de cette validation

Le [correctif des photos de profil](PROFILE-PHOTOS.md) s’appuie aussi sur un diagnostic réseau de la page Instagram réelle dans Brave : une photo échoue depuis un autre site, mais répond HTTP 200 depuis Instagram en CORS sans cookies. Le test d’intégration reproduit cette différence avec des données fictives. Cela valide le mécanisme de chargement ; cela ne remplace pas la recette du panneau natif ci-dessous.

La version 1.1.0 n’a pas été validée dans le panneau natif de la session Brave réelle. Le contrôle d’approbation automatique avait refusé l’accès à l’URL interne de l’extension ; aucune méthode de contournement n’a été utilisée. La recette réelle décrite dans `PUBLISHING.md` reste à effectuer. La soumission ultérieure du formulaire HTTPS du Web Store par CUA ne valide pas ce panneau.

Les tests ne garantissent pas la disponibilité future des endpoints Instagram. Aucune action de désabonnement n’a été exécutée sur un compte réel pendant cette préparation.

L’identité publique reprend Yadulink à la demande du propriétaire. La publication a ensuite été autorisée le 5 octobre : l’hébergement retenu est Cloudflare Pages, et les politiques publiques comme les politiques intégrées à l’archive ont été mises à jour en conséquence. Le statut effectif du domaine et du store doit être vérifié au terme du déploiement.

## Mise en ligne — 5 octobre 2026

- Cloudflare Pages relié à `feedain9/UnfollowTracker`, branche `main`, domaine `unfollow.yadulink.com` actif avec SSL. Ajout de ce seul nom à la liste des hôtes autorisés dans la règle Host ; aucun autre hôte, action ou critère modifié.
- Contrôle HTTPS public : pages FR/EN, politiques, mentions légales, blog, article FR/EN, JavaScript et police répondent 200 ; page inexistante 404. Canonical exact, `index,follow`, robots ouvert et sitemap de 16 URL.
- Quatre tests éditoriaux supplémentaires réussis : traductions, références, dates et liens sûrs, exclusion brouillons/futur, intentions dupliquées. Tests site étendus aux deux articles, BlogPosting, alternates et absence de débordement mobile ; lint et `git diff --check` réussis.
- Premier passage Superset réel : run `0fda692a-d173-4583-84ed-74f22dbf9e30`, article JSON export FR/EN, commit `db04666cdc947e62d8a7986e99bd1b52b8e79ce9`. Publication HTTPS et sitemap vérifiés. La commande de logs conserve l’état technique `dispatched` pour ce terminal interactif ; le terminal de l’agent affiche le travail achevé. Le résultat public a été vérifié séparément.
- Déclencheur actif vérifié dans `automations get` : quotidien à 09:00 Europe/Zurich sur le Mac configuré. Premier prochain lancement prévu le 6 octobre 2026. La disponibilité du poste reste nécessaire.
- Le pilotage DOM du tableau de bord avait échoué avec « The extensions gallery cannot be scripted ». Cette restriction technique a ensuite été distinguée du mode ordinateur natif, qui a permis de remplir et soumettre le formulaire HTTPS autorisé.

Capture de la page réellement publiée : `.impeccable/review/published-landing.jpg` (locale, non incluse dans le ZIP de l’extension).

## Soumission au Chrome Web Store — 6 octobre 2026

- Package 1.1.0 vérifié dans la fiche existante `ckkgnnifiojkmmfmeejeebafldholdnc` ; descriptions et captures FR/EN, icône, vignette promotionnelle, liens, permissions, déclarations de données et instructions de test enregistrés.
- Distribution gratuite, publique, toutes les régions. Publication automatique après examen et approbation activée.
- Google a confirmé « Votre extension a été envoyée pour examen » ; état affiché : **En attente d’examen**. Aucune approbation ni disponibilité publique n’est revendiquée.
- Capture locale de cette confirmation : `.impeccable/review/store-submitted.jpg`. À ce stade de la soumission, le lien `storeUrl` restait nul jusqu’à une fiche publique effectivement installable.

## Disponibilité publique — 7 octobre 2026

La fiche publique `https://chromewebstore.google.com/detail/unfollowtracker/ckkgnnifiojkmmfmeejeebafldholdnc` a été consultée sans session Google. Elle affiche « Add to Chrome », la version 1.1.0, une mise à jour au 7 octobre 2026, l’éditeur Yadulink et les langues anglais/français. Cette observation confirme la disponibilité à l’installation. `storeUrl` est désormais configuré dans le site.

Vérifications de l’activation du site : lint et quatre tests éditoriaux réussis ; test navigateur FR/EN réussi, y compris les liens internes, les interactions et les largeurs 320–2560 px. Génération de production réussie : quatre liens d’installation par langue vers la fiche officielle, données structurées de téléchargement gratuit, absence de la note de prépublication, guides datés du 7 octobre et sitemap cohérent.
