# Visibility

Visibility decides which files a pane lists: hidden files (dotfiles), ignored files (git-ignored), or everything. It applies to every filesystem-backed pane — [Nav](panes.md#nav), [Find](find-pane.md), [Search](search-pane.md), and [Custom](custom-pane.md) — as per-pane state you set in the app or per command.

## The modes

| Mode | Keys | Meaning |
| --- | --- | --- |
| **default** | — | Git-aware (below) |
| **hidden** | `-h` / `-H` | Show / hide dotfiles |
| **ignore** | `-i` / `-I` | Show / hide git-ignored files |
| **unrestricted** | `-u` / `-U` | Show everything (`--hidden --no-ignore`) / clear it |

- In-app: `ctrl-s` toggles hidden files — from a state with hidden files shown it resets to the plain default (hidden files hidden, ignored files shown), otherwise it shows hidden files. `ctrl-d` cycles the all → only-files → only-directories filter. The options overlay (`ctrl-p` / `alt-p`) shows the current visibility.
- Per command: `-h` / `-H`, `-i` / `-I`, `-u` / `-U`, and `-F` (dirs only) / `-f` (files only).
- Only-directories (`-F`, `ctrl-d`) and only-files (`-f`) are visibility filters in the same state machine; in the History/Apps/Stash panes `ctrl-d` cycles the sort instead.

## The default: git-aware

With no visibility given and no pane default configured, visibility adapts to whether the **current directory** is inside a git repository:

| Context | Hidden files | Git-ignored files |
| --- | --- | --- |
| Inside a git repository | **shown** | **hidden** (respecting `.gitignore`, `.git/info/exclude`, and global gitignore rules) |
| Outside a git repository | **hidden** | **shown** — there is no repository context, so ignore rules are not applied |

This is the code default for [Nav](panes.md#nav), [Find](find-pane.md), and [Search](search-pane.md) panes (their `default_visibility` is unset, see below). Predicates (`-F` / `-f`) and `-u` / `-U` leave the hidden/ignore part on this default; passing any `-h` / `-H` / `-i` / `-I` flag replaces the whole git-aware baseline with a plain default, so the axis you did *not* name falls back to "hidden files hidden, ignored files shown" — inside a repo, `fs -h` shows hidden files *and* git-ignored files, and `fs -I` hides hidden files too.

### What adjusts it

- **Per-pane default**: `[panes.*] default_visibility` pins a starting visibility per pane type — e.g. `[panes.nav] default_visibility = { hidden = true }`. Unset, the git-aware default above applies. See [Configuration](configuration.md).
- **Dot queries**: a query that starts with `.` and continues with alphanumeric characters (like `.git`) automatically shows hidden files. Governed by `[smart_visibility] dot_query_show_hidden` (bool, default `true`) and `dot_query_show_ignored` (bool, default `false`), linked from [Configuration](configuration.md).
- **Directories with only hidden files**: starting a Nav pane in a directory containing only hidden files shows them automatically. Governed by `[smart_visibility] empty_folders` (default `true`), and skipped when `-h` / `-H` was passed.
- **Bare pattern searches**: `[fd] default_search_ignore` hides ignored files when a pattern but no path is given (`fs pattern`), as long as `ignore` was not specified explicitly (see [Configuration](configuration.md)).
- **Per-directory exclusions**: `[fd] exclusions` pins per-directory ignore globs (see [Configuration](configuration.md)).
- The Find pane's Search backend (`fd`) receives the resolved visibility as flags; see [The find pane](find-pane.md#visibility) for the CLI flag forms.

## FAQ

**Why does `fs .git` show hidden files?**

Queries starting with `.` enable hidden files automatically (governed by `[smart_visibility] dot_query_show_hidden`), so `.git` and friends appear without a `-h`.

**Why are dotfiles shown inside my git repositories by default?**

The git-aware default shows hidden files inside repositories so versioned dotfiles (`.env`, dotfile configs, …) are navigable without extra keystrokes. Outside a repository, hidden files are hidden as usual. `[panes.*] default_visibility` can pin a different default per pane.
