# Famouskai Editor 🦊

*Read this in other languages: [English](README.md)*

Famouskai est un éditeur de code et de texte "Local-First", conçu sous forme de PWA (Progressive Web App). Pensé pour la vélocité, le respect de la vie privée et la résilience, il s'exécute entièrement dans votre navigateur, sans aucun serveur ni base de données distante.

Couplé à **Diffskai**, son outil natif de résolution de conflits, Famouskai garantit qu'aucune de vos modifications ne sera jamais écrasée accidentellement par un autre programme.

**Retrouvez le créateur et d'autres projets sur : [github.com/denys-digital](https://github.com/denys-digital)**

## Fonctionnalités Clés

*   **100% Local & Hors-ligne :** Lecture et écriture directes sur votre disque dur via l'API File System Access.
*   **Diffskai Intégré :** Détection intelligente des modifications externes et outil de fusion visuel (Merge/Diff) natif.
*   **Zéro Base de Données :** Vos fichiers restent chez vous.
*   **Architecture PWA :** Installation native sur Windows, macOS, Linux et ChromeOS.
*   **Mode "Split-View" & Markdown :** Prévisualisation dynamique intégrée pour les rédacteurs (en cours de développement).

## Technologies utilisées (Architecture Zéro-CDN)

Famouskai est conçu pour être résilient. Pour garantir une véritable capacité de fonctionnement hors ligne, **toutes les dépendances sont embarquées localement** (aucun appel CDN). Consultez [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md) pour les détails juridiques.

| Bibliothèque | Rôle |
| :--- | :--- |
| **[Ace Editor](https://github.com/ajaxorg/ace)** | Moteur principal d'édition de texte (Coloration syntaxique) |
| **[Monaco Editor](https://github.com/microsoft/monaco-editor)** | Utilisé exclusivement dans Diffskai pour la résolution de diffs |
| **[Marked](https://github.com/markedjs/marked)** | Parseur Markdown ultra-rapide pour la prévisualisation en direct |
| **[idb-keyval](https://github.com/jakearchibald/idb-keyval)** | Stockage IndexedDB basé sur des Promises |
| **[js-beautify](https://github.com/beautifier/js-beautify)** | Outils de formatage de code et d'indentation |

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

Ce repository garde une racine centrée **uniquement sur le code** — tout fichier de gouvernance ou
de process vit dans l'un des deux dossiers suivants, tous deux automatiquement reconnus par
GitHub :

```
famouskai/
├── index.html, et tous les autres fichiers source   ← le projet lui-même
├── CHANGELOG.md                                     ← historique des versions, lié au cycle de release
├── LICENSE                                          ← texte AGPLv3 complet (doit rester à la racine)
├── README.md / README.fr.md
├── docs/                                            ← tout ce qu'un humain lit, rien de "magique" pour GitHub
│   ├── 00-START-HERE-HOW-TO.md                      ← à lire en premier pour contribuer
│   ├── CLA.md                                       ← Contributor License Agreement
│   ├── COMMERCIAL-LICENSE.md
│   └── WORKFLOW.fr.md                               ← notes de cadrage du mainteneur (en français)
└── .github/                                         ← tout ce que GitHub lit automatiquement
    ├── CODE_OF_CONDUCT.md, CONTRIBUTING.md, FUNDING.yml
    ├── PULL_REQUEST_TEMPLATE.md, SECURITY.md
    ├── ISSUE_TEMPLATE/
    └── workflows/
```

**Pourquoi ce découpage ?** `.github/` contient les fichiers que GitHub détecte et exploite
lui-même (templates d'issue/PR, bouton Sponsor, bot de signature CLA) — ils ne fonctionnent que
placés exactement là ou à la racine. `docs/` contient tout ce qui est destiné à un humain, pas à
l'automatisation de GitHub. Cette séparation laisse la racine du repository entièrement dédiée à
ce qui compte quand on parcourt le code : le code lui-même.

Nouveau ici ? Commencez par
[`docs/00-START-HERE-HOW-TO.md`](./docs/00-START-HERE-HOW-TO.md) — un guide pas-à-pas (en anglais,
langue de référence de l'écosystème Open Source) qui ne suppose aucune expérience préalable de
GitHub, avec un parcours 100% navigateur pour qui — comme le mainteneur — ne souhaite pas
installer d'interface en ligne de commande (CLI) Git en local.

## Contribuer

Les contributions sont les bienvenues ! Qu'il s'agisse de corriger un bug, d'améliorer la documentation ou de proposer une nouvelle fonctionnalité, n'hésitez pas à ouvrir une *Issue* ou une *Pull Request* (PR).

Avant votre première PR, merci de lire (documents en anglais, langue de référence de l'écosystème
Open Source) :
- [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) — comment se déroulent les contributions ici.
- [`.github/CODE_OF_CONDUCT.md`](./.github/CODE_OF_CONDUCT.md) — le comportement attendu au sein de cette communauté.
- [`docs/00-START-HERE-HOW-TO.md`](./docs/00-START-HERE-HOW-TO.md) — un guide complet pas-à-pas (Fork → Pull Request), incluant un parcours 100% navigateur si vous préférez ne rien installer en local.

Votre première Pull Request déclenchera un bot automatique vous demandant de signer le
[Contributor License Agreement](./docs/CLA.md) (CLA) — une étape unique, en un clic.
