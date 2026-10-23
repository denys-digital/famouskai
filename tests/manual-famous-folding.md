## Plan de test pour valider sereinement le "Famous folding"

Voici les cas qui couvrent les risques réels (pas juste "ça plie visuellement") :

- **Marqueur en dernière ligne du fichier** : `﹥ titre` tout seul en fin de document, sans ligne après — vérifier qu'aucune exception n'est levée (garde `endRow > startRow`).
- **Deux marqueurs consécutifs sans contenu entre eux** — le pli du premier doit être vide ou absent, pas planter.
- **Marqueur indenté** (comme votre ` ﹥ on teste...` avec espace avant) — confirmer que la regex matche bien malgré les espaces de tête.
- **Bascule répétée entre types de fichiers** (js → txt → nouveau document → md → txt) dix fois de suite — vérifier qu'aucun doublon de patch n'apparaît dans les logs (`isFamousPatched` doit rester à `true`, jamais re-patché) et qu'aucune fuite mémoire ne s'installe (observer la mémoire DevTools sur 50 bascules).
- **Fichier volumineux réel** (5 000 à 10 000 lignes avec un marqueur toutes les 100-200 lignes) — taper rapidement en haut du fichier et vérifier que la frappe reste fluide, pour confirmer que la virtualisation Ace limite bien le traitement aux lignes visibles.
- **Toutes les voies d'entrée du pli** : clic sur le chevron, `Ctrl+M`/`Ctrl+Shift+M`, `Alt+0` (Fold others), `Alt+Shift+0` (Unfold all) — sur un fichier `.txt` ET sur un nouveau document, pas seulement JS.
- **Undo/Redo après un pli** : plier une section, faire `Ctrl+Z` plusieurs fois, vérifier que le contenu et l'état du pli restent cohérents (cas classique de désynchronisation Ace).
- **Sauvegarde puis réouverture** d'un `.txt` précédemment plié — le pli n'est pas censé être persisté (attendu), donc vérifier que la réouverture affiche bien les chevrons de nouveau disponibles mais tout déplié, sans erreur.
- **Copier-coller d'un gros bloc contenant plusieurs `﹥`** dans un nouveau document vide — vérifier que `checkAndPatchSearchBox`/`onpaste` et le fold patch cohabitent sans conflit de mode.

Si ces neuf scénarios passent sans exception console et avec un pliage correct, vous pouvez considérer la fonctionnalité comme robuste en production.