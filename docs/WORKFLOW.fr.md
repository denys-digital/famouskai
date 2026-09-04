# Cadrage du workflow Famouskai

Ce document explique le **pourquoi** derrière l'organisation GitHub de Famouskai. Pour le
**comment**, concret et pas-à-pas, voir [`00-START-HERE-HOW-TO.md`](./00-START-HERE-HOW-TO.md) (en anglais,
langue de référence de l'écosystème Open Source).

L'objectif de ce cadrage : rester efficace pour un solo dev + contributeurs occasionnels, sans
tomber dans la sur-ingénierie (GitFlow complet, intégration continue (CI) à 15 étapes, process de
validation à 3 niveaux) qui tue l'élan d'un projet naissant.

---

## 0. Carte des fichiers du repository

Avant de committer quoi que ce soit : voici où chaque fichier généré doit atterrir, et à quoi il
sert. La racine du repository ne garde que 3 fichiers de gouvernance (`LICENSE`, `CHANGELOG.md`,
`README*.md`) — tout le reste de la racine, c'est ton code, sans mélange alphabétique avec de la
documentation.

```
famouskai/
├── index.html
├── (autres fichiers de code)
├── LICENSE
├── CHANGELOG.md
├── README.md
├── README.fr.md
├── docs/
│   ├── 00-START-HERE-HOW-TO.md
│   ├── CLA.md
│   ├── COMMERCIAL-LICENSE.md
│   └── WORKFLOW.fr.md
└── .github/
    ├── CODE_OF_CONDUCT.md
    ├── CONTRIBUTING.md
    ├── SECURITY.md
    ├── FUNDING.yml
    ├── PULL_REQUEST_TEMPLATE.md
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   ├── feature_request.md
    │   └── config.yml
    └── workflows/
        └── cla.yml
```

| Emplacement | Fichier | À quoi ça sert (pour un newbie) |
|---|---|---|
| `/` | `LICENSE` | Le texte légal complet de l'AGPLv3. **Obligatoire à la racine, aucune exception** — c'est le seul fichier de gouvernance que GitHub refuse de détecter ailleurs (ni `.github/`, ni `docs/`). Sans lui à cet endroit précis, ta licence n'est qu'une déclaration d'intention, pas un contrat opposable. |
| `/` | `CHANGELOG.md` | Historique des changements par version. Convention quasi-universelle (pas un standard GitHub officiel) à garder à la racine, car très liée au cycle de release du code — c'est le réflexe qu'ont beaucoup d'outils et de développeurs en arrivant sur un repo. |
| `.github/` | `CODE_OF_CONDUCT.md` | **Standard reconnu par GitHub.** Racine, `.github/` ou `docs/` fonctionnent tous les trois pour la détection automatique — ici dans `.github/` pour désencombrer la racine. GitHub l'affiche dans l'onglet "Community". |
| `.github/` | `CONTRIBUTING.md` | **Standard reconnu par GitHub**, même souplesse d'emplacement que `CODE_OF_CONDUCT.md`. GitHub l'affiche automatiquement dans un bandeau quand quelqu'un ouvre une issue ou une PR. |
| `.github/` | `SECURITY.md` | **Standard reconnu par GitHub**, même souplesse d'emplacement. Fait apparaître le bouton "Report a vulnerability" dans l'onglet Security du repo. |
| `.github/` | `FUNDING.yml` | **Emplacement obligatoire, `.github/` uniquement.** GitHub ne détecte le bouton "Sponsor" que si ce fichier est exactement à `.github/FUNDING.yml` — nulle part ailleurs, pas même `docs/`. |
| `.github/` | `PULL_REQUEST_TEMPLATE.md` | **Emplacement flexible** (racine, `.github/`, ou `docs/`) mais fixé ici dans `.github/` par cohérence avec les autres fichiers "magiques". GitHub pré-remplit automatiquement toute nouvelle PR avec ce contenu. |
| `.github/ISSUE_TEMPLATE/` | `bug_report.md`, `feature_request.md`, `config.yml` | **Emplacement obligatoire, ce dossier exact uniquement.** C'est ce que GitHub scanne pour proposer le sélecteur "New Issue" avec plusieurs modèles au choix. |
| `.github/workflows/` | `cla.yml` | **Emplacement obligatoire pour GitHub Actions.** Tout fichier `.yml` dans ce dossier est automatiquement détecté et exécuté selon ses déclencheurs (ici : à chaque PR). C'est ce qui fait tourner le bot de signature CLA. |
| `docs/` | `00-START-HERE-HOW-TO.md` | Guide pas-à-pas pour contributeurs (ex-`HOW-TO.md`, renommé pour apparaître en tête du dossier `docs/` par tri alphabétique — c'est le point d'entrée). Pas un standard GitHub, emplacement libre. |
| `docs/` | `CLA.md` | Le texte du Contributor License Agreement (CLA) — l'accord que chaque contributeur signe avant sa première Pull Request (PR). Pas un standard GitHub, mais son chemin est référencé en dur dans `.github/workflows/cla.yml` (`path-to-document`) — si tu le déplaces à nouveau, pense à mettre ce chemin à jour. |
| `docs/` | `COMMERCIAL-LICENSE.md` | Explique en clair pourquoi/comment obtenir une licence commerciale. Pas un standard GitHub, fichier de référence linké depuis le README et `CONTRIBUTING.md`. |
| `docs/` | `WORKFLOW.fr.md` | Ce fichier-ci (renommé avec le suffixe `.fr` pour signaler sans ambiguïté qu'il est en français, cohérent avec ton `README.fr.md` existant). Usage interne/mainteneur, pas un standard GitHub. |

**Point d'attention si tu codes directement "dans Famouskai" (cf. `docs/00-START-HERE-HOW-TO.md`,
Path A/B) :** aucun de ces fichiers ne touche à ton code — ce sont uniquement des fichiers de
gouvernance/process qui vivent à côté, dans `docs/` et `.github/`. Tu peux les créer un par un via
l'éditeur web GitHub (`Add file → Create new file`, en tapant le chemin complet comme
`.github/workflows/cla.yml` dans le nom de fichier — GitHub crée les dossiers automatiquement), ou
tout déposer d'un coup via un premier "PR de mise en place" si tu es plus à l'aise avec
github.dev.

