# Architecture du site

Hôte proposé : `https://unfollow.yadulink.com`. Arborescence identique en FR et EN pour des alternates simples et réciproques. Les slugs de guide anglais restent lisibles techniquement ; les titres et contenus sont entièrement traduits.

```text
/
├── /fr/
│   ├── getting-started/
│   ├── guides/non-followers/
│   ├── guides/unfollowers-vs-non-followers/
│   ├── guides/scan-troubleshooting/
│   ├── privacy/
│   └── legal/
└── /en/
    └── mêmes routes, textes anglais
```

La racine renvoie vers le français (règle de redirection fournie et document HTML de repli). Elle n’est pas une troisième landing indexable. `x-default` pointe sur le français. Le menu de langue conserve la route courante au lieu de renvoyer systématiquement à l’accueil.

| Type | Canonique | Hreflang | Schéma | Maillage |
|---|---|---|---|---|
| Landing | Sa propre URL de langue | fr/en/x-default | SoftwareApplication, sans avis fictif | Sections, trois guides, aide, politiques |
| Guides | Leur propre URL | fr/en/x-default | Article avec auteur organisationnel et date réelle | Produit + autre guide réellement pertinent |
| Aide | Sa propre URL | fr/en/x-default | Aucun nécessaire | Installation + dépannage |
| Confidentialité / légal | Leur propre URL | fr/en/x-default | Aucun nécessaire | Footer + contact public une fois confirmé |

14 pages HTML localisées sont générées. Le sitemap de production inclut les pages utiles hormis les mentions légales ; il ne contient ni paramètres de démonstration, ni API, ni fichiers JSON ni URL de cache. Le sitemap d’aperçu est vide et robots fermé.

Pas de pages par ville, par pseudo Instagram ou par variante orthographique d’un même mot-clé. Aucune donnée de compte privé n’est publiée pour alimenter des pages SEO. Un historique d’abonnés, s’il est développé un jour, devra posséder son propre périmètre de données avant de justifier une nouvelle page de fonctionnalités.
