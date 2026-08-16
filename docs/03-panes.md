# Panes

A **pane** is a filterable, sortable, previewable list of paths. Every feature in f:ist is a pane — the only difference is where the list comes from.

## Overview

| Pane | Source | Open it | Sortable | Visibility |
| --- | --- | --- | --- | --- |
| [Nav](#nav) | A directory on disk | `fs`, `←` / `→` | ✅ | ✅ |
| [Find](#find--fd) | Recursive search (`fd`) | `ctrl-f`, `fs :fd` | ✅ | ✅ |
| [Search](#search--rg) | Full-text matches (`ripgrep`) | `ctrl-r`, `fs :rg` | ✅ (no size) | ✅ |
| [Files / Folders](#files--folders) | Visit history (SQLite) | `ctrl-g`, `fs :file` | ✅ (db sorts) | — |
| [Apps](#apps) | Installed applications | `fs :open`, **Open With** | ✅ (db sorts) | — |
| [Stash](#stash) | A named stash (db or memory) | `alt-shift-s`, `alt-shift-b` | ✅ | — |
| [Custom](#custom--stream) | A command's output / stdin | `fs :custom` | ✅ | ✅ |

Panes are interchangeable once open: preview, filtering, sorting, selection, file actions, and undo/redo behave identically everywhere.

## Nav

The directory browser — the pane you start in and the one you return to.

- `Enter` accepts: directories `cd` in, files open via the [lessfilter](12-lessfilter.md) **edit** preset.
- `←` / `→` go to parent / advance into the selection.
- Sorted by **mtime** by default; hidden files are shown inside git repositories, ignored files hidden outside them (see [Visibility](05-find-pane.md#visibility)).
- A directory containing only hidden files shows them automatically.

![Nav pane](images/02-nav-pane.png)

## Find (`fd`)

Recursive filename search, backed by `fd`. Results stream in and are immediately filterable, sortable, and previewable.

- `ctrl-f` searches the current directory; `fs pattern` and `fs :fd` from the shell.
- The **last** positional argument is the query (`fs ~/gh tokio` searches for `tokio` under `~/gh`).
- Queries starting with `.` automatically include hidden files.
- `-t` is overloaded: file types (`f`, `d`, `l`, …), extensions (`.rs`), preset categories (`image`, `video`, …), and custom categories. `fs :tool types` prints the full catalog.

See [The find pane (`fd`)](05-find-pane.md).

## Search (`rg`)

Full-text search of file contents, backed by `ripgrep`. Each result is a file path plus a **context column** with the matching lines.

- `ctrl-r` in-app; `fs :rg` (alias `fs :`) from the shell.
- **Query mode** re-runs ripgrep as you type; **filter mode** narrows already-loaded results. `ctrl-r` toggles.
- `%` switches the filter to the context column.
- Advancing on a match sets `HIGHLIGHT_LINE` / `HIGHLIGHT_COLUMN` so editors open at the match.

See [The search pane (`rg`)](06-search-pane.md).

## Files / Folders

Your visited paths, drawn from the SQLite database and ranked by recency × frequency — the same ranking the `z` shell function uses.

- `ctrl-g` opens both; `fs :file` / `fs :dir` from the shell.
- Sort by **name / atime / count / frecency** (`n` / `t` / `c` / `f` in the options overlay).
- `fs :dir --cd query` prints the best match and exits — that's what `z` calls.

See [History & the database](07-history-database.md).

## Apps

Applications installed on your system (`.desktop` files, `.app` bundles). Pick a launch method for a set of files.

- `fs :open` opens the apps pane; `fs :open file.pdf` opens directly.
- `fs :open -w prog files` opens with a specific program.
- In-app: menu → **Open With** (`W`), which preloads the current selection.
- The second column shows the command / alias.

## Stash

Named, cross-session collections of paths. Two families in practice:

- **Scratch** (`alt-s` push / `alt-shift-s` open): the unnamed stash is **transient** by default — in-memory, empty each run. Good for a throwaway working set.
- **Bookmarks** (`alt-b` / `alt-shift-b`): a persistent, db-backed stash. Configure `kind = "prune"` and `insert = "skip"` under `[panes.stashes.bookmark]` for permanent references.

Inside a stash pane, `delete` / `shift-delete` remove entries *from the stash* — the underlying files are untouched.

See [Stash panes](08-stash-panes.md).

## Custom (Stream)

Any list of paths — a command's output or stdin — becomes a first-class pane.

```shell
fd -t md | fs :custom                       # browse stdin
fs :custom fd -t md --max-depth 2           # or run the command
find . -name '*.log' | fs :custom --tail-sep $'\t'
```

- `--transform` runs a Lua function per row to enrich or filter entries.
- `--tail-sep` splits each line into path and tail; `--input-sep` changes the record delimiter.

## Pane transitions

- `Undo` / `Redo` (`ctrl-z` / `ctrl-shift-z`) walk the pane stack.
- Each pane type has its own settings under `[panes.*]` (preview visibility, prompt locking, default sort) — see [Configuration](10-configuration.md).
- New panes apply their pane's default sort when you switch to them (`apply_default_sort`).

## FAQ

**Can I jump between a search and a folder without losing my place?**

Yes — `ctrl-z` / `ctrl-shift-z` walk the whole pane stack, across find, search, history, and nav panes.

**Do all panes support the same actions?**

Yes. Preview, edit, queue, trash, selection, and custom actions work identically in every pane.

**What happens to a stash entry when I delete it in the stash pane?**

The entry is removed from the stash only; the file on disk is untouched.

[← Previous: Core workflows](02-core-workflows.md) · [Next: Navigation, in depth →](04-navigation-in-depth.md)
