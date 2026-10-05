# Validation de préparation — 5 octobre 2026

Version 1.1.0 préparée, sans soumission au store ni déploiement public.

## Vérifications effectuées

| Vérification | Résultat et portée |
| --- | --- |
| `npm test` | 79 tests réussis : pagination, réponses incohérentes, limitation, délais, stockage par compte, restauration du scan propriétaire, états du panneau, recherche, langues, confirmations, conservation du focus et chargement borné des photos. |
| `npm run lint` | Réussi, y compris les générateurs et les tests. |
| `npm run test:browser` | Réussi avec une extension MV3 chargée dans Chromium isolé ; toutes les réponses Instagram sont synthétiques. Scan et pagination, fermeture/réouverture, échec du refresh, reprise après 429, ouverture explicite, FR/EN, thème, annulation d’un désabonnement ; zéro erreur JavaScript. |
| `npm run test:avatars` | Réussi dans une extension MV3 isolée : chargement direct ou depuis l’onglet Instagram, photos expirées/absentes, hôtes non autorisés, cache mémoire après changement de langue, conservation du scan. Aucune requête réelle ni requête API. |
| `npm run test:site` | Réussi : FR/EN, liens et ancres, clavier, démonstration persistante, export fictif, FAQ, navigation mobile, largeurs responsives, données structurées, contenu sans JavaScript ; aucune requête externe. |
| Aperçu dans Brave | Landing locale ouverte et contenu visible, avec lien de contact Yadulink. |
| Builds aperçu / production | 14 pages localisées chacun. Aperçu fermé à l’indexation ; copie indexable conservée dans `dist/site-production`. La génération ne déploie rien. |
| Archive | 22 fichiers, manifeste à la racine, notices et licences présentes, intégrité ZIP vérifiée. Aucune dépendance, donnée de test, note interne ou donnée de compte réel incluse. |
| `git diff --check` | Réussi. |

Empreinte de l’archive préparée `dist/unfollowtracker-1.1.0.zip` (82 270 octets) :

```text
39ea7bf12a81c3cb026d146e5b9b5f868755c21b7efc2ab07058c190689ec342
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

La version 1.1.0 n’a pas été validée dans le panneau natif de la session Brave réelle. Le contrôle d’approbation automatique avait refusé l’accès à l’URL interne de l’extension ; aucune méthode de contournement n’a été utilisée. La recette réelle décrite dans `PUBLISHING.md` reste nécessaire avant soumission.

Les tests ne garantissent pas la disponibilité future des endpoints Instagram. Aucune action de désabonnement n’a été exécutée sur un compte réel pendant cette préparation.

L’identité publique reprend Yadulink à la demande du propriétaire. La publication a ensuite été autorisée le 5 octobre : l’hébergement retenu est Cloudflare Pages, et les politiques publiques comme les politiques intégrées à l’archive ont été mises à jour en conséquence. Le statut effectif du domaine et du store doit être vérifié au terme du déploiement.
