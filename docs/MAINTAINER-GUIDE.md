# MAINTAINER-GUIDE

1. Maintainer principles
   - Every change goes through an Issue and a Pull Request.
   - main is never edited directly.
   - Squash merge only.
   - One PR = one logical change.

2. Branches
   - main: protected integration branch.
   - cla-signatures: bot-managed registry branch; never merge into main.
   - feat/*, fix/*, docs/*: short-lived contributor branches.

3. Pull Request lifecycle
   - Open/claim Issue.
   - Create branch from main.
   - Commit focused change.
   - Open PR.
   - Check CLA status.
   - Review and squash merge.
   - Confirm linked Issue closes.
   - Delete feature/fix/docs branch after merge.

4. CLA Assistant
   - Purpose of docs/CLA.md.
   - Exact signature phrase.
   - cla-signatures branch purpose.
   - signatures/version1/cla.json is created and maintained by the bot.
   - Never manually create, edit, merge, or delete cla.json.
   - How to diagnose a failed CLA check.

5. GitHub configuration
   - main ruleset.
   - cla-signatures ruleset.
   - Private Vulnerability Reporting.
   - Discussions.
   - Issue and PR templates.
   - Squash merge settings.
   - Automatic deletion of merged short-lived branches.

6. Dependency vendoring
   - vendor/ is the local source of third-party runtime assets.
   - _VENDOR-INFO.md and _vendor-update.log must be updated with every vendor refresh.
   - Vendor update PR first; runtime-path / Service Worker switch in a separate PR.
   - Update THIRD-PARTY-NOTICES.md and README.md with exact versions and licenses.

7. Release process
   - Update CHANGELOG.md.
   - Choose vMAJOR.MINOR.PATCH.
   - Create GitHub Release and tag.
   - Test PWA offline behavior and Diffskai before release.

8. Funding and community
   - Ko-fi link and FUNDING.yml.
   - Do not promise Membership benefits unless you can maintain them.
   - Keep Ko-fi public counters disabled until there is meaningful social proof.

9. Known GitHub rendering caveats
   - CONTRIBUTING.md is rendered both from .github/ and from the repository overview.
   - Use canonical absolute URLs in CONTRIBUTING.md for repository-internal links.
   - Pull Request templates only auto-fill after they are present on main.
