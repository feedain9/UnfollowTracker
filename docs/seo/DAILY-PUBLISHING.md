# Publication éditoriale automatique

Autorisation du propriétaire le 5 octobre 2026 : rédaction et publication automatiques, en français et en anglais. Cadence décidée le 25 octobre 2026 et active depuis le 26 : **trois articles par semaine**, lundi, mercredi et vendredi à 09:00 (Europe/Zurich), sur les requêtes réelles de [KEYWORDS.md](KEYWORDS.md), et **un passage d’enrichissement des guides** le jeudi à 09:00. Un sujet produit deux versions linguistiques, pas deux articles concurrents.

## Destination et déploiement

- Dépôt : `feedain9/UnfollowTracker`, branche `main`.
- Fichiers éditoriaux : `site/posts/<slug>.json`.
- Blog : `https://unfollow.yadulink.com/fr/blog/` et `/en/blog/`.
- Cloudflare Pages : projet `unfollowtracker`, build `node scripts/build-site.js --production`, sortie `dist/site`, variable `SKIP_DEPENDENCY_INSTALL=true`.
- Chaque push sur `main` déclenche le déploiement. Aucun token Cloudflare ni service payant de génération n’est nécessaire dans le dépôt.
- L’automatisation Superset utilise l’agent Codex du poste. Le Mac et Superset doivent être disponibles pour une exécution locale ; l’hébergement du site reste indépendant du poste.

## Contrat d’un article

Le JSON est du contenu texte, jamais du code ni du HTML. Les textes sont échappés par le générateur. Lire `site/posts.js` pour le contrat validé et les articles existants pour un exemple. Clés obligatoires :

```json
{
  "schemaVersion": 1,
  "slug": "export-instagram-results-json",
  "intent": "exporter et comprendre le fichier JSON des comptes non réciproques",
  "status": "published",
  "publishedAt": "2026-10-05",
  "updatedAt": "2026-10-05",
  "sources": [{"url": "https://example.com/primary-source", "title": "Source primaire réellement consultée", "checkedAt": "2026-10-05"}],
  "fr": {
    "title": "Titre français précis",
    "description": "Résumé unique de moins de 180 caractères.",
    "lead": "La réponse concrète à la question.",
    "sections": [{"heading": "Étape ou explication", "paragraphs": ["Texte"], "sources": [1]}, {"heading": "Un exemple", "paragraphs": ["Texte"], "steps": ["Action 1", "Action 2"]}],
    "related": [{"label": "Comprendre les résultats", "route": "guides/non-followers/"}]
  },
  "en": {"title": "Natural English title", "description": "An accurate English description.", "lead": "The direct answer.", "sections": [{"heading": "Explanation", "paragraphs": ["Text"], "sources": [1]}, {"heading": "Example", "paragraphs": ["Text"]}], "related": [{"label": "Understand the results", "route": "guides/non-followers/"}]}
}
```

`steps` et `bullets` sont facultatifs. Les indices `sources` commencent à 1. Les liens internes utilisent un chemin sans langue, avec slash final. Le slug reste identique entre les deux langues pour les alternates. Les brouillons et dates futures ne sont pas publiés. Ne jamais modifier la date d’un article sans changement de fond.

## Travail de rédaction

1. Lire `PRODUCT.md`, `site/content.js`, `site/articles.js`, les articles existants, `docs/release/PROFILE-PHOTOS.md` et le code pertinent. Vérifier l’état du store dans `site/publication.json`. Tant que `storeUrl` est nul, ne pas annoncer une installation disponible.
2. Choisir dans [KEYWORDS.md](KEYWORDS.md) le groupe « À faire » de plus haute priorité qui demande un nouvel article, et confirmer ses formulations actuelles avec quelques suggestions Google (`suggestqueries.google.com`, `client=firefox`, `hl=fr&gl=fr` puis `hl=en&gl=us`). Le titre de chaque langue reprend la formulation réelle de la requête dans cette langue. Comparer l’intention et la réponse aux pages existantes, pas seulement les titres. Si la question est déjà traitée, choisir un autre groupe. Ne pas créer des variantes par pays, année, synonyme ou navigateur sans différence réelle.
3. Consulter des sources primaires actuelles : aide officielle Instagram/Meta, documentation Chrome/Brave, code public du produit. Ne jamais inventer un parcours testé, des témoignages, statistiques, captures, avis, volumes de recherche, durées d’attente ou garantie de classement.
4. Répondre immédiatement, puis donner un exemple concret, des étapes utiles et les limites pertinentes. Adapter la longueur au sujet : un article complet compte souvent 900 à 1 500 mots par langue ; éviter remplissage, promesses anxiogènes et bourrage de mots-clés. Lier le guide principal du sujet et un ou deux articles proches. Traduire naturellement, sans recopier d’autres articles.
5. Citer la source près de la section qu’elle justifie. Les références finales complètent ces citations. Le site indique que la rédaction et la vérification utilisent des outils d’IA ; ne pas inventer un auteur humain.
6. Décrire exactement le produit : comparaison actuelle, pas historique des désabonnements ; pas d’import de l’archive Instagram ; export JSON ; scan manuel ; panneau persistant ; onglet Instagram connecté à conserver ; actions de désabonnement individuelles confirmées ; restrictions d’Instagram respectées. Ne proposer aucun contournement des restrictions.
7. Exemples uniquement fictifs, sans données issues du compte Instagram de l’utilisateur. Ne pas manipuler Instagram pour écrire un article.

