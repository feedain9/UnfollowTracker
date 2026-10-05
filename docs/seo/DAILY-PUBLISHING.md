# Publication éditoriale quotidienne

Autorisation du propriétaire le 5 octobre 2026 : rédaction et publication automatiques, en français et en anglais. Cadence prévue : un sujet par jour à 09:00, Europe/Zurich. Un sujet produit deux versions linguistiques, pas deux articles concurrents.

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
2. Choisir une question distincte du calendrier. Comparer l’intention et la réponse aux pages existantes, pas seulement les titres. Si la question est déjà traitée, choisir une autre question utile. Ne pas créer des variantes par pays, année, synonyme ou navigateur sans différence réelle.
3. Consulter des sources primaires actuelles : aide officielle Instagram/Meta, documentation Chrome/Brave, code public du produit. Ne jamais inventer un parcours testé, des témoignages, statistiques, captures, avis, volumes de recherche, durées d’attente ou garantie de classement.
4. Répondre immédiatement, puis donner un exemple concret, des étapes utiles et les limites pertinentes. Adapter la longueur au sujet ; éviter remplissage, promesses anxiogènes et bourrage de mots-clés. Traduire naturellement, sans recopier d’autres articles.
5. Citer la source près de la section qu’elle justifie. Les références finales complètent ces citations. Le site indique que la rédaction et la vérification utilisent des outils d’IA ; ne pas inventer un auteur humain.
6. Décrire exactement le produit : comparaison actuelle, pas historique des désabonnements ; pas d’import de l’archive Instagram ; export JSON ; scan manuel ; panneau persistant ; onglet Instagram connecté à conserver ; actions de désabonnement individuelles confirmées ; restrictions d’Instagram respectées. Ne proposer aucun contournement des restrictions.
7. Exemples uniquement fictifs, sans données issues du compte Instagram de l’utilisateur. Ne pas manipuler Instagram pour écrire un article.

## Contrôles avant publication

- Un seul nouveau sujet par date locale. Si un article daté d’aujourd’hui est déjà publié dans `origin/main`, terminer sans doublon.
- Deux langues complètes, sources effectivement ouvertes, dates exactes, intention inédite, au moins un lien interne pertinent.
- Exécuter `node --test tests/posts.test.js`, `node scripts/build-site.js --production`, puis `git diff --check`.
- Le générateur valide les dates, les langues, les sources, les intentions dupliquées et les destinations des liens internes. Inspecter les deux HTML générés : H1, canonical, hreflang, BlogPosting, dates, absence de noindex en production.
- N’ajouter au commit que le nouveau JSON. Ne pas committer `dist`, `src`, une configuration, des données privées, des tokens ou les sorties locales d’autres tâches.
- Pousser sans force sur `main`. En cas d’avance distante, fetch puis rebase du seul commit éditorial dans l’espace isolé, refaire les vérifications et le contrôle du doublon quotidien. Ne jamais résoudre un conflit en écrasant un autre travail.
- Vérifier la page FR, la page EN et le sitemap en HTTPS après le déploiement. En cas d’échec, rapporter l’erreur et le commit sans prétendre que l’article est en ligne. Ne pas republier aveuglément.
- Si une vérification factuelle reste impossible ou que l’agent ne trouve aucun sujet utile, ne rien publier et expliquer la raison dans le compte rendu Superset. Aucune notification privée externe n’est autorisée par cette procédure.

Sources de méthode : [Google — contenu utile](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Google — utilisation de l’IA générative](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content), [Cloudflare — intégration Git](https://developers.cloudflare.com/pages/configuration/git-integration/).
