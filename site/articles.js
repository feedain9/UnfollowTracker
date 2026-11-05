const copy = require("./content");
const paragraphs = (sections) =>
  sections.map(([title, text]) => `<h2>${title}</h2>${text}`).join("");
// The landing cards reuse guideTitles/guideDescriptions; `title` and
// `description` override them for the page's own <title> and meta description.
const article = (lang, index, slug, { lead, title, description, updatedAt }, sections) => ({
  route: `guides/${slug}/`,
  title: title || copy[lang].guideTitles[index],
  description: description || copy[lang].guideDescriptions[index],
  updatedAt,
  body: `<h1>${copy[lang].guideTitles[index]}</h1><p class="article-lead">${lead}</p>${paragraphs(sections)}`,
});
module.exports = {
  fr: [
    article(
      "fr",
      0,
      "non-followers",
      {
        title: "Qui ne me suit pas en retour sur Instagram ? 3 méthodes",
        description:
          "Voyez qui ne vous suit pas en retour sur Instagram : vérifier un profil, comparer l’export officiel de vos données ou scanner vos deux listes gratuitement.",
        updatedAt: "2026-10-25",
        lead: "Instagram affiche vos followers et vos abonnements, mais ses pages d’aide ne décrivent aucune liste des comptes qui ne vous suivent pas en retour. Pour l’obtenir, il faut comparer ces deux listes : à la main pour quelques comptes, avec l’export officiel de vos données, ou en un scan avec une extension gratuite comme UnfollowTracker.",
      },
      [
        [
          "Ne pas suivre en retour : ce que cela veut dire",
          `<p>Un compte ne vous suit pas en retour lorsque vous le suivez et qu’il ne figure pas parmi vos followers (vos abonnés). C’est fréquent avec des créateurs, des marques ou des amis peu actifs, et ce n’est pas, à lui seul, un signe d’activité suspecte.</p><p>Exemple : vous suivez Alex, Camille et Lou. Camille et Lou vous suivent ; Alex non. Alex ne vous suit donc pas en retour. Cette information décrit le présent : elle ne dit pas si Alex vous a déjà suivi.</p><p>Soustraire vos deux compteurs ne donne pas ce nombre, car certaines personnes vous suivent sans que vous les suiviez. <a href="/fr/blog/instagram-counts-vs-non-reciprocal-accounts/">Pourquoi les compteurs ne suffisent pas</a>.</p>`,
        ],
        [
          "Méthode 1 : vérifier un compte précis",
          `<p>Pour un ou deux comptes, la vérification manuelle suffit, dans l’application comme sur instagram.com.</p><ol><li>Ouvrez votre profil Instagram.</li><li>Ouvrez la liste de vos followers.</li><li>Saisissez le nom d’utilisateur du compte dans le champ de recherche de la liste.</li><li>S’il n’apparaît pas alors que vous le suivez, ce compte ne vous suit pas en retour.</li></ol><p>Vérifiez que vous êtes connecté au bon compte si vous en gérez plusieurs. Au-delà de quelques dizaines de comptes, cette méthode devient longue et les oublis sont faciles.</p>`,
        ],
        [
          "Méthode 2 : comparer l’export officiel de vos données",
          `<p>Sans rien installer, vous pouvez demander à Instagram une copie de vos informations, puis comparer vos followers et vos abonnements. Sur ordinateur, <a href="https://help.instagram.com/181231772500920">l’aide d’Instagram</a> décrit ce parcours :</p><ol><li>Sur instagram.com, cliquez sur « Plus » en bas à gauche, puis sur « Paramètres ».</li><li>Cliquez sur « Compte Meta » (ou « Espace Comptes », selon votre compte), puis sur « Vos informations et autorisations ».</li><li>Cliquez sur « Exporter vos informations », puis sur « Créer une exportation ».</li><li>Choisissez votre profil, cliquez sur « Suivant », puis sur « Exporter sur mon appareil ».</li><li>Choisissez les informations, la période et le format, puis cliquez sur « Commencer l’exportation ».</li></ol><p>Parmi les types d’informations, la catégorie « Contacts » regroupe, selon l’aide d’Instagram, les personnes avec lesquelles vous êtes en relation ; vos followers et vos abonnements en font partie. Quand l’exportation est prête, vous avez quatre jours pour la télécharger. L’aide précise que l’e-mail contenant le lien peut mettre jusqu’à 30 jours à arriver.</p><p>Ouvrez ensuite le fichier de vos followers et celui de vos abonnements, en HTML ou en JSON selon le format choisi. Placez les noms d’utilisateur dans deux colonnes d’un tableur : chaque nom présent dans vos abonnements et absent de vos followers correspond à un compte qui ne vous suit pas en retour. Gardez ces fichiers sur votre appareil plutôt que de les confier à un site inconnu. <a href="/fr/blog/instagram-official-export-vs-local-scan/">Export officiel ou scan local : lequel choisir ?</a></p>`,
        ],
        [
          "Méthode 3 : scanner vos deux listes avec UnfollowTracker",
          `<p>UnfollowTracker est une extension gratuite pour Chrome et les navigateurs compatibles comme Brave, sur ordinateur. Elle lit vos followers et vos abonnements dans votre session Instagram, puis affiche les comptes qui ne vous suivent pas en retour, sans export ni tableur.</p><ol><li>Installez l’extension depuis le Chrome Web Store, puis ouvrez instagram.com dans le même navigateur, connecté à votre compte.</li><li>Cliquez sur l’icône UnfollowTracker pour ouvrir le panneau latéral.</li><li>Lancez « Scanner mon compte » et gardez l’onglet Instagram ouvert pendant la lecture.</li><li>Parcourez la liste, recherchez un nom, ouvrez un profil ou exportez le résultat en JSON.</li></ol><p>L’extension ne demande ni mot de passe ni compte UnfollowTracker. Le dernier scan complet reste enregistré sur votre appareil, avec sa date, pour chaque compte Instagram. La durée dépend de la taille de vos listes et des réponses d’Instagram, qui peut limiter temporairement les requêtes : <a href="/fr/guides/scan-troubleshooting/">que faire si le scan s’arrête</a>. Le <a href="/fr/getting-started/">guide d’utilisation</a> détaille chaque étape.</p>`,
        ],
        [
          "Quelle méthode choisir ?",
          `<table><thead><tr><th>Méthode</th><th>Idéale pour</th><th>Ce qu’il faut</th><th>Délai</th></tr></thead><tbody><tr><td>Vérification manuelle</td><td>Un ou quelques comptes</td><td>L’application ou le site Instagram</td><td>Immédiat</td></tr><tr><td>Export officiel</td><td>Ne rien installer</td><td>Un tableur et un peu de patience</td><td>Jusqu’à 30 jours pour recevoir le lien, puis 4 jours pour télécharger</td></tr><tr><td>UnfollowTracker</td><td>La liste complète, en un scan</td><td>Chrome ou Brave sur ordinateur</td><td>Le temps du scan</td></tr></tbody></table><p>Les trois méthodes décrivent une situation à un instant donné. Avant d’agir, regardez la date de votre relevé : vos relations ont pu changer depuis.</p>`,
        ],
        [
          "Avant de vous désabonner",
          `<p>Un compte qui ne vous suit pas en retour n’est pas forcément un compte à quitter. Quelques situations fréquentes :</p><ul><li>Les marques, médias et créateurs suivent rarement leurs abonnés en retour.</li><li>Votre demande pour suivre un compte privé est peut-être encore en attente : <a href="/fr/blog/instagram-pending-follow-requests/">demandes de suivi en attente</a>.</li><li>Vous avez peut-être retiré cette personne de vos followers vous-même : <a href="/fr/blog/instagram-unfollow-vs-remove-follower/">se désabonner ou supprimer un follower</a>.</li><li>Masquer un compte ne change rien à la réciprocité : <a href="/fr/blog/instagram-mute-non-reciprocal-results/">comptes masqués et résultats</a>.</li></ul><p>Si vous arrêtez de suivre quelqu’un, la personne n’est pas prévenue : <a href="https://help.instagram.com/286340048138725/?cms_platform=iphone-app">l’aide d’Instagram</a> indique que les personnes ne sont pas informées lorsque vous arrêtez de les suivre. Avec UnfollowTracker, chaque désabonnement se fait compte par compte, après confirmation. Prenez le temps de vérifier chaque profil : rien ne presse.</p>`,
        ],
        [
          "Protéger votre compte",
          `<p>Ne donnez jamais votre mot de passe Instagram à une application ou à un site qui promet d’analyser vos abonnés. UnfollowTracker n’en demande pas : il utilise la session déjà ouverte sur instagram.com, et vos listes ne sont envoyées à aucun serveur UnfollowTracker. <a href="/fr/blog/instagram-session-without-password/">Pourquoi aucun mot de passe n’est nécessaire</a>.</p><p>Avant d’installer une extension, regardez les autorisations qu’elle demande et la politique de confidentialité de son éditeur. <a href="/fr/blog/check-unfollowtracker-extension-permissions/">Vérifier les autorisations d’UnfollowTracker</a>.</p>`,
        ],
        [
          "Questions fréquentes",
          `<h3>Peut-on voir qui ne nous suit pas en retour sans application ?</h3><p>Oui : vérifiez un compte à la main, ou comparez l’export officiel de vos données dans un tableur. Une extension fait gagner du temps lorsque vos listes sont longues.</p><h3>La personne sait-elle que je ne la suis plus ?</h3><p>Instagram ne lui envoie pas de notification. Elle peut toutefois s’en apercevoir en consultant ses propres listes.</p><h3>Est-ce que ça marche sur iPhone ou Android ?</h3><p>UnfollowTracker est une extension pour navigateur d’ordinateur. Sur téléphone, utilisez la vérification manuelle ou l’export officiel.</p><h3>UnfollowTracker est-il vraiment gratuit ?</h3><p>Oui. Le scan, la recherche, l’export et le panneau sont gratuits, sans abonnement ni compte à créer.</p><h3>Et pour savoir qui s’est désabonné ?</h3><p>C’est une autre question, qui demande deux relevés à des dates différentes : <a href="/fr/guides/unfollowers-vs-non-followers/">qui s’est désabonné de moi sur Instagram ?</a></p>`,
        ],
      ],
    ),
    article(
      "fr",
      1,
      "unfollowers-vs-non-followers",
      {
        title: "Qui s’est désabonné de moi sur Instagram ? Comment le savoir",
        description:
          "Instagram ne prévient pas quand quelqu’un se désabonne. Comparez deux relevés de vos followers pour le repérer, et sachez ce qu’une liste actuelle ne dit pas.",
        updatedAt: "2026-10-25",
        lead: "Instagram ne vous prévient pas quand quelqu’un arrête de vous suivre : son aide indique que les personnes ne sont pas informées d’un désabonnement. Pour savoir qui s’est désabonné, il faut comparer vos followers à deux moments différents. Une liste actuelle, elle, montre seulement qui ne vous suit pas en retour aujourd’hui.",
      },
      [
        [
          "« Ne me suit pas » ou « ne me suit plus » : deux questions",
          `<p>« Ne me suit pas en retour » décrit le présent : vous suivez un compte, et il ne figure pas parmi vos followers. On le vérifie en comparant vos deux listes actuelles.</p><p>« Ne me suit plus » suppose un avant et un après : le compte figurait parmi vos followers, puis il a disparu. Sans relevé antérieur, aucune liste actuelle ne permet de l’affirmer.</p><table><thead><tr><th>Compte</th><th>Vous le suivez</th><th>Vous suit aujourd’hui</th><th>Conclusion</th></tr></thead><tbody><tr><td>Alex</td><td>Oui</td><td>Non</td><td>Ne vous suit pas en retour</td></tr><tr><td>Camille</td><td>Oui</td><td>Oui</td><td>Réciproque</td></tr><tr><td>Lou</td><td>Non</td><td>Oui</td><td>Vous ne suivez pas Lou en retour</td></tr></tbody></table><p>Sans ancien relevé, impossible de savoir si Alex vous a déjà suivi. La différence entre les compteurs ne le dit pas non plus : deux listes de même taille peuvent contenir des comptes différents.</p>`,
        ],
        [
          "Méthode 1 : comparer deux exports officiels",
          `<p>La méthode la plus complète consiste à garder une copie de vos followers, puis à la comparer à une copie plus récente.</p><ol><li>Demandez l’export de vos informations Instagram, en incluant la catégorie « Contacts », qui concerne vos relations. Le parcours est détaillé dans notre <a href="/fr/guides/non-followers/">guide sur les comptes qui ne vous suivent pas en retour</a>.</li><li>Conservez le fichier de vos followers, avec sa date.</li><li>Quelques semaines plus tard, demandez un nouvel export.</li><li>Comparez les deux fichiers : un nom présent dans le premier et absent du second a quitté vos followers entre les deux dates.</li></ol><p>Selon <a href="https://help.instagram.com/181231772500920">l’aide d’Instagram</a>, une exportation prête reste téléchargeable quatre jours, et l’e-mail contenant le lien peut mettre jusqu’à 30 jours à arriver. Prévoyez donc vos relevés à l’avance.</p>`,
        ],
        [
          "Méthode 2 : vérifier une personne précise",
          `<p>Pour une personne en particulier, cherchez son nom d’utilisateur dans la liste de vos followers. Si elle n’y figure pas, elle ne vous suit pas aujourd’hui. Pour savoir si elle vous suivait auparavant, il faut un relevé plus ancien, comme un export ou une ancienne copie de votre liste.</p>`,
        ],
        [
          "Méthode 3 : garder vos exports UnfollowTracker",
          `<p>UnfollowTracker affiche les comptes que vous suivez et qui ne vous suivent pas en retour au moment du scan. Il ne conserve que le dernier scan complet de chaque compte et ne construit pas d’historique.</p><p>Vous pouvez néanmoins garder une trace : le bouton « Exporter » enregistre la liste du moment dans un fichier JSON daté. En comparant deux exports réalisés à des dates différentes, vous voyez quels comptes que vous suiviez déjà sont devenus non réciproques entre-temps. Cette comparaison ne concerne que les comptes que vous suivez ; elle ne dit rien des followers que vous ne suivez pas. <a href="/fr/blog/export-instagram-results-json/">Lire le fichier JSON exporté</a>.</p>`,
        ],
        [
          "Pourquoi un compte disparaît de vos followers",
          `<p>Une disparition n’est pas toujours un désabonnement volontaire. Un compte peut aussi avoir été supprimé, désactivé ou bloqué, ou vous l’avez peut-être retiré vous-même de vos followers : <a href="/fr/blog/instagram-unfollow-vs-remove-follower/">se désabonner ou supprimer un follower</a>. Vérifiez le profil avant d’en tirer une conclusion sur une personne.</p>`,
        ],
        [
          "Méfiez-vous des alertes de désabonnement « en temps réel »",
          `<p>Pour signaler chaque désabonnement, un service doit relire régulièrement vos listes et les conserver. Avant de lui confier votre compte, vérifiez ce qu’il stocke, où, et s’il demande votre mot de passe. Ne donnez jamais votre mot de passe Instagram à un tiers : UnfollowTracker n’en a pas besoin et garde ses résultats sur votre appareil. <a href="/fr/blog/instagram-session-without-password/">Pourquoi aucun mot de passe n’est nécessaire</a>.</p>`,
        ],
        [
          "Questions fréquentes",
          `<h3>Instagram prévient-il quand quelqu’un se désabonne ?</h3><p>Non. <a href="https://help.instagram.com/286340048138725/?cms_platform=iphone-app">L’aide d’Instagram</a> indique que les personnes ne sont pas informées lorsque quelqu’un arrête de les suivre.</p><h3>Peut-on savoir qui s’est désabonné sans application ?</h3><p>Oui, en comparant deux exports officiels de vos informations réalisés à des dates différentes.</p><h3>La personne que je ne suis plus le voit-elle ?</h3><p>Elle ne reçoit pas de notification, mais elle peut le remarquer dans ses propres listes.</p><h3>Pourquoi UnfollowTracker ne garde-t-il pas d’historique ?</h3><p>Cette version compare vos listes actuelles et conserve uniquement le dernier scan complet, sur votre appareil. Pour suivre l’évolution, gardez vos exports datés. Pour commencer, suivez le <a href="/fr/getting-started/">guide d’utilisation</a>.</p>`,
        ],
      ],
    ),
    article(
      "fr",
      2,
      "scan-troubleshooting",
      {
        description:
          "Scan Instagram bloqué ou interrompu : session, vérification, limitation temporaire et résultats conservés. Les bons réflexes avant de relancer UnfollowTracker.",
        updatedAt: "2026-11-05",
        lead: "Pour dépanner un scan Instagram bloqué, commencez par lire le message du panneau et vérifier l’onglet Instagram. Distinguez une lecture encore en cours, une erreur et un ancien résultat conservé avant de relancer.",
      },
      [
        [
          "La barre avance peu ou le compteur repart de zéro",
          `<p>Le scan lit d’abord vos abonnements, puis vos abonnés. Le compteur repart de zéro au changement de liste : cela ne veut pas dire que les profils déjà lus ont été perdus. La barre indique une progression estimée, sans calculer le temps restant. Le code prévoit aussi des pauses entre les requêtes ; un compteur momentanément immobile ne suffit pas à conclure à un blocage. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L88-L185">Source : lecture des listes et progression</a>.</p><p>Regardez le nom de la phase et l’éventuel décompte avant un nouvel essai. Attendez le résultat ou le message d’erreur, plutôt que de recharger Instagram pendant la lecture. Notre article sur les <a href="/fr/blog/instagram-scan-progress-phases/">phases et la barre de progression</a> explique ces changements.</p>`,
        ],
        [
          "Instagram n’est pas connecté",
          `<p>Ouvrez Instagram depuis le bouton du panneau et connectez-vous directement sur le site, dans la même fenêtre de navigateur. Le panneau recherche les onglets de cette fenêtre ; une connexion sur votre téléphone ou dans une autre fenêtre ne suffit pas. Vérifiez le compte connecté, revenez au panneau, puis lancez le scan manuellement une fois la connexion reconnue. Vous n’avez pas à saisir vos identifiants dans UnfollowTracker. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L174-L311">Source : connexion du panneau</a> ; <a href="/fr/blog/instagram-session-without-password/">comprendre la session sans mot de passe supplémentaire</a>.</p><p>Si Instagram est ouvert mais reste inaccessible à l’extension, vérifiez aussi son activation et son accès à Instagram dans Chrome : Extensions, Gérer les extensions, puis Détails pour UnfollowTracker. L’<a href="https://support.google.com/chrome/answer/2664769?hl=en">aide officielle Chrome</a> décrit ces réglages. Notre article sur les <a href="/fr/blog/check-unfollowtracker-extension-permissions/">permissions de l’extension</a> détaille leur rôle.</p>`,
        ],
        [
          "Le panneau demande de recharger Instagram après une mise à jour",
          `<p>Lorsque « Recharger Instagram » est proposé, attendez la fin de toute opération encore en cours, puis utilisez ce bouton. Il ramène à l’onglet associé et le recharge pour reconnecter l’extension. Attendez le chargement, vérifiez le compte, puis revenez au panneau. Rouvrir seulement le panneau ne recharge pas le script dans Instagram ; recharger la page ne lance pas non plus un nouveau scan. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L199-L311">Source : détection et rechargement</a>.</p><p>Ce bouton peut aussi être proposé après un échec général de connexion : il ne prouve pas à lui seul qu’une mise à jour est en cause. Le parcours détaillé est dans <a href="/fr/blog/reload-instagram-after-extension-update/">« Recharger Instagram » après une mise à jour</a>.</p>`,
        ],
        [
          "Instagram demande une vérification",
          `<p>Si Instagram affiche une étape de connexion, une vérification ou une alerte sur votre compte, terminez-la sur Instagram avant de relancer le scan. L’extension s’arrête lorsque la réponse demande une connexion ou une vérification ; elle ne peut pas la réaliser à votre place. Multiplier les scans ne remplace pas cette étape. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L215-L237">Source : arrêt sur demande de connexion ou de vérification</a>.</p>`,
        ],
        [
          "Le panneau indique une limitation de requêtes",
          `<p>Lorsque la lecture reçoit une limitation HTTP 429, UnfollowTracker peut afficher « Nouvel essai dans… ». Ce décompte indique le délai avant de retenter la requête, pas avant la fin du scan. Le nombre de tentatives est limité : le scan s’arrête si les requêtes restent bloquées ou si Instagram demande une attente dépassant la limite prévue par l’extension. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L190-L260">Source : gestion des limitations et du décompte</a>.</p><p>Aucun délai fixe, même de 24 heures, ne garantit la réussite d’un nouveau scan. Laissez le délai affiché s’écouler. Après l’arrêt, consultez votre compte normalement et réessayez plus tard en respectant les indications d’Instagram. Ne lancez pas plusieurs scans dans plusieurs onglets pour essayer d’accélérer le processus.</p>`,
        ],
        [
          "L’onglet a été fermé ou rechargé",
          `<p>Le scan s’exécute dans l’onglet Instagram. Changer d’onglet ou fermer seulement le panneau le laisse continuer. Fermer ou recharger l’onglet Instagram utilisé l’interrompt ; le dernier résultat complet reste enregistré. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/background.js#L105-L129">Source : gestion des interruptions</a>.</p><p>Rouvrez Instagram dans la même fenêtre, attendez le chargement et vérifiez le compte avant de demander un nouveau scan. Il recommence la lecture, sans reprendre au pourcentage précédent. Si vous aviez seulement fermé le panneau, rouvrez-le pour retrouver le scan en cours ou son résultat. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L174-L275">Source : reconnexion au scan</a> ; <a href="/fr/blog/close-panel-instagram-tab-scan/">fermer le panneau ou l’onglet : les différences</a>.</p>`,
        ],
        [
          "Le scan refuse une liste incomplète",
          `<p>Instagram peut renvoyer des données manquantes, signaler des profils masqués ou modifier ses réponses. Si l’extension détecte une page invalide, une pagination bloquée ou une restriction explicite, elle arrête la lecture sans remplacer le résultat complet précédent. Une liste contenant déjà quelques profils n’est donc pas forcément complète. Relancer immédiatement peut produire la même erreur. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L88-L187">Source : validation des listes avant sauvegarde</a>.</p><p>Le scan de votre compte connecté n’exige pas de le rendre public. Une erreur de lecture ne permet pas d’accuser son seul réglage privé, et l’extension ne reconstitue pas les entrées qu’Instagram ne fournit pas. Le même <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L63-L187">parcours de scan</a> s’applique sans condition de visibilité. Voir les <a href="/fr/blog/private-instagram-account-scan-limits/">limites du scan d’un compte privé</a>.</p>`,
        ],
        [
          "Une ancienne date ou aucun résultat après l’erreur",
          `<p>Après un échec, vérifiez « Dernier scan complet » avant d’exporter ou d’agir. Exemple fictif : une liste du 3 novembre reste disponible après une tentative interrompue le 5 novembre. Elle décrit toujours le relevé du 3 ; les pages reçues le 5 ne sont pas ajoutées à cette liste. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/background.js#L65-L84">Source : sauvegarde complète et conservation après erreur</a> ; <a href="/fr/blog/last-complete-instagram-scan-date/">comprendre la date du dernier scan complet</a>.</p><p>Si aucun scan complet n’était enregistré pour ce compte, aucune ancienne liste ne peut réapparaître. Ce n’est pas la même chose qu’un scan terminé avec zéro non-réciproque, qui possède une date et désactive le bouton d’export. Les résultats sont chargés séparément par compte : vérifiez la session sur Instagram si vous venez d’en changer. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L322-L328">Source : chargement par compte</a> et <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L404-L421">affichage du résultat</a> ; <a href="/fr/blog/switch-instagram-account-saved-results/">retrouver le résultat du bon compte</a>.</p>`,
        ],
        [
          "Les photos manquent, mais la liste est affichée",
          `<p>Des initiales à la place d’une photo indiquent un affichage de remplacement, pas un échec de la comparaison. Le panneau les conserve si l’image manque ou ne se charge pas ; le scan compare les identifiants des profils. Vérifiez le pseudonyme et la date du résultat avant de relancer une lecture pour une photo absente. Sources : <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L466-L524">affichage des photos</a> et <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L96-L109">comparaison des identifiants</a>. Voir aussi les <a href="/fr/blog/missing-instagram-profile-photo/">photos de profil absentes</a>.</p>`,
        ],
        [
          "Avant d’effacer les scans ou de réinstaller",
          `<p>Gardez votre dernier résultat pendant le diagnostic. « Effacer les scans enregistrés » supprime les scans de tous les comptes de cette installation après confirmation ; cette commande n’effectue aucune réparation de la connexion Instagram. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L622-L659">Source : suppression des scans</a> ; <a href="/fr/blog/delete-saved-instagram-scans/">ce que cette suppression retire</a>.</p><p>La <a href="https://developer.chrome.com/docs/extensions/reference/api/storage">documentation Chrome</a> précise que désinstaller l’extension efface son stockage local. Si vous choisissez de la retirer et souhaitez conserver une liste non réciproque disponible, exportez-la d’abord. Le JSON conserve la date du scan séparément de la date d’export : télécharger aujourd’hui une ancienne liste ne l’actualise pas. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L661-L685">Source : export du résultat chargé</a>.</p>`,
        ],
        [
          "Quand demander de l’aide",
          '<p>Si le problème persiste, notez la version de l’extension et du navigateur, le message exact du panneau, l’étape concernée et la date du dernier scan complet. Précisez si l’onglet a été rechargé ou si le compte a changé. Ces repères permettent de commencer le diagnostic. Ne partagez pas vos cookies, mots de passe ou listes privées dans un rapport public.</p><p>Consultez aussi le <a href="/fr/getting-started/">guide d’utilisation</a> et la <a href="/fr/privacy/">politique de confidentialité</a>.</p>',
        ],
      ],
    ),
    {
      route: "getting-started/",
      updatedAt: "2026-10-07",
      title: "Guide d’utilisation",
      description:
        "Installer UnfollowTracker et lancer votre premier scan Instagram depuis son panneau latéral.",
      body: '<h1>Votre premier scan, pas à pas.</h1><p class="article-lead">UnfollowTracker est une extension gratuite pour navigateur de bureau. Elle est disponible sur le Chrome Web Store.</p><h2>1. Installer l’extension</h2><p>Le bouton « Installer gratuitement » de la <a href="/fr/#installation">page d’accueil</a> ouvre sa fiche officielle dans le Chrome Web Store. Ajoutez l’extension puis épinglez son icône si vous souhaitez y accéder facilement. Chrome 116 minimum est nécessaire.</p><h2>2. Ouvrir le panneau</h2><p>Cliquez sur l’icône UnfollowTracker. Le panneau latéral s’ouvre dans votre fenêtre. Son côté d’affichage dépend des préférences de votre navigateur. Il reste accessible lorsque vous changez d’onglet.</p><h2>3. Connecter Instagram</h2><p>Si aucun onglet Instagram n’est ouvert dans cette fenêtre, le panneau propose d’en ouvrir un. Cliquez sur « Ouvrir Instagram », puis connectez-vous sur le site. Le scan ne démarre pas automatiquement.</p><h2>4. Scanner et consulter</h2><p>Cliquez sur « Scanner mon compte ». Gardez l’onglet Instagram ouvert, même si vous allez sur un autre site. Une fois le scan terminé, les trois compteurs et la liste des comptes non réciproques s’affichent. Le champ de recherche filtre toute la liste, pas uniquement les lignes visibles.</p><h2>5. Garder le contrôle</h2><p>« Exporter » télécharge la liste en JSON. Un clic sur un profil l’ouvre sur Instagram. « Ne plus suivre » demande une confirmation avant de modifier votre abonnement. « Effacer les scans enregistrés » supprime les données de tous les comptes conservés localement après confirmation.</p><h2>Langue, thème et actualisation</h2><p>Les menus FR/EN et le bouton de thème se trouvent en haut du panneau. Vos préférences restent enregistrées. Pour obtenir des données plus récentes, utilisez « Actualiser le scan » ; le résultat précédent reste conservé si le nouveau scan échoue.</p><p><a href="/fr/guides/scan-troubleshooting/">Un problème pendant le scan ?</a></p>',
    },
  ],
  en: [
    article(
      "en",
      0,
      "non-followers",
      {
        title: "How to see who doesn’t follow you back on Instagram (3 ways)",
        description:
          "See who doesn’t follow you back on Instagram: check one profile, compare your official data export, or scan both lists for free in a side panel.",
        updatedAt: "2026-10-25",
        lead: "Instagram shows your followers and the accounts you follow, but its help pages describe no list of accounts that don’t follow you back. To get one, compare the two lists: by hand for a few accounts, with Instagram’s official data export, or in a single scan with a free extension such as UnfollowTracker.",
      },
      [
        [
          "What “doesn’t follow you back” means",
          `<p>An account doesn’t follow you back when you follow it and it isn’t among your followers. That’s common with creators, brands or quiet friends, and on its own it is not a sign of suspicious activity.</p><p>For example, you follow Alex, Camille and Lou. Camille and Lou follow you; Alex doesn’t. Alex doesn’t follow you back. This describes the present: it doesn’t tell you whether Alex ever followed you.</p><p>Subtracting your two counts won’t give you this number, because some people follow you without you following them. <a href="/en/blog/instagram-counts-vs-non-reciprocal-accounts/">Why the counts aren’t enough</a>.</p>`,
        ],
        [
          "Method 1: check a specific account",
          `<p>For one or two accounts, a manual check is enough, in the app or on instagram.com.</p><ol><li>Open your Instagram profile.</li><li>Open your Followers list.</li><li>Type the account’s username into the list’s search field.</li><li>If it doesn’t appear while you follow it, that account doesn’t follow you back.</li></ol><p>If you manage several accounts, make sure you are signed in to the right one. Beyond a few dozen accounts, this becomes slow and it’s easy to miss someone.</p>`,
        ],
        [
          "Method 2: compare your official data export",
          `<p>Without installing anything, you can ask Instagram for a copy of your information and compare your followers with the accounts you follow. On a computer, <a href="https://help.instagram.com/181231772500920">Instagram’s help</a> describes these steps:</p><ol><li>On instagram.com, click “More” in the bottom left, then “Settings”.</li><li>Click “Meta Account” (or “Accounts Center”, depending on your account), then “Your information and permissions”.</li><li>Click “Export your information”, then “Create export”.</li><li>Select your profile, click “Next”, then choose “Export to device”.</li><li>Choose the information, date range and format, then click “Start export”.</li></ol><p>Among the types of information, Instagram describes “Connections” as who and how you’ve connected with people on Instagram; your followers and following belong there. When the export is ready, you have four days to download it. Instagram notes that the email with the link can take up to 30 days to arrive.</p><p>Then open your followers file and your following file, in HTML or JSON depending on the format you chose. Put the usernames in two spreadsheet columns: every name in your following and missing from your followers is an account that doesn’t follow you back. Keep these files on your device rather than uploading them to an unknown website. <a href="/en/blog/instagram-official-export-vs-local-scan/">Official export or local scan: which do you need?</a></p>`,
        ],
        [
          "Method 3: scan both lists with UnfollowTracker",
          `<p>UnfollowTracker is a free extension for Chrome and compatible browsers such as Brave, on desktop. It reads your followers and following through your Instagram session, then shows the accounts that don’t follow you back, with no export or spreadsheet.</p><ol><li>Install the extension from the Chrome Web Store, then open instagram.com in the same browser, signed in to your account.</li><li>Click the UnfollowTracker icon to open the side panel.</li><li>Choose “Scan my account” and keep the Instagram tab open while the lists are read.</li><li>Browse the list, search for a name, open a profile or export the result as JSON.</li></ol><p>The extension asks for no password and no UnfollowTracker account. The latest complete scan stays saved on your device, with its date, for each Instagram account. Scan time depends on the size of your lists and on Instagram’s responses, and Instagram may temporarily limit requests: <a href="/en/guides/scan-troubleshooting/">what to do if a scan stops</a>. The <a href="/en/getting-started/">getting started guide</a> covers every step.</p>`,
        ],
        [
          "Which method should you use?",
          `<table><thead><tr><th>Method</th><th>Best for</th><th>What you need</th><th>Time</th></tr></thead><tbody><tr><td>Manual check</td><td>One or a few accounts</td><td>The Instagram app or website</td><td>Instant</td></tr><tr><td>Official export</td><td>Installing nothing</td><td>A spreadsheet and some patience</td><td>Up to 30 days to receive the link, then 4 days to download</td></tr><tr><td>UnfollowTracker</td><td>The full list in one scan</td><td>Chrome or Brave on a computer</td><td>The length of the scan</td></tr></tbody></table><p>All three methods describe one moment in time. Before acting, check the date of your snapshot: your relationships may have changed since.</p>`,
        ],
        [
          "Before you unfollow anyone",
          `<p>An account that doesn’t follow you back isn’t necessarily one to drop. A few common situations:</p><ul><li>Brands, media and creators rarely follow their followers back.</li><li>Your request to follow a private account may still be pending: <a href="/en/blog/instagram-pending-follow-requests/">pending follow requests</a>.</li><li>You may have removed that person from your followers yourself: <a href="/en/blog/instagram-unfollow-vs-remove-follower/">unfollow or remove a follower</a>.</li><li>Muting an account doesn’t change who follows whom: <a href="/en/blog/instagram-mute-non-reciprocal-results/">muted accounts and your results</a>.</li></ul><p>If you stop following someone, they aren’t told: <a href="https://help.instagram.com/286340048138725/?cms_platform=iphone-app">Instagram’s help</a> states that people won’t be notified when you unfollow them. In UnfollowTracker, each unfollow is done one account at a time, after confirmation. Take the time to check each profile; there’s no rush.</p>`,
        ],
        [
          "Keep your account safe",
          `<p>Never give your Instagram password to an app or website that offers to analyze your followers. UnfollowTracker doesn’t ask for it: it uses the session already open on instagram.com, and your lists aren’t sent to any UnfollowTracker server. <a href="/en/blog/instagram-session-without-password/">Why no password is needed</a>.</p><p>Before installing an extension, look at the permissions it requests and its publisher’s privacy policy. <a href="/en/blog/check-unfollowtracker-extension-permissions/">Check UnfollowTracker’s permissions</a>.</p>`,
        ],
        [
          "Frequently asked questions",
          `<h3>Can you see who doesn’t follow you back without an app?</h3><p>Yes: check an account by hand, or compare your official data export in a spreadsheet. An extension saves time when your lists are long.</p><h3>Will someone know I unfollowed them?</h3><p>Instagram doesn’t send them a notification, although they may notice when looking at their own lists.</p><h3>Does it work on iPhone or Android?</h3><p>UnfollowTracker is an extension for desktop browsers. On a phone, use the manual check or the official export.</p><h3>Is UnfollowTracker really free?</h3><p>Yes. Scanning, search, export and the side panel are free, with no subscription or account to create.</p><h3>What about finding who unfollowed me?</h3><p>That’s a different question, which needs two snapshots taken at different dates: <a href="/en/guides/unfollowers-vs-non-followers/">who unfollowed me on Instagram?</a></p>`,
        ],
      ],
    ),
    article(
      "en",
      1,
      "unfollowers-vs-non-followers",
      {
        title: "How to see who unfollowed you on Instagram",
        description:
          "Instagram doesn’t tell you when someone unfollows you. Compare two snapshots of your followers to spot it, and learn what a current list can’t show.",
        updatedAt: "2026-10-25",
        lead: "Instagram doesn’t notify you when someone stops following you: its help states that people aren’t notified about an unfollow. To find out who unfollowed you, compare your followers at two different times. A current list only shows who doesn’t follow you back today.",
      },
      [
        [
          "“Doesn’t follow me” vs. “no longer follows me”",
          `<p>“Doesn’t follow me back” describes the present: you follow an account and it isn’t among your followers. You can check it by comparing your two current lists.</p><p>“No longer follows me” needs a before and an after: the account was among your followers, then disappeared. Without an earlier record, no current list can prove it.</p><table><thead><tr><th>Account</th><th>You follow</th><th>Follows you today</th><th>Conclusion</th></tr></thead><tbody><tr><td>Alex</td><td>Yes</td><td>No</td><td>Doesn’t follow you back</td></tr><tr><td>Camille</td><td>Yes</td><td>Yes</td><td>Mutual</td></tr><tr><td>Lou</td><td>No</td><td>Yes</td><td>You don’t follow Lou back</td></tr></tbody></table><p>Without an older record, you can’t tell whether Alex ever followed you. The difference between the counts can’t tell you either: two lists of the same size can contain different accounts.</p>`,
        ],
        [
          "Method 1: compare two official exports",
          `<p>The most complete method is to keep a copy of your followers, then compare it with a more recent copy.</p><ol><li>Request an export of your Instagram information that includes “Connections”, which covers your relationships. The steps are in our <a href="/en/guides/non-followers/">guide to accounts that don’t follow you back</a>.</li><li>Keep the followers file, with its date.</li><li>A few weeks later, request a new export.</li><li>Compare the two files: a name in the first and missing from the second left your followers between the two dates.</li></ol><p>According to <a href="https://help.instagram.com/181231772500920">Instagram’s help</a>, a ready export can be downloaded for four days, and the email with the link can take up to 30 days to arrive. Plan your snapshots ahead.</p>`,
        ],
        [
          "Method 2: check one specific person",
          `<p>For one person, search their username in your Followers list. If they aren’t there, they don’t follow you today. To know whether they followed you before, you need an older record, such as an export or an old copy of your list.</p>`,
        ],
        [
          "Method 3: keep your UnfollowTracker exports",
          `<p>UnfollowTracker shows the accounts you follow that don’t follow you back at the time of the scan. It keeps only the latest complete scan for each account and doesn’t build a history.</p><p>You can still keep a record: “Export” saves the current list as a dated JSON file. By comparing two exports made on different dates, you can see which accounts you already followed became non-reciprocal in between. This comparison only covers accounts you follow; it says nothing about followers you don’t follow back. <a href="/en/blog/export-instagram-results-json/">Read the exported JSON file</a>.</p>`,
        ],
        [
          "Why an account disappears from your followers",
          `<p>A disappearance isn’t always a deliberate unfollow. The account may also have been deleted, deactivated or blocked, or you may have removed it from your followers yourself: <a href="/en/blog/instagram-unfollow-vs-remove-follower/">unfollow or remove a follower</a>. Check the profile before drawing conclusions about a person.</p>`,
        ],
        [
          "Be careful with “real-time” unfollow alerts",
          `<p>To report every unfollow, a service has to re-read your lists regularly and store them. Before trusting it with your account, check what it stores, where, and whether it asks for your password. Never give your Instagram password to a third party: UnfollowTracker doesn’t need it and keeps its results on your device. <a href="/en/blog/instagram-session-without-password/">Why no password is needed</a>.</p>`,
        ],
        [
          "Frequently asked questions",
          `<h3>Does Instagram tell you when someone unfollows you?</h3><p>No. <a href="https://help.instagram.com/286340048138725/?cms_platform=iphone-app">Instagram’s help</a> states that people won’t be notified when someone unfollows them.</p><h3>Can I see who unfollowed me without an app?</h3><p>Yes, by comparing two official exports of your information made on different dates.</p><h3>Will the person I unfollow know?</h3><p>They don’t get a notification, but they may notice it in their own lists.</p><h3>Why doesn’t UnfollowTracker keep a history?</h3><p>This version compares your current lists and keeps only the latest complete scan, on your device. To follow changes over time, keep your dated exports. To get started, follow the <a href="/en/getting-started/">getting started guide</a>.</p>`,
        ],
      ],
    ),
    article(
      "en",
      2,
      "scan-troubleshooting",
      {
        description:
          "Instagram scan stuck or interrupted? Check the session, verification, temporary rate limits and saved results before running UnfollowTracker again.",
        updatedAt: "2026-11-05",
        lead: "To troubleshoot a stuck Instagram scan, start with the panel message and your Instagram tab. Check whether the scan is still reading, has failed, or is showing an older saved result before starting again.",
      },
      [
        [
          "The bar barely moves or the counter starts again at zero",
          `<p>The scan reads your following first, then your followers. The counter starts again at zero when the list changes: that does not mean previously read profiles were lost. The bar shows estimated progress, without calculating time remaining. The code also pauses between requests, so a temporarily unchanged counter is not enough to diagnose a stuck scan. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L88-L185">Source: list reading and progress</a>.</p><p>Check the phase name and any countdown before a retry. Wait for the result or error message instead of reloading Instagram during the scan. Our article on <a href="/en/blog/instagram-scan-progress-phases/">scan phases and the progress bar</a> explains these changes.</p>`,
        ],
        [
          "Instagram isn’t connected",
          `<p>Open Instagram with the panel button and sign in directly on the website, in the same browser window. The panel looks for tabs in that window; being signed in on your phone or in another window is not enough. Check the signed-in account, return to the panel, then start a scan manually once it recognizes the connection. You never need to enter your credentials in UnfollowTracker. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L174-L311">Source: panel connection</a>; <a href="/en/blog/instagram-session-without-password/">how the session works without an extra password</a>.</p><p>If Instagram is open but the extension still cannot access it, also check that UnfollowTracker is enabled and has access to Instagram in Chrome: Extensions, Manage extensions, then Details for UnfollowTracker. <a href="https://support.google.com/chrome/answer/2664769?hl=en">Official Chrome help</a> describes these settings. Our article on <a href="/en/blog/check-unfollowtracker-extension-permissions/">extension permissions</a> explains what they do.</p>`,
        ],
        [
          "The panel asks you to reload Instagram after an update",
          `<p>When “Reload Instagram” appears, wait for any operation still running to finish, then use that button. It brings the connected tab forward and reloads it to reconnect the extension. Wait for the page to load, check the account, then return to the panel. Reopening only the panel does not reload the script in Instagram; reloading the page does not start a new scan either. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L199-L311">Source: connection checks and reloading</a>.</p><p>The same button can also appear after a general connection failure, so it does not prove an update caused the issue. See the full steps in <a href="/en/blog/reload-instagram-after-extension-update/">“Reload Instagram” after an extension update</a>.</p>`,
        ],
        [
          "Instagram requires verification",
          `<p>If Instagram displays a login step, verification or account alert, complete it on Instagram before scanning again. The extension stops when the response asks for login or verification; it cannot complete that step for you. Repeated scans are no substitute for it. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L215-L237">Source: stopping for login or verification</a>.</p>`,
        ],
        [
          "The panel reports a request limit",
          `<p>When a list request receives an HTTP 429 rate limit, UnfollowTracker may show “Retrying in…”. This countdown is the wait before retrying the request, not the time until the scan finishes. The number of retries is limited: the scan stops if requests remain blocked or Instagram asks for a wait beyond the extension’s limit. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L190-L260">Source: rate limits and the retry countdown</a>.</p><p>No fixed wait, including 24 hours, guarantees that a new scan will succeed. Let the displayed delay finish. After the scan stops, check your account normally and try again later, following Instagram’s instructions. Avoid starting scans in multiple tabs in an attempt to speed up the process.</p>`,
        ],
        [
          "The tab was closed or reloaded",
          `<p>The scan runs in the Instagram tab. Switching tabs or closing only the panel lets it continue. Closing or reloading the Instagram tab it uses interrupts it; your latest complete result stays saved. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/background.js#L105-L129">Source: interruption handling</a>.</p><p>Reopen Instagram in the same window, wait for it to load and check the account before requesting a new scan. It reads the lists again rather than resuming at the previous percentage. If you only closed the panel, reopen it to find the running scan or its result. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L174-L275">Source: reconnecting to a scan</a>; <a href="/en/blog/close-panel-instagram-tab-scan/">closing the panel or the tab: the differences</a>.</p>`,
        ],
        [
          "The scan refuses an incomplete list",
          `<p>Instagram may omit data, report hidden profiles or change its responses. If the extension detects an invalid page, stalled pagination or an explicit restriction, it stops reading without replacing the previous complete result. A list that already contains some profiles is not necessarily complete. Retrying immediately may produce the same error. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L88-L187">Source: validating lists before saving</a>.</p><p>Scanning your signed-in account does not require making it public. A reading error cannot be blamed on its private setting alone, and the extension cannot reconstruct entries Instagram does not provide. The same <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L63-L187">scan process</a> applies without a visibility requirement. See the <a href="/en/blog/private-instagram-account-scan-limits/">limits of scanning a private account</a>.</p>`,
        ],
        [
          "An old date or no result after the error",
          `<p>After a failed scan, check “Last complete scan” before exporting or acting on the list. In a fictional example, a result from 3 November remains available after a scan is interrupted on 5 November. It still describes the 3 November snapshot; pages received on the 5th are not added to it. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/background.js#L65-L84">Source: saving complete results and preserving them after errors</a>; <a href="/en/blog/last-complete-instagram-scan-date/">understanding the last complete scan date</a>.</p><p>If no complete scan was saved for this account, there is no older list to restore. This differs from a completed scan with zero non-reciprocal accounts, which has a date and disables the export button. Results are loaded separately for each account: check the Instagram session if you just switched accounts. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L322-L328">Source: loading results by account</a> and <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L404-L421">displaying results</a>; <a href="/en/blog/switch-instagram-account-saved-results/">finding the right account’s result</a>.</p>`,
        ],
        [
          "Photos are missing, but the list is visible",
          `<p>Initials in place of a photo are a fallback display, not a failed comparison. The panel keeps them when an image is missing or fails to load; the scan compares profile IDs. Check the username and result date before starting another scan for a missing photo. Sources: <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L466-L524">photo display</a> and <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/content.js#L96-L109">ID comparison</a>. See also <a href="/en/blog/missing-instagram-profile-photo/">missing profile photos</a>.</p>`,
        ],
        [
          "Before deleting scans or reinstalling",
          `<p>Keep your latest result while troubleshooting. “Delete saved scans” removes scans for every account in this installation after confirmation; it does not repair the Instagram connection. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L622-L659">Source: deleting saved scans</a>; <a href="/en/blog/delete-saved-instagram-scans/">what deletion removes</a>.</p><p><a href="https://developer.chrome.com/docs/extensions/reference/api/storage">Chrome’s documentation</a> states that uninstalling an extension clears its local storage. If you choose to remove it and want to keep an available non-reciprocal list, export it first. The JSON keeps the scan date separate from the export date: downloading an older list today does not refresh it. <a href="https://github.com/feedain9/UnfollowTracker/blob/f608724e5b5dfdf4c024c75a23904a14d5bc3c2b/src/scripts/popup.js#L661-L685">Source: exporting the loaded result</a>.</p>`,
        ],
        [
          "When to ask for help",
          '<p>If the issue persists, note the extension version, browser version, exact panel message, affected phase and last complete scan date. Mention whether the tab was reloaded or the account changed. These details provide a starting point for troubleshooting. Never include your cookies, passwords or private lists in a public report.</p><p>Also see the <a href="/en/getting-started/">getting started guide</a> and <a href="/en/privacy/">privacy policy</a>.</p>',
        ],
      ],
    ),
    {
      route: "getting-started/",
      updatedAt: "2026-10-07",
      title: "Getting started",
      description:
        "Install UnfollowTracker and run your first Instagram scan from its browser side panel.",
      body: '<h1>Your first scan, step by step.</h1><p class="article-lead">UnfollowTracker is a free desktop browser extension. It is available on the Chrome Web Store.</p><h2>1. Install the extension</h2><p>The “Install for free” button on the <a href="/en/#installation">home page</a> opens the official Chrome Web Store listing. Add the extension and pin its icon for easy access. Chrome 116 or later is required.</p><h2>2. Open the panel</h2><p>Click the UnfollowTracker icon. The side panel opens in your window. Its placement follows your browser’s side-panel preferences. It stays available when you switch tabs.</p><h2>3. Connect Instagram</h2><p>If no Instagram tab is open in this window, the panel offers to open one. Click “Open Instagram” and sign in on the website. Scanning does not start automatically.</p><h2>4. Scan and explore</h2><p>Click “Scan my account”. Keep the Instagram tab open even when visiting another site. When the scan completes, you’ll see three counters and the non-reciprocal list. Search filters the entire list, not just the visible rows.</p><h2>5. Stay in control</h2><p>“Export” downloads the list as JSON. Clicking a profile opens it on Instagram. “Unfollow” asks for confirmation before changing your following. “Delete saved scans” removes all accounts’ locally saved data after confirmation.</p><h2>Language, theme and refresh</h2><p>The FR/EN selector and theme button are at the top of the panel. Your preferences are saved. To read fresher data, choose “Refresh scan”; the previous result is preserved if the new scan fails.</p><p><a href="/en/guides/scan-troubleshooting/">Having trouble with a scan?</a></p>',
    },
  ],
};
