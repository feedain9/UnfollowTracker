# Analyse de la référence Weespy et adaptation

Inspection du 5 octobre 2026, sur https://www.weespy.now/, dans Brave. Observation du DOM, des styles calculés, des interactions et des captures desktop (2560 × 1325) et mobile (390 × 844). L’audit porte sur la landing publique, pas sur le produit connecté. Aucun formulaire envoyé. Les chiffres de performance réels, le taux de conversion et les Core Web Vitals ne sont pas disponibles : aucun score n’est inventé.

## La mécanique générale

Weespy vend un outil de veille sur les canaux de distribution de concurrents SaaS. Ce n’est pas un outil Instagram de comparaison des abonnés. La référence est pertinente pour sa présentation : une promesse brève, une preuve visuelle, des bénéfices montrés plutôt qu’une longue liste technique, des objections traitées puis un appel à l’action. Les fonctionnalités, témoignages, chiffres et illustrations ne sont pas transférables à UnfollowTracker.

Le visiteur suit une progression précise : comprendre le bénéfice, voir l’outil travailler, reconnaître une situation familière, comprendre comment agir, puis lever les doutes. Le rythme alterne un centre de gravité très calme — gros titre centré dans le noir — et des démonstrations plus denses. La couleur chaude conduit l’œil vers l’action sans rendre tout le site criard.

## Lecture détaillée de la page

| Zone observée | Traitement de Weespy | Effet recherché | Adaptation livrée |
|---|---|---|---|
| Navigation | Marque à gauche, quatre liens au centre, CTA encadré à droite | Séparer découverte et conversion ; navigation peu envahissante | Même équilibre, liens extension / fonctionnement / données / FAQ, choix FR/EN |
| Fond du premier écran | Noir, relief lumineux rouge-orangé en haut, extinction progressive vers le contenu | Donner une identité sans concurrencer le titre | Lumière chaude très discrète et courbe géométrique de marque, aucun asset Weespy repris |
| Titre | Deux lignes, Manrope, promesse immédiatement lisible | Résumer le résultat avant le fonctionnement | « Vous les suivez. Et en retour ? » suivi d’une phrase explicitant Instagram |
| Texte de soutien | Petit bloc centré, gris, largeur contrôlée | Compléter sans transformer le hero en documentation | Scan, liste claire, panneau persistant ; limite desktop visible |
| Première action | Formulaire e-mail et inscription à une liste d’attente | Capturer un intérêt avant disponibilité | Aucun e-mail collecté ; état prépublication honnête, futur lien officiel configurable |
| Démonstration principale | Visualisation de canaux et concurrents, boutons et changements animés | Faire expérimenter le mécanisme de veille | Onglets interactifs : Instagram, notes, nouvel onglet ; le panneau garde la même position |
| Bénéfices | Quatre grandes surfaces verticales, texte à gauche et démonstration à droite | Donner une preuve spécifique à chaque promesse | Trois surfaces : comparaison des listes, navigation persistante, recherche/export/action individuelle |
| Démo de veille | Logos de plateformes, balayage, listes de signaux et métriques | Montrer le produit en action sans installer | Démonstration locale, replay du scan et vrai export JSON d’exemple ; données fictives identifiées |
| Section problème | Promesse de gain de temps, réseau dense d’éléments | Donner une raison pratique de passer à l’action | Trois étapes concrètes de prise en main, sans temps d’exécution garanti |
| Intégration / MCP | Mise en scène d’un assistant et de connecteurs | Montrer la continuité entre découverte et action | Remplacée par le contrôle des données et les choix utilisateur, qui existent dans notre produit |
| FAQ | Titre à gauche, accordéons contrastés à droite | Lever les objections au moment de décider | Gratuité, historique, session, scan interrompu, limites Instagram, navigateurs, désabonnement manuel |
| CTA final | Grande surface chaude avec rappel de promesse et formulaire | Réouvrir une occasion de conversion après les objections | Fermeture de marque, gratuité, section d’installation explicite |
| Pied de page | Marque + colonnes produit / informations / juridique | Offrir les sorties utiles et des signaux de sérieux | Guides, confidentialité, mentions légales, indépendance vis-à-vis de Meta |

## Typographie et proportions

Les styles calculés observés utilisent Manrope. À la largeur inspectée, le H1 mesure 54 px, graisse 600, hauteur de ligne 57,24 px et approche −2,43 px. Les H2 mesurés sont à 44 px, hauteur 47,52 px, graisse 600 ; le corps courant est à 16 / 24 px. La différence entre grands titres et petites annotations est volontairement forte. Le texte principal est un blanc chaud, proche de `#fff8f4`, sur un noir proche de `#010103`.

L’adaptation garde la famille et la chaleur de la palette, mais utilise une police variable auto-hébergée, un titre fluide jusqu’à 72 px, une approche limitée à −0,04 em et une colonne centrale de 1120 px. L’extension reprend cette famille, avec des nombres tabulaires et des textes secondaires plus lisibles que dans la première version du popup. Son thème clair reste disponible.

La page Weespy mesurait environ 9134 px de haut à la largeur de bureau inspectée. Les quatre bénéfices occupaient ensemble environ 4208 px ; les autres séquences observées faisaient approximativement 1072, 837, 714 et 504 px. Ces valeurs décrivent une instance de rendu, pas des dimensions fixes à copier. UnfollowTracker a moins de fonctions : sa page est volontairement plus courte tout en conservant les grandes séparations entre séquences.

## Démonstrations et mouvement

La référence comporte deux canvas et trois vidéos. Certains lecteurs vidéo affichaient une impossibilité de lecture pendant l’inspection ; une capture pleine page ne permet pas de distinguer un chargement différé d’un défaut permanent. On ne peut donc pas affirmer que ces vidéos sont cassées pour tous les visiteurs. Le risque observable est une démonstration dont le sens disparaît si le média ne se charge pas.

