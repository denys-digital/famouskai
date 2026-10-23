# Checklist de validation — Extension du concept "Famous Mark" à [﹥•°]

Cette checklist couvre l'ensemble des changements livrés : `ext-famous-core.js` (nouveau),
`patch-index-html-core-integration.diff`, `patch-outline-core-integration.diff`,
`patch-living-documentation.diff`. À cocher avant tout déploiement en production.

## 1. Ordre de chargement des scripts (point critique n°1)

- [ ] `plugins/ext-famous-core.js` est bien inséré dans `index.html` **avant** `plugins/ext-outline.js`
- [ ] `plugins/ext-famous-core.js` est bien inséré **avant** `plugins/ext-snippets.js`
- [ ] `plugins/ext-famous-core.js` est bien inséré **avant** le bloc `<script>` inline principal (celui qui contient `initFamousMarkFolding`)
- [ ] Le nom de fichier physique déposé sur disque est exactement `ext-famous-core.js` dans le dossier `plugins/` (correspondance avec le `src=` du `<script>`)
- [ ] Aucune balise `defer`/`async` n'a été ajoutée sur ces `<script>` par erreur (romprait l'ordre synchrone requis)

## 2. Service Worker / cache PWA (point critique n°2 — spécifique à l'architecture PWA)

- [ ] `sw.js` a été mis à jour pour précacher `plugins/ext-famous-core.js` (sinon 404 en mode offline pour les utilisateurs ayant déjà installé la PWA)
- [ ] La constante `CACHE_NAME` dans `sw.js` a été incrémentée (bump de version) pour forcer l'invalidation du cache existant chez les utilisateurs déjà installés — sans ce bump, l'ancien cache continue de servir l'ancienne version sans le nouveau fichier
- [ ] Après déploiement, vérifier dans `app-version` (footer sidebar) que la nouvelle version s'affiche bien après un premier rechargement
- [ ] Test spécifique PWA : couper le réseau (mode avion / DevTools offline), relancer l'app installée, vérifier que le folding et l'Outline fonctionnent bien pour les 3 caractères sans erreur console

## 3. Comportement de repli (fallback) en cas d'échec de chargement du core

- [ ] Simuler l'échec de chargement de `ext-famous-core.js` (le renommer temporairement ou bloquer son URL dans DevTools) et vérifier que :
- [ ] Le folding ACE continue de fonctionner pour ﹥ (comportement historique, régression zéro)
- [ ] L'Outline continue de fonctionner pour ﹥ (comportement historique, régression zéro)
- [ ] Le libellé `help` des snippets `fm`/`md`/`fb` reste affiché (valeur en dur d'origine, non écrasée)
- [ ] Aucune exception JS n'apparaît dans la console (`window.FamousPluginCore.FamousMark` undefined doit être géré silencieusement)

## 4. Cohérence Outline ↔ Folding (l'objectif même du refactor)

- [ ] Sur un même fichier, chaque ligne qui devient un bookmark dans l'Outline (icône `toc-item-famous`) déclenche bien une icône de fold dans la gouttière ACE, pour les 3 caractères
- [ ] Inversement, aucune ligne pliable dans l'éditeur n'est absente de l'Outline (et vice versa) — tester ﹥, •, ° un par un
- [ ] Clic sur un bookmark `•` ou `°` dans l'Outline : `unfold` + `gotoLine` + `scrollToLine` fonctionnent identiquement à ﹥

## 5. Non-régression — faux positifs sur texte/code normal

- [ ] Une ligne `Température : 20°C` (° en milieu de ligne) → **ne doit pas** apparaître dans l'Outline ni devenir pliable
- [ ] Une ligne de CSS `transform: rotate(45deg);` (aucun ° littéral ici mais tester aussi `/* 45° rotation */` en milieu de ligne) → **ne doit pas** matcher
- [ ] Une ligne `- • sous-item` (le • précédé d'un autre caractère que les préfixes autorisés) → **ne doit pas** matcher
- [ ] Un fichier `.txt`/`.md` contenant une liste à puces classique copiée-collée depuis Word/Docs (lignes commençant par `•`) → vérifier consciemment que ces lignes **deviennent** des bookmarks (comportement voulu, mais à valider avec l'utilisateur final que ce n'est pas perçu comme un bruit visuel indésirable dans l'Outline sur de gros documents)
- [ ] Scanner le workspace existant de l'utilisateur (recherche manuelle ou `grep`) pour repérer les fichiers déjà impactés rétroactivement par ce changement de périmètre

## 6. Exclusion YAML héritée

- [ ] Ouvrir un fichier `.yml`/`.yaml` contenant `•` ou `°` en début de ligne → confirmer qu'**aucun** fold ni bookmark n'apparaît (exclusion YAML toujours active, héritée automatiquement sans code additionnel)
- [ ] Confirmer dans la console que les logs `FoldPatch YAML mode detected` s'affichent toujours normalement

## 7. Snippets et documentation vivante

- [ ] Taper `fm` + Tab dans un fichier `.md` → insère bien `﹥` avec curseur positionné correctement
- [ ] Taper `md` + Tab → insère bien `•`
- [ ] Taper `fb` + Tab → insère bien `°`
- [ ] Taper `help` + Tab dans chaque extension supportée → le texte d'aide affiché pour `fm`/`md`/`fb` provient bien de `ext-famous-core.js` (modifier temporairement un `label` dans `MARKS` et vérifier que le changement se répercute sans toucher `ext-snippets-3.js`)
- [ ] Vérifier que les autres snippets (`mark`, `br`, `sp`, `code`, etc., non concernés par ce refactor) fonctionnent toujours à l'identique

## 8. Régression multi-extensions

Pour chaque extension supportée (`js`, `ts`, `json`, `html`, `xml`, `css`, `md`, `yaml`/`yml` *(exclu, voir §6)*, `txt`, `log`) :
- [ ] Folding natif du langage (fonctions JS, balises HTML/XML, titres Markdown `#`) toujours intact, aucune interférence avec le nouveau périmètre `[﹥•°]`
- [ ] Aucune double icône de fold ni conflit visuel dans la gouttière sur une ligne qui matcherait à la fois une règle native et une Famous Mark

## 9. Performance et absence de fuite

- [ ] Pas de ralentissement perceptible à la frappe sur un fichier volumineux (>1000 lignes) contenant de nombreuses occurrences de `•`/`°` en milieu de ligne (le test d'ancrage `^` doit échouer rapidement, pas de backtracking catastrophique — la regex étant simple, ce risque est théoriquement nul, à confirmer empiriququement)
- [ ] Le compteur de logs `FoldPatch` (throttlé/désactivé par défaut en v8) ne réapparaît pas en masse dans la console en usage normal

## 10. Vérification finale du principe de source unique

- [ ] Recherche globale dans le code source (`grep -rn "FE65\|\\u2022\|\\u00B0\|﹥\|•\|°"`) pour confirmer qu'aucune **autre** regex de détection du Famous Mark n'existe ailleurs dans le projet (nouveaux tools, futurs plugins, etc.)
- [ ] Documenter dans le `README` ou équivalent que `ext-famous-core.js` est désormais la référence unique du concept, pour les futurs contributeurs open-source
