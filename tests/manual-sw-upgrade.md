# Manual Test Specification: Service Worker Upgrade

This test checks that an upgrade of Famouskai never mixes old and new files, works offline, and tells the user about the update without reloading the page (no lost work).

Chrome only: no command line, no install. It works on a Chromebook without Linux. About 15 minutes.

---

## Before you start: 3 rules

1. **Reload = `Ctrl+R` only.** Never `Ctrl+Shift+R` (or "Empty cache and hard reload"): a hard reload bypasses the Service Worker, so nothing is tested.
2. **DevTools** = `Ctrl+Shift+I`. Everything happens in its **Application** tab, section **Service workers** (left column).
3. In **Service workers**, the 3 checkboxes at the top (**Offline**, **Update on reload**, **Bypass for network**) are UNCHECKED, except when a step says otherwise.

Chrome in French:

| English | French |
| --- | --- |
| Application | Appli |
| Offline | Hors connexion |
| Update on reload | Mettre à jour lors de l'actualisation |
| Bypass for network | Contourner pour le réseau |
| Update (blue link at the right of the address line) | Mettre à jour |
| Cache storage | Espace de stockage du cache |
| Network | Réseau |

**Check that a page uses the Service Worker**: DevTools > **Network**, `Ctrl+R`: the column **Size** shows `(ServiceWorker)` on almost every line.

---

## What the maintainer prepares (in the PR to test)

The PR to test gives:

- **Address A**: a test deployment that serves the OLD version (for example a test branch made from `main` before the change, deployed to a preview address).
- **Switch 1**: a helper PR that puts the NEW version on address A.
- **Switch 2**: a helper PR that puts a NEWER version on address A (only the version name changes, for example it ends with `-test2`).
- The 3 version names: OLD, NEW, NEWER.

Why two switches: the update message is code of the NEW version. A page still running the OLD version cannot show it, so the message is tested on the second upgrade (NEW to NEWER).

At a release, the same steps can be run on the production address: steps 1-5 before the release, the release itself replaces switch 1.

After the tests, the test branches are deleted.

---

## Steps

Use one normal Chrome window (not incognito), one Famouskai tab on address A, DevTools open. Write the result of each step (for example "1-17 OK" or "9 KO").

### SW-UPG-01: upgrade while working (OLD to NEW)

1. Open address A. Wait 10 seconds, then `Ctrl+R`.
2. Open the sidebar. The version button at the bottom shows the OLD name.
3. DevTools > **Application** > **Service workers**: the 3 checkboxes at the top are unchecked.
4. Type `test 01` in the editor (do not save).
5. In another tab, merge **switch 1** (**Merge pull request**, then **Confirm merge**). Wait 2 minutes.
6. Back in the Famouskai tab: **Service workers** > click **Update**.
7. Wait 10 seconds. Expected: the page did NOT reload, `test 01` is still in the editor.
8. **Application** > **Cache storage**: expected ONE cache only, with the NEW name. (The version button still shows the OLD name: normal, the page keeps its code until a reload. No update message here: normal, see "Why two switches".)

### SW-UPG-02: only the new version after a reload

9. `Ctrl+R` three times.
10. Expected: the version button shows the NEW name, the page looks normal (no "Copy all" bar without style at the bottom), and **Network** shows `(ServiceWorker)` in the **Size** column.

### SW-UPG-03: offline

11. **Service workers**: check **Offline**.
12. `Ctrl+R`. Expected: Famouskai opens normally (no dinosaur page), version button = NEW name.
13. Uncheck **Offline**.

### SW-UPG-04: update message (NEW to NEWER)

14. `Ctrl+R`, then type `test 04` in the editor (do not save).
15. In another tab, merge **switch 2**. Wait 2 minutes.
16. Back in the Famouskai tab: **Service workers** > click **Update**.
17. Expected within 10 seconds: a blue message at the bottom right, `Famouskai was updated. Reload the page when your work is saved.`, with an underlined **OK**. It stays until you click **OK**. The page did NOT reload, `test 04` is still in the editor.
18. Click **OK** (the message closes), then `Ctrl+R`. Expected: the version button shows the NEWER name (ending with `-test2`).

If step 8 still shows the OLD cache name: the new version was not published yet. Wait 2 more minutes and redo step 6.
