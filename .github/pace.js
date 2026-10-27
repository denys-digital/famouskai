/*
 * Famouskai Editor - Local-First PWA IDE
 * Copyright (C) 2026 Denys Poulat (https://github.com/denys-digital)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * pace.js - keeps contributions at the pace announced by a "pace: N days" label.
 *
 * Run once a day by .github/workflows/pace.yml (actions/github-script).
 * The rule is explained to contributors in .github/CONTRIBUTING.md, section
 * "Inactive contributions". In short, for an open issue or pull request that
 * carries "pace: N days" and has a contributor (issue assignee or PR author who
 * is not a maintainer):
 *   - the clock starts at the last action of the contributor or of a maintainer;
 *   - it is paused while a ready (non-draft) PR of the contributor waits for a
 *     maintainer (the contributor acted last on it);
 *   - after ceil(N/2) days: one friendly reminder, and the "help wanted" label;
 *   - N days after the start, if the reminder got no answer: the item is assigned
 *     to the maintainer, who finishes it and credits the contributor as co-author.
 * Any action of the contributor restarts the clock and removes "help wanted".
 *
 * decide() is pure (no network) so tests/unit-pace.html can test it in a browser.
 */
(function (root) {
    'use strict';

    var DAY_MS = 24 * 60 * 60 * 1000;
    var PACE_LABEL_RE = /^pace:\s*(\d+)\s*days?$/i;
    var HELP_LABEL = 'help wanted';
    var MARKER_REMIND = '<!-- pace:reminder -->';
    var MARKER_TAKEOVER = '<!-- pace:takeover -->';
    var RULE_URL = 'https://github.com/denys-digital/famouskai/blob/main/.github/CONTRIBUTING.md#inactive-contributions';
    var DEFAULT_MAINTAINERS = ['denys-digital'];

    function isBot(login) {
        return !login || /\[bot\]$/.test(login);
    }

    /** Returns N from the first "pace: N days" label, or null. */
    function paceDays(labels) {
        for (var i = 0; i < (labels || []).length; i++) {
            var name = typeof labels[i] === 'string' ? labels[i] : labels[i].name;
            var m = PACE_LABEL_RE.exec(name || '');
            if (m && parseInt(m[1], 10) > 0) {
                return parseInt(m[1], 10);
            }
        }
        return null;
    }

    function time(at) {
        return at instanceof Date ? at.getTime() : new Date(at).getTime();
    }

    /**
     * Pure decision for one item.
     *
     * @param {object} item
     *   pace: number of days (N); contributor: login or null;
     *   maintainers: logins; hasHelpLabel: boolean; pr: { draft: boolean } or null
     *   (the contributor's open PR for this item, or the item itself when it is a PR);
     *   events: [{ at, login, where: 'issue'|'pr', marker: 'reminder'|'takeover'|undefined }]
     *   (human actions, plus the bot's own marker comments).
     * @param {Date|string} now
     * @returns {{ action: string, reason: string, days: number, start: number|null, helpLabel: string }}
     *   action: 'none' | 'remind' | 'takeover'; helpLabel: 'add' | 'remove' | 'keep'.
     */
    function decide(item, now) {
        var nowMs = time(now);
        var maintainers = item.maintainers || DEFAULT_MAINTAINERS;
        var out = { action: 'none', reason: '', days: 0, start: null, helpLabel: 'keep' };
        var who = item.contributor;

        if (!item.pace) {
            out.reason = 'no pace label';
            return out;
        }
        if (!who || isBot(who) || maintainers.indexOf(who) !== -1) {
            out.reason = 'no contributor';
            return out;
        }

        var lastContributor = null;
        var lastMaintainer = null;
        var lastContributorPr = null;
        var lastMaintainerPr = null;
        var reminderAt = null;
        var takeoverAt = null;

        (item.events || []).forEach(function (e) {
            var t = time(e.at);
            if (e.marker === 'reminder') { reminderAt = Math.max(reminderAt || 0, t); return; }
            if (e.marker === 'takeover') { takeoverAt = Math.max(takeoverAt || 0, t); return; }
            if (isBot(e.login)) { return; }
            if (e.login === who) {
                lastContributor = Math.max(lastContributor || 0, t);
                if (e.where === 'pr') { lastContributorPr = Math.max(lastContributorPr || 0, t); }
            } else if (maintainers.indexOf(e.login) !== -1) {
                lastMaintainer = Math.max(lastMaintainer || 0, t);
                if (e.where === 'pr') { lastMaintainerPr = Math.max(lastMaintainerPr || 0, t); }
            }
            // Anyone else (a visitor's comment) neither starts nor pauses the clock.
        });

        var start = Math.max(lastContributor || 0, lastMaintainer || 0);
        if (!start) {
            out.reason = 'no activity yet';
            return out;
        }
        out.start = start;
        out.days = Math.floor((nowMs - start) / DAY_MS);

        var reminded = reminderAt !== null && reminderAt >= start;
        var takenOver = takeoverAt !== null && takeoverAt >= start;

        // The contributor (or a maintainer) acted after the last reminder: the
        // item is no longer open to others.
        if (item.hasHelpLabel && !reminded && !takenOver) {
            out.helpLabel = 'remove';
        }

        if (takenOver) {
            out.reason = 'already taken over';
            return out;
        }

        // Ball in the maintainer's court: a ready PR where the contributor acted last.
        if (item.pr && !item.pr.draft && lastContributorPr !== null &&
            (lastMaintainerPr === null || lastContributorPr > lastMaintainerPr)) {
            out.reason = 'waiting for a maintainer';
            return out;
        }

        var half = Math.ceil(item.pace / 2);
        if (!reminded) {
            if (out.days >= half) {
                out.action = 'remind';
                out.reason = out.days + ' days without activity (reminder at ' + half + ')';
                out.helpLabel = item.hasHelpLabel ? 'keep' : 'add';
            } else {
                out.reason = out.days + ' of ' + half + ' days before a reminder';
            }
            return out;
        }

        // Reminded: take over N - ceil(N/2) days after the reminder, so the
        // contributor always gets that time to answer, even after a missed run.
        var sinceReminder = Math.floor((nowMs - reminderAt) / DAY_MS);
        if (sinceReminder >= item.pace - half) {
            out.action = 'takeover';
            out.reason = out.days + ' days without activity, reminder ' + sinceReminder + ' days ago';
            out.helpLabel = item.hasHelpLabel ? 'remove' : 'keep';
        } else {
            out.reason = 'reminded ' + sinceReminder + ' days ago, ' + (item.pace - half) + ' days to answer';
        }
        return out;
    }

    function reminderText(who, kind, pace, days, left) {
        var thing = kind === 'pr' ? 'pull request' : 'issue';
        return MARKER_REMIND + '\n' +
            'Hi @' + who + ', a friendly check-in. This ' + thing + ' has the `pace: ' + pace + ' days` label, ' +
            'and we have not seen any activity from you for ' + days + ' days.\n\n' +
            '- Still on it? Push a commit or leave a comment: the clock restarts.\n' +
            '- No time anymore? No problem at all, just say so.\n\n' +
            'In the meantime it is open to other contributors (`' + HELP_LABEL + '`). Without news within ' + left +
            ' days, the maintainer takes it over and credits you as co-author.\n\n' +
            'Why: [Inactive contributions](' + RULE_URL + ').';
    }

    function takeoverText(who, kind, maintainer) {
        var thing = kind === 'pr' ? 'pull request' : 'issue';
        return MARKER_TAKEOVER + '\n' +
            'Thank you @' + who + ' for your work on this ' + thing + '. As announced, @' + maintainer +
            ' takes it over to keep the project moving. Your work is not lost: it will be finished with you ' +
            'credited as co-author (`Co-authored-by`). You are welcome back anytime, here or on any other issue.\n\n' +
            'Why: [Inactive contributions](' + RULE_URL + ').';
    }

    // ---------------------------------------------------------------- GitHub I/O

    async function timeline(github, owner, repo, number) {
        return github.paginate(github.rest.issues.listEventsForTimeline, {
            owner: owner, repo: repo, issue_number: number, per_page: 100
        });
    }

    function commentEvent(e, where) {
        var body = e.body || '';
        var marker = body.indexOf(MARKER_REMIND) !== -1 ? 'reminder' :
            (body.indexOf(MARKER_TAKEOVER) !== -1 ? 'takeover' : undefined);
        var login = (e.user || e.actor || {}).login;
        if (marker && !isBot(login)) { marker = undefined; } // only the bot's markers count
        return { at: e.created_at, login: login, where: where, marker: marker };
    }

    /** Normalized events of an issue or PR timeline. */
    function toEvents(items, where, prAuthor) {
        var out = [];
        items.forEach(function (e) {
            switch (e.event) {
                case 'commented':
                    out.push(commentEvent(e, where));
                    break;
                case 'committed':
                    // Git commits carry no GitHub login: they belong to the PR author.
                    out.push({ at: (e.committer || e.author || {}).date, login: prAuthor, where: where });
                    break;
                case 'reviewed':
                    out.push({ at: e.submitted_at, login: (e.user || {}).login, where: where });
                    break;
                case 'assigned':
                case 'head_ref_force_pushed':
                case 'ready_for_review':
                case 'review_requested':
                case 'reopened':
                    out.push({ at: e.created_at, login: (e.actor || {}).login, where: where });
                    break;
                default:
                    break;
            }
        });
        return out.filter(function (e) { return e.at; });
    }

    /**
     * Entry point for actions/github-script.
     * @param {{github, context, core, dryRun: boolean, maintainers?: string[], now?: Date}} args
     */
    async function run(args) {
        var github = args.github, context = args.context, core = args.core;
        var owner = context.repo.owner, repo = context.repo.repo;
        var maintainers = (args.maintainers && args.maintainers.length) ? args.maintainers : DEFAULT_MAINTAINERS;
        var now = args.now || new Date();
        var rows = [];

        var open = await github.paginate(github.rest.issues.listForRepo, {
            owner: owner, repo: repo, state: 'open', per_page: 100
        });

        for (var i = 0; i < open.length; i++) {
            var it = open[i];
            var pace = paceDays(it.labels);
            if (!pace) { continue; }
            var isPr = !!it.pull_request;
            var labels = it.labels.map(function (l) { return typeof l === 'string' ? l : l.name; });
            var tl = await timeline(github, owner, repo, it.number);
            var contributor = null, pr = null, events = [];

            if (isPr) {
                var p = (await github.rest.pulls.get({ owner: owner, repo: repo, pull_number: it.number })).data;
                contributor = p.user.login;
                pr = { draft: !!p.draft };
                events = toEvents(tl, 'pr', contributor);
                events.push({ at: p.created_at, login: contributor, where: 'pr' });
            } else {
                var assignees = (it.assignees || []).map(function (a) { return a.login; });
                contributor = assignees.filter(function (l) { return maintainers.indexOf(l) === -1 && !isBot(l); })[0] || null;
                events = toEvents(tl, 'issue', contributor);
                // The contributor's open PR that mentions this issue, if any.
                var refs = tl.filter(function (e) {
                    return e.event === 'cross-referenced' && e.source && e.source.issue &&
                        e.source.issue.pull_request && e.source.issue.state === 'open' &&
                        e.source.issue.user && e.source.issue.user.login === contributor &&
                        e.source.issue.repository && e.source.issue.repository.full_name === owner + '/' + repo;
                });
                if (contributor && refs.length) {
                    var n = refs[refs.length - 1].source.issue.number;
                    var lp = (await github.rest.pulls.get({ owner: owner, repo: repo, pull_number: n })).data;
                    pr = { draft: !!lp.draft, number: n };
                    events = events.concat(toEvents(await timeline(github, owner, repo, n), 'pr', contributor));
                    events.push({ at: lp.created_at, login: contributor, where: 'pr' });
                }
            }

            var d = decide({
                pace: pace, contributor: contributor, maintainers: maintainers,
                hasHelpLabel: labels.indexOf(HELP_LABEL) !== -1, pr: pr, events: events
            }, now);
            rows.push([(isPr ? 'PR ' : 'Issue ') + '#' + it.number, contributor || '-', String(pace), String(d.days), d.action, d.helpLabel, d.reason]);

            if (args.dryRun) { continue; }
            var base = { owner: owner, repo: repo, issue_number: it.number };
            if (d.helpLabel === 'add') {
                await github.rest.issues.addLabels(Object.assign({ labels: [HELP_LABEL] }, base));
            } else if (d.helpLabel === 'remove') {
                await github.rest.issues.removeLabel(Object.assign({ name: HELP_LABEL }, base)).catch(function () {});
            }
            if (d.action === 'remind') {
                await github.rest.issues.createComment(Object.assign({
                    body: reminderText(contributor, isPr ? 'pr' : 'issue', pace, d.days, pace - Math.ceil(pace / 2))
                }, base));
            } else if (d.action === 'takeover') {
                await github.rest.issues.createComment(Object.assign({
                    body: takeoverText(contributor, isPr ? 'pr' : 'issue', maintainers[0])
                }, base));
                await github.rest.issues.addAssignees(Object.assign({ assignees: [maintainers[0]] }, base));
                if (!isPr) {
                    await github.rest.issues.removeAssignees(Object.assign({ assignees: [contributor] }, base));
                }
            }
        }

        await core.summary
            .addHeading('pace' + (args.dryRun ? ' (dry run, nothing written)' : ''), 3)
            .addRaw('Maintainers: ' + maintainers.join(', ') + ' - now: ' + now.toISOString() + '\n\n')
            .addTable([[{ data: 'Item', header: true }, { data: 'Contributor', header: true }, { data: 'Pace', header: true },
                { data: 'Days', header: true }, { data: 'Action', header: true }, { data: 'help wanted', header: true },
                { data: 'Why', header: true }]].concat(rows))
            .write();
        return rows;
    }

    var api = {
        run: run, decide: decide, paceDays: paceDays, toEvents: toEvents,
        reminderText: reminderText, takeoverText: takeoverText,
        MARKER_REMIND: MARKER_REMIND, MARKER_TAKEOVER: MARKER_TAKEOVER
    };
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = run;
        Object.keys(api).forEach(function (k) { module.exports[k] = api[k]; });
    } else {
        root.FamousPace = api;
    }
})(typeof window !== 'undefined' ? window : this);