La démonstration livrée utilise du HTML lisible dès le chargement. Le visiteur peut changer d’onglet au clic ou au clavier ; le panneau conserve sa géométrie et ses résultats. Le replay de scan est déclenché volontairement, dure environ deux secondes et ne contacte jamais Instagram. Le mode de réduction des animations supprime cette attente. L’export produit un vrai fichier JSON dont le contenu indique explicitement qu’il s’agit d’un exemple.

Les transitions de contrôles sont courtes. Aucun défilement forcé, parallaxe obligatoire, lecture automatique de vidéo ou section cachée jusqu’à une animation. Les trois photographies de démonstration sont auto-hébergées et leur provenance est enregistrée. Aucun contenu du compte Instagram de l’utilisateur n’entre dans les visuels marketing.

## Conversion et crédibilité

La gratuité est confirmée par le brief. Le site peut donc la répéter dans le hero, les étapes, la FAQ et la conclusion. En revanche, ni un nombre d’utilisateurs, ni des étoiles, ni une validation du Chrome Web Store ne sont connus. Ils n’apparaissent pas.

Le principal risque éditorial de cette catégorie est la confusion entre « comptes qui ne me suivent pas » et « personnes qui se sont désabonnées ». La première observation vient de deux listes actuelles ; la seconde demanderait un historique. L’extension ne conserve actuellement que le dernier scan complet. Le site l’explique dans une note de bénéfice, la FAQ et un guide dédié. Il n’annonce ni suivi historique, ni scan instantané garanti, ni absence de risque de restriction par Instagram.

La démonstration donne une preuve plus adaptée qu’une rangée de logos clients fictifs. Les autres éléments de confiance sont vérifiables dans le code : aucun compte UnfollowTracker, aucune publicité intégrée, absence d’analytics, stockage local par compte, export, suppression, désabonnement individuel confirmé. « Local » n’est pas présenté comme « hors ligne » : les requêtes du vrai scan vont à Instagram et les avatars à ses serveurs d’images.

Avant publication, le bouton principal conduit à l’état d’installation à venir. La configuration du vrai lien Chrome Web Store active ensuite les boutons d’installation, y compris dans la navigation et le CTA final. Aucun faux lien de boutique, formulaire inactif ou inscription e-mail sans traitement réel n’est livré.

## Mobile et accessibilité

Dans la référence, la navigation devient un bouton de menu. L’action finale empile le champ et le bouton ; les colonnes du footer se réorganisent. La capture mobile a notamment vérifié ces parties de page. Il ne s’agit pas d’une validation complète sur un appareil physique.

L’adaptation empile les bénéfices et simplifie la fenêtre de démonstration sur petit écran. Elle distingue clairement la visite du site sur téléphone de l’installation de l’extension sur ordinateur. Les vrais contrôles utilisent boutons, liens, `details/summary`, rôles de tabs et indicateurs d’état ; les faux contrôles purement illustratifs sont du texte. Le menu annonce son ouverture, se ferme avec Échap et rend le focus. Les onglets de démonstration répondent aux flèches, Home et End. Les guides et la FAQ restent lisibles sans JavaScript.

Les points vérifiés automatiquement sont l’absence de débordement à 320, 390, 768, 1280 et 1440 px, les liens et ancres internes, les deux langues, les téléchargements, les interactions clavier et l’absence de requêtes externes. Les captures incluent aussi le bureau 2560 px utilisé pour la référence. Ce contrôle n’est pas présenté comme une certification WCAG ou une mesure CrUX.

## Structure technique et SEO

La référence dispose de titres, description et une langue anglaise explicite. L’audit visuel seul ne permet pas de conclure sur son indexation, ses positions ou ses conversions. L’adaptation ne dépend pas d’un rendu client : chaque langue possède des pages HTML statiques, avec titre, description, canonique et liens `hreflang` réciproques.

Trois guides par langue traitent des intentions distinctes, avec un lien vers le produit et entre contenus pertinents. Les données structurées décrivent une application ; aucun faux avis n’est utilisé. Les guides utilisent `Article`. Les FAQ ne promettent pas un enrichissement Google qui n’est pas acquis pour ce type de site.

La prévisualisation est explicitement `noindex` et son robots.txt refuse l’exploration. La génération de production vérifie les informations publiques de l’éditeur et de l’hébergeur avant de produire le sitemap indexable. Le domaine proposé est `unfollow.yadulink.com` ; ni DNS, ni hébergement, ni publication n’ont été modifiés.

## Décisions finales

| Avant | Après | Pourquoi |
|---|---|---|
| Popup perdu au changement d’onglet | Panneau global, lié à Instagram dans la même fenêtre | La lecture et la navigation peuvent se poursuivre ensemble |
| Message de scan sans contexte sur les données | Explication du stockage avant le premier scan, date du résultat ensuite | Comprendre l’action et l’ancienneté des données |
| Police chargée depuis Google Fonts | Manrope livré avec l’extension et le site | Supprimer un appel tiers et stabiliser le rendu |
| Liste limitée aux 50 premiers résultats | Recherche sur toute la liste et bouton d’affichage supplémentaire | Accéder à tous les résultats sans export obligatoire |
| Action de désabonnement directe | Confirmation individuelle, annulation possible | Éviter les actions involontaires sur Instagram |
| Promesse historique imprécise | Comparaison des listes actuelles explicitement décrite | Aligner le marketing et la réalité du produit |

Les fichiers de travail, captures et contrats de direction ne font pas partie du site ni de l’archive de l’extension. La revue de finition et la documentation de design consignent le contrôle final, indépendamment de cette analyse de référence.
