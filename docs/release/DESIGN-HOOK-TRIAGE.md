# Triage du contrôle final de design

Le hook a signalé 226 occurrences dans trois feuilles de style après la création de la documentation. Chaque groupe de valeurs a été vérifié dans son contexte. Le contrôle ciblé après correction retourne zéro alerte, avec les exceptions documentées ci-dessous. Ce résultat ne remplace pas une mesure de contraste ou un audit WCAG.

## Correctifs

- 44 déclarations de texte du site relevées : assurances, disponibilité, navigation, aide, FAQ, liens, légendes et commandes de démonstration. Les assurances peuvent revenir à la ligne sur mobile au lieu de devenir minuscules.
- Bouton de désabonnement : 11px, y compris au breakpoint étroit qui utilisait 9px.
- Couleur de sélection unifiée entre site et panneau.
- Espaces insécables avant les points d’interrogation de la FAQ française, afin que la ponctuation ne reste pas seule après l’augmentation du texte.
- Documentation complétée : 21 rôles de couleur effectivement utilisés, 10 rôles typographiques et 2 rayons fonctionnels. Aucune couleur de profil fictif n’est promue comme accent global.

## Exceptions conservées

68 couples règle/valeur spécifiques au fichier `site/assets/site.css` : 48 couleurs de démonstration ou de décor, 3 rayons de miniature et 17 tailles réservées aux illustrations ou aux variantes responsives de titres. Ils ont été enregistrés via `hook-admin.mjs ignore-value`, avec leur raison. Les 11 exceptions antérieures du générateur d’images marketing restent séparées. Aucune règle entière ni aucun fichier entier n’est ignoré.

| Règle | Valeur | Sélecteurs concernés |
| --- | --- | --- |
| design-system-color | `#ff9a8129` | `.hero-light::after` |
| design-system-color | `#943c3624` | `.hero-light::after` |
| design-system-color | `#65443f` | `.browser-demo` |
| design-system-color | `#b9776d` | `.traffic-lights i:first-child` |
| design-system-radius | `7px` | `.demo-tabs button`, `.demo-scan` |
| design-system-color | `#cd8984` | `.ig-mini`, `.ig-mini::after` |
| design-system-color | `#ac6d71` | `.profile-avatar` |
| design-system-color | `#313b34` | `.profile-avatar > span` |
| design-system-color | `#d8e3ce` | `.profile-avatar > span` |
| design-system-font-size | `9px` | `.profile-counts`, `.demo-status`, `.avatar`, `.mini-notes p`, `.ig-word`, `.compare-labels`, `.export-art .avatar`, `.browser-address`, `.demo-panel .demo-user small`, `.demo-panel .avatar`, `.notes-workspace > p`, `.new-workspace p`, `.compare-demo > p`, `.export-art .demo-user small` |
| design-system-color | `#e3dce4` | `.profile-under span` |
| design-system-color | `#373137` | `.demo-panel` |
| design-system-color | `#928790` | `.demo-panel-header > svg` |
| design-system-color | `#85bea0` | `.demo-status > span` |
| design-system-font-size | `24px` | `.demo-stats b`, `.new-workspace h3` |
| design-system-font-size | `8px` | `.demo-stats span`, `.demo-timestamp`, `.profile-mini`, `.demo-user small`, `.demo-unfollow`, `.demo-rest`, `.mini-panel small`, `.mini-label`, `.profile-counts`, `.export-art .demo-user small`, `.profile-head p`, `.export-art .mini-label` |
| design-system-color | `#281b1b` | `.demo-stats > div:last-child` |
| design-system-color | `#633c34` | `.demo-stats > div:last-child` |
| design-system-color | `#383139` | `.demo-export` |
| design-system-radius | `5px` | `.demo-export`, `.demo-unfollow` |
| design-system-color | `#ecc7ae` | `.avatar-0` |
| design-system-color | `#32413b` | `.avatar-1` |
| design-system-color | `#c9dccb` | `.avatar-1` |
| design-system-color | `#3c3547` | `.avatar-2` |
| design-system-color | `#d7c5ef` | `.avatar-2` |
| design-system-color | `#39473d` | `.profile-mini` |
| design-system-color | `#b2c2a5` | `.profile-mini` |
| design-system-color | `#3c333b` | `.demo-unfollow` |
| design-system-color | `#dbd1d9` | `.demo-unfollow` |
| design-system-color | `#eee7db` | `.notes-workspace` |
| design-system-color | `#383330` | `.notes-workspace` |
| design-system-color | `#6f645e` | `.notes-date` |
| design-system-color | `#70635f` | `.notes-workspace > p` |
| design-system-color | `#c8bbaf` | `.notes-workspace li` |
| design-system-color | `#81736a` | `.notes-workspace svg` |
| design-system-font-size | `27px` | `.new-workspace h3`, `.mini-panel > b`, `.feature h3` |
| design-system-color | `#ceb5c4` | `.new-tab-orbit` |
| design-system-color | `#c2a6aa` | `.compare-labels` |
| design-system-color | `#acc4ad` | `.compare-row svg` |
| design-system-color | `#ce827a` | `.missing-dash` |
| design-system-color | `#d6aaa2` | `.compare-demo > p` |
| design-system-radius | `10px` | `.mini-window` |
| design-system-color | `#81717d` | `.mini-window-bar span` |
| design-system-color | `#e7ded2` | `.mini-notes` |
| design-system-color | `#413634` | `.mini-notes` |
| design-system-color | `#c5b5a9` | `.mini-notes p` |
| design-system-color | `#4b333b` | `.mini-panel` |
| design-system-color | `#c4aeb8` | `.mini-panel small` |
| design-system-color | `#b48882` | `.tiny-row::before` |
| design-system-color | `#edb2a2` | `.persistent-note` |
| design-system-color | `#efb49f` | `.mini-label` |
| design-system-color | `#aa96a5` | `.artifact-caption` |
| design-system-font-size | `37px` | `.faq-section > h2` |
| design-system-font-size | `52px` | `.closing h2` |
| design-system-color | `#d187702c` | `.closing-ring` |
| design-system-color | `#6d2f222b` | `.closing-ring` |
| design-system-color | `#d1877033` | `.closing-ring::after` |
| design-system-font-size | `50px` | `.article h1` |
| design-system-font-size | `29px` | `.feature h3`, `.faq-section > h2`, `.guides-heading h2` |
| design-system-font-size | `59px` | `.hero h1` |
| design-system-font-size | `7px` | `.mini-panel small`, `.export-art .mini-label`, `.notes-date` |
| design-system-font-size | `35px` | `.privacy-inner h2` |
| design-system-font-size | `28px` | `.guides-heading h2` |
| design-system-font-size | `44px` | `.hero h1` |
| design-system-font-size | `33px` | `h2`, `.privacy-inner h2`, `.faq-section > h2` |
| design-system-font-size | `34px` | `.article h1` |
| design-system-font-size | `23px` | `.article h2` |
| design-system-font-size | `39px` | `.hero h1` |

## Vérification

Le lint et les tests navigateur/site passent sur les artefacts corrigés. Les captures et l’archive sont régénérées ; les contrôles portent sur la lisibilité, les retours à la ligne et les parcours déjà validés. Aucun problème identifié n’est volontairement laissé ouvert dans ce lot. Le test du panneau natif Brave et la publication restent hors du périmètre de ce contrôle de styles.

Revue indépendante du correctif : **ship** après vérification de la FAQ mobile et de ses espaces insécables. Aucun correctif matériel restant sur ce périmètre.
