# Famouskai Editor 🦊

*Read this in other languages: [English](README.md)*

Famouskai est un éditeur de code et de texte "Local-First", conçu sous forme de PWA (Progressive Web App). Pensé pour la vélocité, le respect de la vie privée et la résilience, il s'ouvre en une seconde, modifie directement les fichiers de votre disque et s'exécute entièrement dans votre navigateur : ni compte, ni serveur, ni base de données distante, ni étape de compilation.

**Ce que Famouskai sera toujours, et ne sera jamais : [DNA.md](./DNA.md)** (en anglais, version unique).

Voyez-le comme un post-it fiable et modifiable pour vos fichiers, plutôt que comme un IDE lourd. Couplé à **Diffskai**, son outil intégré de comparaison et de fusion, Famouskai garantit que vos modifications locales ne seront jamais écrasées en silence quand un autre programme modifie le même fichier.

**Navigateurs supportés :** navigateurs Chromium de bureau (Chrome, Edge) pour l'édition sur place, les espaces de travail et la détection de conflits. Firefox et Safari permettent d'ouvrir et de télécharger des fichiers, sans écriture sur place car ils n'implémentent pas l'API File System Access.

**Retrouvez le créateur et d'autres projets sur : [github.com/denys-digital](https://github.com/denys-digital)**

![Famouskai avec l'onglet Outline ouvert à gauche, un fichier Markdown au centre et sa prévisualisation à droite](docs/screenshot-outline-preview.png)

## Démarrage rapide

- **L'essayer en ligne :** ouvrez [app.famouskai.com](https://app.famouskai.com) dans Chrome ou Edge, puis utilisez **Open** pour modifier un fichier de votre disque. Pour l'installer comme une application, utilisez l'icône d'installation de la barre d'adresse.
- **Le lancer depuis une copie de ce repository :** téléchargez le ZIP (bouton vert **Code**, puis **Download ZIP**), décompressez-le et double-cliquez sur `index.html`. Rien à installer ni à compiler. Le mode hors-ligne exige que l'application soit servie en HTTPS ou sur `localhost` (voir *Limites connues*).

## Principes

- **Un document par page.** Famouskai n'a volontairement pas de système d'onglets interne : votre navigateur en a déjà un. Besoin d'un second fichier ? Ouvrez une nouvelle fenêtre ou un nouvel onglet (bouton **+**, ou Ctrl+clic sur un fichier de l'Explorer) et gardez autant d'éditeurs côte à côte que vous le souhaitez.
- **Vos fichiers restent sur votre disque.** Ils sont lus et écrits sur place via l'API File System Access. Famouskai ne conserve dans le stockage local du navigateur que vos préférences, vos fichiers récents et vos snippets.
- **Diffskai protège votre travail.** Si un autre programme a modifié le fichier sur le disque depuis que vous l'avez ouvert, Famouskai s'arrête avant d'enregistrer et propose d'ouvrir Diffskai, une vue de comparaison et de fusion côte à côte : c'est vous qui choisissez quoi garder, sans perdre aucune des deux versions. Vous pouvez aussi ouvrir Diffskai à tout moment pour comparer le texte courant avec une autre version (bouton **D**).
- **Facile à personnaliser.** Pas d'écosystème de plugins complexe : les couleurs vivent dans de simples fichiers CSS, les Magic Snippets insèrent vos propres modèles et symboles, et les outils sont de petits fichiers JavaScript que l'on peut lire et écrire en un après-midi (voir [`docs/PLUGIN-ARCHITECTURE.md`](./docs/PLUGIN-ARCHITECTURE.md), en anglais).

## Fonctionnalités Clés

*   **Local et prêt pour le hors-ligne :** lecture et écriture directes sur votre disque ; l'application elle-même est mise en cache par un Service Worker et continue de fonctionner sans réseau une fois chargée.
*   **Coloration syntaxique** pour CSS, CSV, Diff/Patch, HTML, JavaScript/TypeScript, JSON, Markdown, SVG, XML, YAML, `.log` et texte brut.
*   **Prévisualisation Markdown :** aperçu en direct et assaini à côté de l'éditeur, export HTML en un seul fichier et impression en PDF.
*   **Volet latéral à onglets :** Explorer (espaces de travail et fichiers), Outline (structure du document), Tools et Magic Snippets, Windows & Settings.
*   **Famous Marks :** trois marqueurs (`﹥` Famous Arrow, `•` Magic Dot, `°` Flying Bubble) qui transforment n'importe quel commentaire ou ligne en section repliable, listée dans l'Outline. Voir [`docs/FAMOUS-MARK.md`](./docs/FAMOUS-MARK.md) (en anglais).
*   **Outils intégrés :** Beautify, Tidy & Sanitize Text, Sort Lines, Remove Duplicate Lines, Extract & Copy Table, et d'autres.
*   **PWA :** installable sur Windows, macOS, Linux et ChromeOS ; une fois installée, elle peut ouvrir les fichiers directement depuis votre gestionnaire de fichiers.

