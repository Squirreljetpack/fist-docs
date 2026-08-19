# Visibility

Visibility decides which files a pane lists: hidden files (dotfiles), ignored files (git-ignored), or everything. It applies to every filesystem-backed pane — [Nav](panes.md#nav), [Find](find-pane.md), [Search](search-pane.md), and [Custom](custom-pane.md) — as per-pane state you set in the app or per command.

## The three modes, plus "all"

| Mode | Meaning |
| --- | --- |
| **default** | Git-aware (below) |
| **hidden** (`-h`, `ctrl-s`) | Show dotfiles |
| **ignore** (`-I`) | Hide git-ignored files |
| **all** (`-a`) | Show everything (`--hidden --no-ignore`) |

- In-app: `ctrl-s` toggles hidden files, `ctrl-d` toggles "only directories". The options overlay (`ctrl-p`) shows the current visibility.
- Per command: `-h` / `-I` / `-a` / `-F` (dirs only) / `-f` (files only), plus `-A` / `--no-all` to clear an "all" visibility. `--reset-visibility` discards any configured default visibility.
- Only-directories (`-F`, `ctrl-d`) and only-files (`-f`) are visibility filters in the same state machine; in the History/Apps panes `ctrl-d` cycles the sort instead.

## The default: git-aware

With no visibility given and no pane default configured, visibility adapts to whether the **current directory** is inside a git repository:

| Context | Hidden files | Git-ignored files |
| --- | --- | --- |
| Inside a git repository | **shown** | **hidden** (respecting `.gitignore`, `.git/info/exclude`, and global gitignore rules) |
| Outside a git repository | **hidden** | **shown** — there is no repository context, so ignore rules are not applied |

This is the code default for [Nav](panes.md#nav), [Find](find-pane.md), and [Search](search-pane.md) panes (their `default_visibility` is unset, see below). Giving only predicates (`-F` / `-f`, or `ctrl-d`) leaves the hidden/ignore part on this default; giving `-h` or `-I` pins that side explicitly.

### What adjusts it

- **Per-pane default**: `[panes.*] default_visibility` pins a starting visibility per pane type — e.g. `[panes.nav] default_visibility = { hidden = true }`. Unset, the git-aware default above applies. See [Configuration](configuration.md).
- **Dot queries**: a query that starts with `.` and continues with alphanumeric characters (like `.git`) automatically enables hidden files — and, when configured, ignored files too. Both behaviors are governed by `[fd] dot_query_show_hidden` (`Auto` / `Always` / `Never`), linked from [Configuration](configuration.md).
- **Directories with only hidden files**: starting a Nav pane in a directory containing only hidden files shows them automatically. This applies when `[fd] dot_query_show_hidden` is not `Never`.
- **Bare pattern searches**: `[fd] default_search_ignore` hides ignored files when a pattern but no path is given (`fs pattern`), as long as `ignore` was not specified explicitly (see [Configuration](configuration.md)).
- **Per-directory exclusions**: `[fd] exclusions` pins per-directory ignore globs (see [Configuration](configuration.md)).
- The Find pane's Search backend (`fd`) receives the resolved visibility as flags; see [The find pane](find-pane.md#visibility) for the CLI flag forms.

## FAQ

**Why does `fs .git` show hidden files?**

Queries starting with `.` enable hidden files automatically (governed by `[fd] dot_query_show_hidden`), so `.git` and friends appear without a `-h`.

**Why are dotfiles shown inside my git repositories by default?**

The git-aware default shows hidden files inside repositories so versioned dotfiles (`.env`, dotfile configs, …) are navigable without extra keystrokes. Outside a repository, hidden files are hidden as usual. `[panes.*] default_visibility` can pin a different default per pane.
