# Plan de Tests Manuels - Purge Automatique LocalStorage (Position du Curseur)

## 1. Description du Test
Validation du bon fonctionnement de la routine de nettoyage (LRU - Least Recently Used) de la position du curseur enregistrée dans `LocalStorage` (`cursor_*`).

---

## 2. Matrice de Test

| Test ID | Scénario | Pré-conditions | Étapes d'exécution | Résultat Attendu |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CURSOR-01** | Sauvegarde de la position et présence de `updatedAt` | Application ouverte dans le navigateur | 1. Ouvrir un fichier `test1.txt`.<br>2. Déplacer le curseur à la ligne 5, colonne 10.<br>3. Inspecter `LocalStorage` dans la console DevTools (`localStorage.getItem('cursor_test1.txt')`). | La clé `cursor_test1.txt` contient un JSON au format `{"row": 4, "column": 10, "updatedAt": <timestamp>}`. |
| **TC-CURSOR-02** | Rétrocompatibilité avec les anciennes entrées sans `updatedAt` | Une ancienne entrée `cursor_old.txt` est simulée dans DevTools : `localStorage.setItem('cursor_old.txt', JSON.stringify({row: 2, column: 3}))` | 1. Executer `window.cleanupCursorLocalStorage(1)`. | L'ancienne entrée `cursor_old.txt` (considérée comme `updatedAt = 0`) est éliminée en priorité par rapport aux nouvelles entrées horodatées. |
| **TC-CURSOR-03** | Eviction LRU au-delà du seuil de 50 entrées | LocalStorage vide ou contenant peu d'entrées | 1. Exécuter dans la console DevTools un script créant 55 entrées `cursor_doc1.txt` à `cursor_doc55.txt` avec des timestamps croissants.<br>2. Exécuter `window.cleanupCursorLocalStorage(50)`. | Le nombre total d'entrées `cursor_*` dans `LocalStorage` est ramené exactement à 50. Les 5 entrées les plus anciennes ont été supprimées. |
| **TC-CURSOR-04** | Purge au démarrage (`DOMContentLoaded`) | Plus de 50 entrées `cursor_*` présentes dans LocalStorage au chargement | 1. Créer 52 entrées `cursor_*` via console.<br>2. Recharger la page (F5 / Ctrl+R). | Lors du chargement, la routine au démarrage s'exécute et ramène automatiquement le nombre d'entrées `cursor_*` à 50. |

---

## 3. Données de Test & Script Console Rapide

Vous pouvez copier/coller ce snippet dans la console DevTools (F12) pour valider instantanément la routine LRU :

```javascript
// Script de test rapide des 50 entrées LRU
for (let i = 1; i <= 55; i++) {
    localStorage.setItem(`cursor_file_${i}.txt`, JSON.stringify({
        row: i,
        column: 0,
        updatedAt: Date.now() - (1000 * (60 - i)) // Timestamps croissants (file_1 est le plus ancien)
    }));
}

console.log("Nombre d'entrées avant nettoyage :", Object.keys(localStorage).filter(k => k.startsWith('cursor_')).length);
window.cleanupCursorLocalStorage(50);
console.log("Nombre d'entrées après nettoyage (attendu : 50) :", Object.keys(localStorage).filter(k => k.startsWith('cursor_')).length);
console.log("L'entrée la plus ancienne (file_1.txt) existe-t-elle encore ? (attendu : false) :", localStorage.getItem('cursor_file_1.txt') !== null);
```
