# Site de Nyassobi

Site public de l'association [Nyassobi](https://nyassobi.fr), qui met en avant le VTubing
francophone. Application React (Vite) qui lit son contenu dans le WordPress de
l'association par WPGraphQL : pages, news, ateliers, menu et réglages.

## Démarrer

Node 22 ou plus.

```bash
npm install
npm run dev        # http://localhost:5173, branché sur le WordPress de production
```

L'adresse GraphQL vient de `VITE_WORDPRESS_GRAPHQL_URL` (`.env.production`), avec
`https://admin.nyassobi.fr/graphql` par défaut. Le site ne fait que lire ; seuls les
formulaires de contact et d'adhésion écrivent.

| Commande            | Rôle                                   |
| ------------------- | -------------------------------------- |
| `npm run dev`       | serveur de développement               |
| `npm run build`     | vérification des types puis compilation |
| `npm run lint`      | ESLint                                 |
| `npm run typecheck` | TypeScript                             |
| `npm test`          | tests (Vitest)                         |

## Version de travail sur la Raspberry Pi

```bash
./scripts/deployer.sh        # Mac / Linux
.\scripts\deployer.ps1       # Windows
```

Le script vérifie que tout est validé et poussé sur GitHub, lance les tests, compile, puis
envoie le site sur la Pi (alias SSH `nv-pi`), où nginx le sert sur le port 8503 :
http://nv-pi:8503, ou http://nv-pi:8503 par Tailscale. Les trois dernières
versions sont gardées dans `~/nyassobi-site/www/releases` ; la bascule est instantanée.

`--bac-a-sable` (`-BacASable` sous Windows) déploie plutôt une copie sur le port 8505, dont les
formulaires partent vers le WordPress de test du bac à sable (voir le dépôt du plugin).

## Organisation

- `src/lib/content.ts` : toutes les requêtes WordPress, mises en cache par React Query
  (et gardées dans le navigateur pour que la visite suivante s'affiche aussitôt).
- `src/lib/WpContent.tsx` : affichage du HTML rédigé dans WordPress, nettoyé par DOMPurify.
- `src/widgets/` : composants que les rédacteurs insèrent dans une page avec
  `<wp-component name="…">` (formulaire de contact, dons HelloAsso, documents…).
- `src/pages/` : accueil, news, ateliers, pages WordPress, mentions légales.
- `src/ui/` et `src/layout/` : briques visuelles, en-tête, pied de page.
- `src/nybi/` : Nybi, la mascotte, uniquement à partir des émotes officielles.

## Direction visuelle

La même que l'observatoire de l'association : pas de cadres ni de cartes, des bandes
pleine largeur jointes par des vagues, un en-tête sur un ciel dégradé, des sections
annoncées par une émote de Nybi. Orange `#e8622f`, turquoise `#0f9d93`, neutres bruns ;
Fredoka pour les titres, Rubik pour le texte. Thème sombre, « réduire les animations »
et cibles de 44 px au doigt sont respectés.

## Ajouter un widget dans une page WordPress

Dans l'éditeur, un bloc HTML personnalisé contenant par exemple :

```html
<wp-component name="NyassoContact"></wp-component>
```

Les noms disponibles sont listés dans `src/widgets/registry.tsx`.
