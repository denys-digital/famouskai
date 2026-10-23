# Manual Test Specification: Click on Snippet Help List (`clic-on-snippet-help-list`)

## Overview
This document outlines manual testing scenarios for inserting snippets and triggering the help dialog by clicking anywhere on the full width of snippet entries in the sidebar lexicon panel.

## Sample Test Dataset
```markdown
Sample document content for testing selection replacement and snippet insertion:
Hello World Famouskai Editor
This is line two for testing selection.
```

## Test Matrix

| Test ID | Scenario | Pre-conditions | Action Steps | Expected Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **TS-SNIP-01** | Full-width row click insertion without selection | Active editor with cursor at end of document | 1. Expand sidebar if hidden<br>2. Hover over a snippet entry (e.g. `/code`) in the sidebar lexicon<br>3. Click anywhere on the full width of the row | Snippet content is inserted at current cursor position in Ace editor. Cursor moves to `$1` location if present. Focus returns to editor. |
| **TS-SNIP-02** | Snippet insertion with existing text selection (no `{{selection}}` in snippet) | Active text selection in editor (e.g. "Hello World") | 1. Click on snippet row `/br` or `/cmt` in sidebar lexicon | Selected text is replaced by the snippet. Focus returns to Ace editor. |
| **TS-SNIP-03** | Snippet insertion with existing text selection (`{{selection}}` variable in snippet) | Active text selection in editor (e.g. "my_var") | 1. Click on custom snippet row containing `{{selection}}` | Selected text is preserved inside `{{selection}}` variable slot within inserted snippet. Focus returns to Ace editor. |
| **TS-SNIP-04** | Click on `/help` row | Sidebar open | 1. Click on `/help: Show alert list` entry in sidebar lexicon | Alert dialog pops up listing all available snippets for current file extension. After closing alert, focus returns to Ace editor. |
| **TS-SNIP-05** | Visual styling & hover effect | Sidebar open | 1. Move mouse over snippet row | Row background changes to `--color-bg-hover` and text highlights with `--color-accent` across full width with pointer cursor. |
