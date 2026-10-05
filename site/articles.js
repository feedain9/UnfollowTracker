const copy = require("./content");
const paragraphs = (sections) =>
  sections.map(([title, text]) => `<h2>${title}</h2>${text}`).join("");
const article = (lang, index, slug, lead, sections) => ({
  route: `guides/${slug}/`,
  title: copy[lang].guideTitles[index],
  description: copy[lang].guideDescriptions[index],
  body: `<h1>${copy[lang].guideTitles[index]}</h1><p class="article-lead">${lead}</p>${paragraphs(sections)}`,
});
module.exports = {
  fr: [
    article(
      "fr",
      0,
      "non-followers",
      "Pour savoir qui ne vous suit pas en retour, il faut comparer les comptes que vous suivez avec ceux qui vous suivent. Le nombre total d’abonnés ne suffit pas.",
      [
        [
          "Ce que signifie « ne vous suit pas en retour »",
          "<p>Un compte est non réciproque lorsque vous le suivez et qu’il ne figure pas dans votre liste d’abonnés au moment de la comparaison. Cela arrive avec des amis, des créateurs ou des marques. Ce n’est pas, à lui seul, un signal d’activité suspecte ou une raison de vous désabonner.</p><p>Par exemple, vous suivez Alex, Camille et Lou. Camille et Lou vous suivent ; Alex ne figure pas parmi vos abonnés. Alex apparaît donc dans la liste des comptes non réciproques. Cette conclusion ne dit pas si Alex vous suivait auparavant.</p>",
        ],
        [
          "La méthode manuelle",
          "<p>Pour vérifier un compte précis, consultez vos listes sur Instagram et recherchez son pseudonyme dans vos abonnés. Assurez-vous que vous examinez le bon compte et le bon profil. Comparer chaque entrée devient toutefois fastidieux lorsque vos listes s’allongent. Soustraire les deux compteurs ne donne pas le nombre de comptes non réciproques : certaines personnes vous suivent sans que vous les suiviez.</p>",
        ],
        [
          "La comparaison avec UnfollowTracker",
          "<ol><li>Ouvrez Instagram sur ordinateur et connectez-vous directement sur le site.</li><li>Ouvrez le panneau de l’extension. Sans onglet Instagram, utilisez le bouton proposé pour en ouvrir un.</li><li>Lancez « Scanner mon compte ». Gardez l’onglet ouvert pendant la lecture.</li><li>Consultez la liste, recherchez un pseudonyme ou exportez les résultats.</li></ol><p>L’extension compare les identifiants des comptes, puis affiche ceux qui sont présents dans vos abonnements et absents de vos abonnés. Le résultat complet est enregistré localement avec la date du scan. Les listes restent séparées pour chaque compte connecté.</p>",
        ],
        [
          "Lire le résultat avec les bonnes limites",
          "<p>Le résultat correspond aux listes retournées par Instagram pendant le scan. Des changements peuvent survenir pendant leur lecture. Si Instagram signale une restriction, renvoie une page invalide ou arrête sa pagination, l’extension refuse d’enregistrer un résultat détecté comme incomplet et conserve le précédent. Elle ne peut pas déduire les données qu’Instagram ne fournit pas.</p><p>Avant d’agir, regardez la date du dernier scan complet. Un ancien résultat reste utile, mais il ne représente pas nécessairement la situation actuelle. Un désabonnement depuis l’extension se fait un compte à la fois, après confirmation ; vous pouvez aussi simplement consulter le profil.</p>",
        ],
        [
          "Ce que cette liste ne vous dit pas",
          '<p>UnfollowTracker ne fournit pas, dans cette version, un historique des personnes qui se sont désabonnées. Un compte non réciproque ne vous a peut-être jamais suivi. Pour distinguer ces deux notions, consultez notre <a href="/fr/guides/unfollowers-vs-non-followers/">guide sur les unfollowers et les abonnements non réciproques</a>. Si votre scan s’arrête, utilisez le <a href="/fr/guides/scan-troubleshooting/">guide de dépannage</a>.</p>',
        ],
      ],
    ),
    article(
      "fr",
      1,
      "unfollowers-vs-non-followers",
      "« Ne me suit pas » et « ne me suit plus » ne décrivent pas la même chose. La première expression parle du présent ; la seconde suppose une comparaison dans le temps.",
      [
        [
          "Un abonnement non réciproque décrit deux listes actuelles",
          "<p>Vous suivez un compte. Ce compte ne figure pas dans vos abonnés. Il est non réciproque au moment de la lecture, qu’il vous ait déjà suivi ou non. Vous pouvez trouver cette différence en comparant vos abonnements et vos abonnés, sans posséder d’ancien relevé.</p>",
        ],
        [
          "Un désabonnement suppose un avant et un après",
          "<p>Pour identifier un compte qui vous suivait auparavant, il faut disposer de deux listes d’abonnés enregistrées à des moments différents. Un compte présent dans la première et absent de la seconde a disparu de la liste entre les deux observations. Cela ne donne pas forcément l’heure exacte ni la cause du changement.</p><p>Un compte supprimé, désactivé, bloqué ou retiré de vos abonnés peut également disparaître. Même une comparaison historique demande donc de vérifier le contexte avant d’attribuer un désabonnement volontaire à une personne.</p>",
        ],
        [
          "Un exemple simple",
          "<table><thead><tr><th>Compte</th><th>Vous le suivez</th><th>Vous suit maintenant</th><th>Conclusion</th></tr></thead><tbody><tr><td>Alex</td><td>Oui</td><td>Non</td><td>Non réciproque</td></tr><tr><td>Camille</td><td>Oui</td><td>Oui</td><td>Réciproque</td></tr><tr><td>Lou</td><td>Non</td><td>Oui</td><td>Vous ne suivez pas Lou en retour</td></tr></tbody></table><p>Sans ancien relevé, on ne sait pas si Alex vous a déjà suivi. La différence entre les compteurs totaux ne permet pas non plus de retrouver ces relations : les listes peuvent avoir la même taille sans contenir les mêmes comptes.</p>",
        ],
        [
          "Ce que fait précisément UnfollowTracker",
          "<p>Cette version compare les deux listes actuelles et conserve le dernier scan complet par compte. Un nouveau scan complet remplace le précédent. Elle ne construit pas de chronologie de vos abonnés et ne signale pas les nouveaux désabonnements entre deux scans.</p><p>Le mot « unfollowers » est souvent utilisé pour rechercher un outil de comparaison. Sur ce site et dans le panneau, « ne vous suivent pas en retour » désigne le résultat exact. La date affichée indique quand la liste a été lue, pas quand une personne a changé son abonnement.</p>",
        ],
        [
          "Que faire du résultat ?",
          '<p>Consultez les profils qui vous intéressent, gardez les comptes dont vous appréciez les publications, exportez la liste si elle vous est utile. La réciprocité n’est qu’une information parmi d’autres. Pour effectuer votre première comparaison, suivez le <a href="/fr/getting-started/">guide d’utilisation</a>.</p>',
        ],
      ],
    ),
    article(
      "fr",
      2,
      "scan-troubleshooting",
      "Un scan bloqué ne signifie pas toujours que vous devez attendre 24 heures. Commencez par lire le message du panneau et vérifier l’onglet Instagram.",
      [
        [
          "Instagram n’est pas connecté",
          "<p>Ouvrez Instagram depuis le bouton du panneau et connectez-vous directement sur le site. Si vous venez de mettre à jour l’extension, rechargez l’onglet Instagram pour y installer la nouvelle version du script. Vous n’avez pas à saisir vos identifiants dans UnfollowTracker.</p>",
        ],
        [
          "Instagram demande une vérification",
          "<p>Si Instagram affiche une étape de connexion, une vérification ou une alerte sur votre compte, terminez-la sur Instagram avant de relancer le scan. L’extension ne peut pas réaliser cette vérification à votre place. Multiplier les scans ne résout pas ce type de blocage.</p>",
        ],
        [
          "Le panneau indique une limitation de requêtes",
          "<p>Instagram peut répondre avec une limitation temporaire. UnfollowTracker affiche alors un délai avant une nouvelle tentative. Le nombre de tentatives est limité : le scan finit par s’arrêter si les requêtes restent bloquées. Si Instagram indique un délai trop long, le scan s’arrête plutôt que de relancer une boucle sans fin.</p><p>Il n’existe pas de durée d’attente universelle qui garantisse la reprise. Laissez le délai affiché s’écouler. Après l’arrêt, consultez votre compte normalement et réessayez plus tard. Ne lancez pas plusieurs scans dans plusieurs onglets pour essayer d’accélérer le processus.</p>",
        ],
        [
          "L’onglet a été fermé ou rechargé",
          "<p>Le scan s’exécute dans l’onglet Instagram. Changer d’onglet ou fermer le panneau ne l’arrête pas, mais fermer ou recharger Instagram l’interrompt. Rouvrez Instagram, attendez le chargement puis relancez un scan. Le dernier résultat complet est conservé avec sa date.</p>",
        ],
        [
          "Le scan refuse une liste incomplète",
          "<p>Instagram peut renvoyer des données manquantes, masquer une partie d’une liste ou modifier ses réponses. Si l’extension détecte une page invalide, une pagination bloquée ou une restriction explicite, elle refuse de remplacer le résultat complet précédent par une liste partielle. Relancer immédiatement peut produire la même erreur.</p>",
        ],
        [
          "Quand demander de l’aide",
          '<p>Si le problème persiste, notez la version de l’extension et du navigateur, le message exact du panneau et l’étape concernée : lecture des abonnés ou des abonnements. Ces informations suffisent pour commencer le diagnostic. Ne partagez pas vos cookies, mots de passe ou listes privées dans un rapport public.</p><p>Avant d’exporter ou d’agir sur un résultat conservé après une erreur, vérifiez sa date : il s’agit toujours du dernier scan complet, pas du scan interrompu. Consultez aussi le <a href="/fr/getting-started/">guide d’utilisation</a> et la <a href="/fr/privacy/">politique de confidentialité</a>.</p>',
        ],
      ],
    ),
    {
      route: "getting-started/",
      title: "Guide d’utilisation",
      description:
        "Installer UnfollowTracker et lancer votre premier scan Instagram depuis son panneau latéral.",
      body: '<h1>Votre premier scan, pas à pas.</h1><p class="article-lead">UnfollowTracker est une extension gratuite pour navigateur de bureau. Sa publication sur le Chrome Web Store est en préparation.</p><h2>1. Installer l’extension</h2><p>Une fois disponible, le bouton d’installation de la <a href="/fr/#installation">page d’accueil</a> ouvrira sa fiche officielle dans le Chrome Web Store. Ajoutez l’extension puis épinglez son icône si vous souhaitez y accéder facilement. Chrome 116 minimum est nécessaire.</p><h2>2. Ouvrir le panneau</h2><p>Cliquez sur l’icône UnfollowTracker. Le panneau latéral s’ouvre dans votre fenêtre. Son côté d’affichage dépend des préférences de votre navigateur. Il reste accessible lorsque vous changez d’onglet.</p><h2>3. Connecter Instagram</h2><p>Si aucun onglet Instagram n’est ouvert dans cette fenêtre, le panneau propose d’en ouvrir un. Cliquez sur « Ouvrir Instagram », puis connectez-vous sur le site. Le scan ne démarre pas automatiquement.</p><h2>4. Scanner et consulter</h2><p>Cliquez sur « Scanner mon compte ». Gardez l’onglet Instagram ouvert, même si vous allez sur un autre site. Une fois le scan terminé, les trois compteurs et la liste des comptes non réciproques s’affichent. Le champ de recherche filtre toute la liste, pas uniquement les lignes visibles.</p><h2>5. Garder le contrôle</h2><p>« Exporter » télécharge la liste en JSON. Un clic sur un profil l’ouvre sur Instagram. « Ne plus suivre » demande une confirmation avant de modifier votre abonnement. « Effacer les scans enregistrés » supprime les données de tous les comptes conservés localement après confirmation.</p><h2>Langue, thème et actualisation</h2><p>Les menus FR/EN et le bouton de thème se trouvent en haut du panneau. Vos préférences restent enregistrées. Pour obtenir des données plus récentes, utilisez « Actualiser le scan » ; le résultat précédent reste conservé si le nouveau scan échoue.</p><p><a href="/fr/guides/scan-troubleshooting/">Un problème pendant le scan ?</a></p>',
    },
  ],
  en: [
    article(
      "en",
      0,
      "non-followers",
      "To find who doesn’t follow you back, compare the accounts you follow with the accounts that follow you. Total follower counts alone can’t answer that question.",
      [
        [
          "What “doesn’t follow you back” means",
          "<p>An account is non-reciprocal when you follow it and it is absent from your followers list at the time of the comparison. This can include friends, creators or brands. On its own, it is neither evidence of suspicious activity nor a reason to unfollow someone.</p><p>For example, you follow Alex, Camille and Lou. Camille and Lou follow you, but Alex is absent from your followers. Alex appears in the non-reciprocal list. This tells you nothing about whether Alex followed you in the past.</p>",
        ],
        [
          "Checking manually",
          "<p>For one specific account, check your lists on Instagram and search your followers for its username. Make sure you are looking at the right signed-in account and the right profile. Checking every entry becomes tedious as the lists grow. Subtracting the two totals won’t give you a non-follower count: some people follow you without you following them.</p>",
        ],
        [
          "Comparing with UnfollowTracker",
          "<ol><li>Open Instagram on your computer and sign in on the website.</li><li>Open the extension panel. If Instagram isn’t open, use the offered button to open a tab.</li><li>Choose “Scan my account” and keep the Instagram tab open.</li><li>Read the list, search a username or export the results.</li></ol><p>The extension compares account IDs and displays accounts present in your following but absent from your followers. The complete result is saved locally with the scan date. Saved lists are separated by signed-in account.</p>",
        ],
        [
          "Understanding the limits",
          "<p>The result reflects the lists Instagram returned during the scan. Relationships may change while they are being read. If Instagram reports a restriction, sends an invalid page or stops advancing through the list, the extension refuses to save a result detected as incomplete and keeps the previous complete one. It cannot infer information Instagram does not provide.</p><p>Before acting, check the last complete scan date. An older result may still be useful, but it need not reflect the current situation. Unfollowing through the extension is done one account at a time after confirmation. You can also just open the profile.</p>",
        ],
        [
          "What the list doesn’t tell you",
          '<p>This version of UnfollowTracker doesn’t provide a history of people who unfollowed you. A non-reciprocal account may never have followed you. Read the <a href="/en/guides/unfollowers-vs-non-followers/">unfollowers vs. non-followers guide</a> for the distinction. If your scan stops, use the <a href="/en/guides/scan-troubleshooting/">troubleshooting guide</a>.</p>',
        ],
      ],
    ),
    article(
      "en",
      1,
      "unfollowers-vs-non-followers",
      "“Doesn’t follow me” and “no longer follows me” mean different things. The first describes the present; the second requires a comparison over time.",
      [
        [
          "Non-reciprocal following describes two current lists",
          "<p>You follow an account. That account is absent from your followers. It is non-reciprocal at the time you check, whether or not it ever followed you. You can find this difference by comparing your current following and followers, without an older snapshot.</p>",
        ],
        [
          "An unfollow requires a before and an after",
          "<p>To identify an account that previously followed you, you need follower lists recorded at two different times. An account present in the first and absent from the second disappeared between those observations. This does not necessarily reveal the exact time or cause.</p><p>A deleted, deactivated, blocked or removed account may also disappear. Even a historical comparison requires context before concluding someone deliberately unfollowed you.</p>",
        ],
        [
          "A simple example",
          "<table><thead><tr><th>Account</th><th>You follow</th><th>Follows you now</th><th>Conclusion</th></tr></thead><tbody><tr><td>Alex</td><td>Yes</td><td>No</td><td>Non-reciprocal</td></tr><tr><td>Camille</td><td>Yes</td><td>Yes</td><td>Reciprocal</td></tr><tr><td>Lou</td><td>No</td><td>Yes</td><td>You don’t follow Lou back</td></tr></tbody></table><p>Without an older record, you cannot tell if Alex ever followed you. The difference between total counts cannot reveal these relationships either: two lists can have the same size but contain different accounts.</p>",
        ],
        [
          "What UnfollowTracker does",
          "<p>This version compares the two current lists and saves the latest complete scan per account. A new complete scan replaces the previous one. It doesn’t build a follower timeline or report new unfollows between scans.</p><p>“Unfollowers” is a common search term for comparison tools. On this site and in the panel, “don’t follow you back” describes the exact result. The displayed date tells you when the list was read, not when someone changed their following.</p>",
        ],
        [
          "What to do with the result",
          '<p>Visit profiles you are interested in, keep accounts whose posts you enjoy, or export the list if useful. Reciprocity is just one piece of information. Follow the <a href="/en/getting-started/">getting started guide</a> to make your first comparison.</p>',
        ],
      ],
    ),
    article(
      "en",
      2,
      "scan-troubleshooting",
      "A stuck scan doesn’t always mean you need to wait 24 hours. Start with the message in the panel and check your Instagram tab.",
      [
        [
          "Instagram isn’t connected",
          "<p>Open Instagram with the button in the panel and sign in directly on the website. If you just updated the extension, reload the Instagram tab so it receives the updated script. You never need to enter your credentials in UnfollowTracker.</p>",
        ],
        [
          "Instagram requires verification",
          "<p>If Instagram displays a login step, verification or account alert, complete it on Instagram before scanning again. The extension cannot perform that verification for you. Repeated scans will not resolve this type of block.</p>",
        ],
        [
          "The panel reports a request limit",
          "<p>Instagram may respond with a temporary rate limit. UnfollowTracker shows a delay before retrying. Attempts are bounded: the scan eventually stops if requests remain blocked. If Instagram asks for an excessively long wait, the scan stops instead of retrying indefinitely.</p><p>No universal waiting period guarantees recovery. Let the displayed delay finish. After the scan stops, check your account normally and try again later. Avoid starting scans in multiple tabs in an attempt to speed up the process.</p>",
        ],
        [
          "The tab was closed or reloaded",
          "<p>The scan runs in the Instagram tab. Switching tabs or closing the panel doesn’t stop it, but closing or reloading Instagram does. Reopen Instagram, wait for it to load, then start a new scan. Your latest complete result stays saved with its date.</p>",
        ],
        [
          "The scan refuses an incomplete list",
          "<p>Instagram may omit data, hide part of a list or change its responses. If the extension detects an invalid page, stalled pagination or an explicit restriction, it refuses to replace a complete result with a partial list. Retrying immediately may produce the same error.</p>",
        ],
        [
          "When to ask for help",
          '<p>If the issue persists, note the extension version, browser version, exact panel message and affected phase: reading followers or following. Those details are enough to start troubleshooting. Never include your cookies, passwords or private lists in a public report.</p><p>Before exporting or acting on results kept after an error, check the date: they still come from the last complete scan, not the interrupted scan. Also see the <a href="/en/getting-started/">getting started guide</a> and <a href="/en/privacy/">privacy policy</a>.</p>',
        ],
      ],
    ),
    {
      route: "getting-started/",
      title: "Getting started",
      description:
        "Install UnfollowTracker and run your first Instagram scan from its browser side panel.",
      body: '<h1>Your first scan, step by step.</h1><p class="article-lead">UnfollowTracker is a free desktop browser extension. Its Chrome Web Store publication is being prepared.</p><h2>1. Install the extension</h2><p>Once available, the installation button on the <a href="/en/#installation">home page</a> will open the official Chrome Web Store listing. Add the extension and pin its icon for easy access. Chrome 116 or later is required.</p><h2>2. Open the panel</h2><p>Click the UnfollowTracker icon. The side panel opens in your window. Its placement follows your browser’s side-panel preferences. It stays available when you switch tabs.</p><h2>3. Connect Instagram</h2><p>If no Instagram tab is open in this window, the panel offers to open one. Click “Open Instagram” and sign in on the website. Scanning does not start automatically.</p><h2>4. Scan and explore</h2><p>Click “Scan my account”. Keep the Instagram tab open even when visiting another site. When the scan completes, you’ll see three counters and the non-reciprocal list. Search filters the entire list, not just the visible rows.</p><h2>5. Stay in control</h2><p>“Export” downloads the list as JSON. Clicking a profile opens it on Instagram. “Unfollow” asks for confirmation before changing your following. “Delete saved scans” removes all accounts’ locally saved data after confirmation.</p><h2>Language, theme and refresh</h2><p>The FR/EN selector and theme button are at the top of the panel. Your preferences are saved. To read fresher data, choose “Refresh scan”; the previous result is preserved if the new scan fails.</p><p><a href="/en/guides/scan-troubleshooting/">Having trouble with a scan?</a></p>',
    },
  ],
};