## Contrôles avant publication

- Un seul nouveau sujet par date locale. Si un article daté d’aujourd’hui est déjà publié dans `origin/main`, terminer sans doublon.
- Deux langues complètes, sources effectivement ouvertes, dates exactes, intention inédite, au moins un lien interne pertinent.
- Exécuter `node --test tests/posts.test.js`, `node scripts/build-site.js --production`, puis `git diff --check`.
- Le générateur valide les dates, les langues, les sources, les intentions dupliquées et les destinations des liens internes. Inspecter les deux HTML générés : H1, canonical, hreflang, BlogPosting, dates, absence de noindex en production.
- N’ajouter au commit que le nouveau JSON et la ligne d’état du groupe traité dans `KEYWORDS.md` (« Publié le JJ/MM/AAAA »). Ne pas committer `dist`, `src`, une configuration, des données privées, des tokens ou les sorties locales d’autres tâches.
- Pousser sans force sur `main`. En cas d’avance distante, fetch puis rebase du seul commit éditorial dans l’espace isolé, refaire les vérifications et le contrôle du doublon quotidien. Ne jamais résoudre un conflit en écrasant un autre travail.
- Vérifier la page FR, la page EN et le sitemap en HTTPS après le déploiement. En cas d’échec, rapporter l’erreur et le commit sans prétendre que l’article est en ligne. Ne pas republier aveuglément.
- Une fois les pages en ligne, notifier IndexNow (Bing et moteurs participants) : `node scripts/indexnow.js <URL FR> <URL EN> https://unfollow.yadulink.com/fr/blog/ https://unfollow.yadulink.com/en/blog/`. Rapporter le code HTTP ; un échec ne bloque pas la publication et ne se relance pas en boucle.
- Si une vérification factuelle reste impossible ou que l’agent ne trouve aucun sujet utile, ne rien publier et expliquer la raison dans le compte rendu Superset. Aucune notification privée externe n’est autorisée par cette procédure.

Sources de méthode : [Google — contenu utile](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Google — utilisation de l’IA générative](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content), [Cloudflare — intégration Git](https://developers.cloudflare.com/pages/configuration/git-integration/).

## Enrichissement hebdomadaire des guides

Chaque jeudi, un seul guide parmi `guides/non-followers/`, `guides/unfollowers-vs-non-followers/`, `guides/scan-troubleshooting/` et `getting-started/` : celui dont `updatedAt` est le plus ancien (sans `updatedAt`, compter le 5 octobre 2026). Le prompt exécutable est [weekly-guides-prompt.md](weekly-guides-prompt.md).

- Ajouter les liens vers les articles publiés depuis la dernière mise à jour du guide, couvrir les formulations de son groupe dans `KEYWORDS.md` qui manquent encore, corriger un fait qui a changé.
- Chaque fait est vérifié sur une source primaire réellement consultée et cité près du passage concerné. Rien d’utile ou de vérifiable : ne rien modifier et le dire.
- URL, structure, design et cartes de la page d’accueil restent inchangés ; les deux langues restent équivalentes ; `updatedAt` prend la date du jour.
- Contrôles : `node --test tests/*.test.js`, `npm run lint`, `npm run build:site`, `npm run test:site`, build de production, `git diff --check`. Commit limité à `site/articles.js` et, si nécessaire, `site/content.js`. Vérification en ligne puis IndexNow, comme pour un article.

## Automatisations activées

| Automatisation Superset | ID | Déclencheur | Prompt |
|---|---|---|---|
| UnfollowTracker — article (lun, mer, ven) | `5ef77198-81f8-4fbd-b12b-0755ef7f8f05` | `FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=9;BYMINUTE=0` | [daily-automation-prompt.md](daily-automation-prompt.md) |
| UnfollowTracker — enrichissement des guides (jeudi) | `e8f8028f-33c8-4922-9c4b-b3c83b9b37aa` | `FREQ=WEEKLY;BYDAY=TH;BYHOUR=9;BYMINUTE=0` | [weekly-guides-prompt.md](weekly-guides-prompt.md) |

Toutes deux : fuseau `Europe/Zurich`, agent `codex`, projet `5758adc0-c190-4011-be97-2e0d193083e4`, espace neuf par exécution. La première, créée le 5 octobre 2026 (premier passage réel validé avec le guide d’export JSON, commit `db04666`), publiait chaque jour jusqu’au 25 octobre ; la seconde a été créée le 25 octobre. Les prompts du dépôt sont la référence : après une modification, la reporter avec `superset automations prompt set <id> --from-file <fichier>`.

Commandes de suivi :

```sh
superset automations get <id>
superset automations logs <id>
superset automations pause <id>   # suspendre sans supprimer
```

Une réponse 403 d’un client de contrôle ne prouve pas que la page est hors ligne : vérifier les événements Cloudflare et le résultat avec un client HTTP standard ou le navigateur. Ne pas désactiver les protections, falsifier une identité de bot ni contourner une demande de vérification pour terminer un contrôle.
