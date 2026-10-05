/* Local-only catalogue: no translation service calls. */
globalThis.TrackerI18n = {
  en: {
    language: "Language",
    theme: "Change theme",
    followers: "Followers",
    following: "Following",
    nonreciprocal: "Don’t follow back",
    connecting: "Connecting to Instagram…",
    connected: "Connected to Instagram",
    offline: "Open Instagram to start",
    signedOut: "Sign in to Instagram to start",
    connectTitle: "Your Instagram, alongside you.",
    connectBody:
      "Open Instagram and sign in there. Then start a scan here, whenever you’re ready.",
    openInstagram: "Open Instagram",
    returnInstagram: "Go to Instagram",
    reloadInstagram: "Reload Instagram",
    reloadNeeded: "Reload Instagram to connect the updated extension.",
    connectionFailed: "Unable to connect. Reload Instagram and try again.",
    loading: "Instagram is loading…",
    scan: "Scan my account",
    refresh: "Refresh scan",
    scanning: "Scanning…",
    scanningStatus: "Scanning in progress…",
    starting: "Starting scan…",
    complete: "Scan complete",
    results: "Don’t follow you back",
    export: "Export",
    search: "Search a name or username",
    searchLabel: "Search results",
    more: "Show more",
    noMatches: "No matching accounts.",
    empty: "Everyone you follow follows you back!",
    lastScan: "Last complete scan",
    snapshot:
      "A comparison of current lists, not a history of who unfollowed you.",
    footer:
      "Keep the Instagram tab open during the scan. You can switch tabs or close this panel.",
    privacy: "Privacy",
    clear: "Delete saved scans",
    clearTitle: "Delete saved scans?",
    clearBody:
      "This removes all saved Instagram lists from this browser. You can scan again later. Export first if you want to keep a copy.",
    clearConfirm: "Delete scans",
    cleared: "Saved scans deleted",
    unfollow: "Unfollow",
    unfollowing: "Unfollowing…",
    unfollowTitle: "Unfollow this account?",
    unfollowBody:
      "This changes your Instagram following. Only this account will be unfollowed.",
    unfollowed: "Unfollowed",
    cancel: "Cancel",
    retry: "Instagram is limiting requests. Retrying in {seconds}s…",
    fetchFollowing: "Fetching following",
    fetchFollowers: "Fetching followers",
    comparing: "Comparing lists",
    disconnected: "The Instagram tab is closed. Open Instagram to scan again.",
    interrupted:
      "The previous scan was interrupted. Run a new scan; your last complete results are preserved.",
    confirmFailed:
      "Instagram did not confirm the unfollow. Check the profile before trying again.",
    changed: "Your Instagram account changed. Scan again before continuing.",
    genericError:
      "Instagram could not complete the request. Check your Instagram tab and try again later.",
    disclosure:
      "Starting a scan reads your followers and following through your Instagram session and saves the latest complete result in this browser.",
  },
  fr: {
    language: "Langue",
    theme: "Changer de thème",
    followers: "Abonnés",
    following: "Abonnements",
    nonreciprocal: "Pas en retour",
    connecting: "Connexion à Instagram…",
    connected: "Connecté à Instagram",
    offline: "Ouvrez Instagram pour commencer",
    signedOut: "Connectez-vous sur Instagram pour commencer",
    connectTitle: "Votre Instagram, à vos côtés.",
    connectBody:
      "Ouvrez Instagram et connectez-vous sur le site. Lancez ensuite un scan ici, quand vous le souhaitez.",
    openInstagram: "Ouvrir Instagram",
    returnInstagram: "Aller sur Instagram",
    reloadInstagram: "Recharger Instagram",
    reloadNeeded:
      "Rechargez Instagram pour connecter la nouvelle version de l’extension.",
    connectionFailed:
      "Connexion impossible. Rechargez Instagram, puis réessayez.",
    loading: "Instagram se charge…",
    scan: "Scanner mon compte",
    refresh: "Actualiser le scan",
    scanning: "Scan en cours…",
    scanningStatus: "Scan en cours…",
    starting: "Démarrage du scan…",
    complete: "Scan terminé",
    results: "Ne vous suivent pas en retour",
    export: "Exporter",
    search: "Rechercher un nom ou un pseudo",
    searchLabel: "Rechercher dans les résultats",
    more: "Afficher la suite",
    noMatches: "Aucun compte correspondant.",
    empty: "Tous vos abonnements vous suivent en retour !",
    lastScan: "Dernier scan complet",
    snapshot:
      "Une comparaison des listes actuelles, pas un historique des désabonnements.",
    footer:
      "Gardez l’onglet Instagram ouvert pendant le scan. Vous pouvez changer d’onglet ou fermer ce panneau.",
    privacy: "Confidentialité",
    clear: "Effacer les scans enregistrés",
    clearTitle: "Effacer les scans enregistrés ?",
    clearBody:
      "Toutes les listes Instagram enregistrées dans ce navigateur seront supprimées. Vous pourrez refaire un scan. Exportez-les avant si vous voulez en garder une copie.",
    clearConfirm: "Effacer les scans",
    cleared: "Scans enregistrés effacés",
    unfollow: "Ne plus suivre",
    unfollowing: "Désabonnement…",
    unfollowTitle: "Ne plus suivre ce compte ?",
    unfollowBody:
      "Cette action modifie vos abonnements Instagram. Seul ce compte sera retiré.",
    unfollowed: "Vous ne suivez plus",
    cancel: "Annuler",
    retry: "Instagram limite les requêtes. Nouvel essai dans {seconds} s…",
    fetchFollowing: "Lecture des abonnements",
    fetchFollowers: "Lecture des abonnés",
    comparing: "Comparaison des listes",
    disconnected:
      "L’onglet Instagram est fermé. Ouvrez Instagram pour refaire un scan.",
    interrupted:
      "Le scan précédent a été interrompu. Relancez-le ; vos derniers résultats complets sont conservés.",
    confirmFailed:
      "Instagram n’a pas confirmé le désabonnement. Vérifiez le profil avant de réessayer.",
    changed:
      "Votre compte Instagram a changé. Refaites un scan avant de continuer.",
    genericError:
      "Instagram n’a pas pu terminer la requête. Vérifiez votre onglet Instagram et réessayez plus tard.",
    disclosure:
      "Lancer un scan lit vos abonnés et abonnements via votre session Instagram et conserve le dernier résultat complet dans ce navigateur.",
  },
  error(message, language) {
    if (language !== "fr") return message;
    const c = this.fr;
    if (/account changed|previous account/.test(message)) return c.changed;
    if (/already running|Wait for/.test(message))
      return "Une opération est déjà en cours. Attendez sa fin avant de réessayer.";
    if (/closed or reloaded|interrupted/.test(message)) return c.interrupted;
    if (/sign in|log in|session expired|authenticated|login/i.test(message))
      return "Votre session Instagram a expiré. Reconnectez-vous sur Instagram, puis relancez le scan.";
    if (/challenge|checkpoint|verify|verification/i.test(message))
      return "Instagram demande une vérification. Ouvrez Instagram et terminez-la avant de réessayer.";
    if (/limiting|Too many|429|rate limit/i.test(message))
      return "Instagram limite temporairement les requêtes. Le scan est arrêté ; réessayez plus tard. Vos derniers résultats complets sont conservés.";
    if (
      /incomplete|invalid.*list|invalid account|page limit|stopped advancing|hiding part/.test(
        message,
      )
    )
      return "Instagram n’a pas fourni une liste complète et valide. Aucun résultat partiel n’a été enregistré. Réessayez plus tard.";
    if (/confirm the unfollow/.test(message)) return c.confirmFailed;
    if (/out of date/.test(message))
      return "Ces résultats sont périmés. Refaites un scan complet avant de vous désabonner.";
    if (/too long|network|fetch/i.test(message))
      return "Instagram ne répond pas. Vérifiez votre connexion, puis réessayez.";
    if (/save|saved scan/.test(message))
      return "Impossible d’enregistrer le résultat. Rechargez Instagram et relancez le scan.";
    return c.genericError;
  },
};