---

## 1. Branches

**Règle :** `main` est protégée. Personne — y compris toi — ne push directement dessus. Tout
passe par une Pull Request (PR), même tes propres changements.

**Pourquoi une règle qui te contraint toi-même ?**
- Ça force une trace écrite de chaque changement (utile dans 6 mois pour comprendre pourquoi tu
  as fait tel choix).
- Ça permet à la CI de valider *avant* que le code touche `main`, jamais après.
- Ça donne l'exemple aux contributeurs : si le mainteneur ne respecte pas la règle, personne ne la
  respectera.

**Ce qu'on n'utilise PAS :** de branches `develop`, `release/*`, `hotfix/*` séparées (GitFlow
classique). Pour un projet à cette échelle, c'est de la complexité qui n'apporte rien — une seule
branche de référence (`main`) + des branches de courte durée (`feat/…`, `fix/…`) suffit.

## 2. Labels

**Règle :** un jeu minimal de 5 labels, pas plus au démarrage :

| Label | Usage |
|---|---|
| `bug` | Comportement cassé ou inattendu |
| `enhancement` | Nouvelle fonctionnalité ou amélioration |
| `good first issue` | Scope volontairement réduit, pour un nouveau contributeur |
| `help wanted` | Tu ne comptes pas le faire toi-même, contribution bienvenue |
| `question` | Demande de clarification, pas encore une action à faire |

**Pourquoi c'est le levier n°1 pour attirer des contributeurs :** un `good first issue` bien
scopé (1-2h de travail, instructions claires, pas de dépendance cachée) est ce qui convertit un
visiteur GitHub en premier contributeur. À l'inverse, une liste de 40 labels au lancement noie
l'information utile.

**Extension future :** si le projet grossit, ajoute des labels *après* en avoir ressenti le
besoin (ex: `priority:high`, `area:diffskai`) — jamais en anticipation.

## 3. Tags & Releases

**Règle :** [Semantic Versioning](https://semver.org/lang/fr/) strict — `vMAJOR.MINOR.PATCH`.

- `MAJOR` : rupture de compatibilité (format de fichier projet, interface de programmation (API)
  de plugin si un jour il y en a une).
- `MINOR` : nouvelle fonctionnalité, rétro-compatible.
- `PATCH` : correction de bug, rétro-compatible.

**Pourquoi c'est important même seul :** ça donne un vocabulaire commun avec tes futurs
utilisateurs et contributeurs ("j'utilise la 0.3.1, le bug est dans la 0.4.0") sans ambiguïté.
Un changelog + des tags cohérents sont aussi ce qui rassure un utilisateur professionnel qui
envisage une licence commerciale — ça montre un projet mature, pas un dépôt qui bouge dans tous
les sens.

**Process concret :** voir la note en bas de [`CHANGELOG.md`](../CHANGELOG.md) — GitHub génère les
notes de release automatiquement à partir des PR mergées, mais le CHANGELOG reste la source de
vérité lisible par un humain.

## 4. CI minimale

**Règle :** un seul workflow GitHub Actions qui **lint + build** à chaque Pull Request. Rien de
plus au démarrage.

**Ce qu'on évite consciemment :**
- Matrices de test sur 5 systèmes d'exploitation (OS) × 3 navigateurs dès le jour 1 (aucune valeur
  tant qu'il n'y a pas de base d'utilisateurs qui le justifie).
- Coverage obligatoire à 90 % (bloque des contributions utiles pour un gain marginal, sur un
  projet qui n'a même pas encore de suite de tests significative).
- Déploiement automatique complexe (la Progressive Web App (PWA) est statique, un déploiement
  simple suffit).

**Ce qu'on ajoute quand le besoin apparaît, pas avant :** tests unitaires sur Diffskai (c'est la
pièce la plus critique — un bug de merge qui perd des données coûte cher en confiance), puis
élargir progressivement.

## 5. Project Board

**Règle :** un Kanban GitHub Projects simple à 3 colonnes — `Backlog` / `In Progress` / `Done`.

**Pourquoi pas Jira ou un outil externe :** ça vit dans GitHub, zéro friction de contexte-switch,
zéro compte supplémentaire à créer pour un contributeur occasionnel. La contrepartie : ne pas
sur-processer (pas de story points, pas de sprints formels) — c'est un outil de visibilité, pas
un système de gestion de projet d'entreprise.

**Usage réaliste pour toi :** avant tout, c'est un outil pour *toi*, pour ne pas perdre le fil
entre deux sessions de dev. Les contributeurs externes s'en servent surtout pour voir "qu'est-ce
qui est déjà pris" avant de proposer une PR.

---

## Principe transversal

Chacune de ces 5 règles a été choisie parce qu'elle a un coût de mise en place quasi nul et un
bénéfice immédiat. Dès qu'une pratique candidate (nouveau label, nouvelle étape de CI, nouveau
process de review) ne remplit pas ce critère, la réponse par défaut est **non**, jusqu'à preuve du
contraire par un besoin concret rencontré sur le projet.