## Limites connues

- **Chromium de bureau uniquement** pour enregistrer les fichiers sur place, gérer les espaces de travail et détecter les conflits. Dans Firefox et Safari, **Open** charge un fichier choisi et **Save** en télécharge une copie au lieu d'écrire sur place.
- **Le hors-ligne exige HTTP(S).** Un Service Worker ne peut pas fonctionner en `file://` : une copie ouverte en double-cliquant sur `index.html` fonctionne, mais seulement tant que ses fichiers sont accessibles. Servez le dossier en HTTPS ou sur `localhost` pour un usage hors-ligne.
- **Hébergement à la racine d'un domaine.** Le Service Worker et le manifeste utilisent des chemins absolus : un déploiement dans un sous-dossier (comme un site de projet GitHub Pages) casse le mode hors-ligne.
- **Diffskai hors-ligne :** son moteur (Monaco Editor) est mis en cache en arrière-plan après la première visite ; ouvrez Diffskai une fois en ligne pour être sûr qu'il soit disponible hors-ligne. Monaco reste figé en 0.56.0 pour cette version.

## Technologies utilisées (Architecture Zéro-CDN)

Famouskai est conçu pour être résilient. Pour garantir une véritable capacité de fonctionnement hors ligne, **toutes les dépendances sont embarquées localement** (aucun appel CDN). Consultez [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md) pour les détails juridiques.

| Bibliothèque | Version | Rôle | Licence |
| --- | --- | --- | --- |
| **[Ace Editor](https://github.com/ajaxorg/ace)** | 1.44.0 | Moteur principal d'édition de texte | BSD-3-Clause |
| **[Diff2Html](https://github.com/rtfpessoa/diff2html)** | 3.4.56 | Rendu en lecture seule des fichiers .patch/.diff dans le volet de prévisualisation | MIT |
| **[DOMPurify](https://github.com/cure53/DOMPurify)** | 3.4.17 | Assainit la prévisualisation Markdown et l'export HTML | MPL-2.0 OR Apache-2.0 |
| **[idb-keyval](https://github.com/jakearchibald/idb-keyval)** | 6.3.0 | Stockage IndexedDB basé sur des Promises | Apache-2.0 |
| **[js-beautify](https://github.com/beautifier/js-beautify)** | 2.0.3 | Outils de formatage de code et d'indentation | MIT |
| **[Marked](https://github.com/markedjs/marked)** | 18.1.1 | Parseur Markdown ultra-rapide pour la prévisualisation en direct | MIT |
| **[Monaco Editor](https://github.com/microsoft/monaco-editor)** | 0.56.0 | Moteur de comparaison et de fusion (Diffskai) | MIT |
| **[Oswald (Fontsource)](https://github.com/googlefonts/OswaldFont)** | 5.3.0 | Police des titres des thèmes de prévisualisation Markdown (graisses 500 et 700, sous-ensemble latin) | OFL-1.1 |

## Licence & Utilisation (Double Licence)

Famouskai est développé avec passion sous le modèle de la **Double Licence** pour garantir son évolution libre tout en assurant sa pérennité.

**1. Open Source (AGPLv3)**
Vous êtes libre d'utiliser, de modifier et de distribuer Famouskai pour vos projets personnels, académiques ou open source, à la stricte condition de partager vos modifications sous la même licence (AGPLv3). L'ouverture appelle l'ouverture. Texte complet : [`LICENSE`](./LICENSE) (en anglais, texte légal officiel).

**2. Licence Commerciale**
Vous souhaitez intégrer Famouskai au cœur de votre produit propriétaire (SaaS, CMS fermé, outil d'entreprise interne) sans avoir à ouvrir votre propre code source ? C'est tout à fait possible. Voir [`docs/COMMERCIAL-LICENSE.md`](./docs/COMMERCIAL-LICENSE.md) (en anglais) pour le détail, ou contactez-moi directement pour acquérir une licence commerciale abordable et adaptée à vos besoins.

## Sponsoring & Soutien

Si Famouskai vous fait gagner du temps au quotidien, ou si Diffskai a sauvé vos fichiers d'un écrasement fatal, envisagez de soutenir le projet !

Toute forme de sponsoring, ponctuelle ou régulière, m'aide directement à maintenir l'outil, à payer l'hébergement des démos, et à développer de nouvelles fonctionnalités sans jamais dépendre de trackers publicitaires ou d'investisseurs externes.

🡪 **[Soutenir Famouskai via Ko-fi](https://ko-fi.com/denysdigital)**

## Organisation du repository

Ce repository garde une racine centrée **uniquement sur le code**. Tout fichier de gouvernance ou
de process vit dans l'un des deux dossiers suivants, tous deux automatiquement reconnus par
GitHub :

```
famouskai/
├── index.html, sw.js, manifest.json, *.css          ← l'application elle-même (aucune compilation)
├── plugins/                                         ← extensions (ext-*.js) et outils (tool-*.js)
├── vendor/                                          ← copies locales de chaque bibliothèque (aucun CDN)
├── tests/                                           ← plans de test manual-*.md, pages de test unit-*.html, fichiers d'exemple fixtures-*
├── CHANGELOG.md                                     ← historique des versions, lié au cycle de release
├── LICENSE                                          ← texte AGPLv3 complet (doit rester à la racine)
├── THIRD-PARTY-NOTICES.md                           ← licences des bibliothèques (doit rester à la racine)
├── DNA.md                                           ← ce que Famouskai sera toujours, et ne sera jamais
├── README.md / README.fr.md
├── docs/                                            ← tout ce qu'un humain lit, rien de "magique" pour GitHub
│   ├── 00-START-HERE-HOW-TO.md                      ← à lire en premier pour contribuer
│   ├── BRAND-GUIDE.md, brand-*.svg                  ← logo, couleurs et règles visuelles
│   ├── PLUGIN-ARCHITECTURE.md                       ← comment écrire un outil ou une extension
│   ├── FAMOUS-MARK.md, SIDEBAR-ARCHITECTURE.md      ← fonctionnement des Famous Marks et du volet
│   ├── ROADMAP.md                                   ← la suite après 0.1.0
│   ├── CLA.md                                       ← accord de licence des contributeurs
│   ├── COMMERCIAL-LICENSE.md
│   └── MAINTAINER-GUIDE.md
└── .github/                                         ← tout ce que GitHub lit automatiquement
    ├── CODE_OF_CONDUCT.md, CONTRIBUTING.md, FUNDING.yml
    ├── PULL_REQUEST_TEMPLATE.md, SECURITY.md
    ├── ISSUE_TEMPLATE/bug_report.md, config.yml, feature_request.md
    └── workflows/cla.yml
```

**Pourquoi ce découpage ?** `.github/` contient les fichiers que GitHub détecte et exploite
lui-même (templates d'issue/PR, bouton Sponsor, bot de signature CLA) : ils ne fonctionnent que
placés exactement là ou à la racine. `docs/` contient tout ce qui est destiné à un humain, pas à
l'automatisation de GitHub. Cette séparation laisse la racine du repository entièrement dédiée à
ce qui compte quand on parcourt le code : le code lui-même.

Nouveau ici ? Commencez par
[`docs/00-START-HERE-HOW-TO.md`](./docs/00-START-HERE-HOW-TO.md), un guide pas-à-pas (en anglais,
langue de référence de l'écosystème Open Source) qui ne suppose aucune expérience préalable de
GitHub, avec un parcours 100% navigateur pour qui, comme le mainteneur, ne souhaite pas
installer d'interface en ligne de commande (CLI) Git en local.

## Contribuer

Les contributions sont les bienvenues ! Qu'il s'agisse de corriger un bug, d'améliorer la documentation ou de proposer une nouvelle fonctionnalité, n'hésitez pas à ouvrir une *Issue* ou une *Pull Request* (PR).

Avant votre première PR, merci de lire (documents en anglais, langue de référence de l'écosystème
Open Source) :
- [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) : comment se déroulent les contributions ici.
- [`docs/BRAND-GUIDE.md`](./docs/BRAND-GUIDE.md) : les règles visuelles de tout ce qui est poussé sur ce dépôt (en anglais).
- [`.github/CODE_OF_CONDUCT.md`](./.github/CODE_OF_CONDUCT.md) : le comportement attendu au sein de cette communauté.
- [`docs/00-START-HERE-HOW-TO.md`](./docs/00-START-HERE-HOW-TO.md) : un guide complet pas-à-pas (Fork → Pull Request), incluant un parcours 100% navigateur si vous préférez ne rien installer en local.

Votre première Pull Request déclenchera un bot automatique vous demandant de signer le
[Contributor License Agreement](./docs/CLA.md) (CLA), une étape unique, en un clic.
