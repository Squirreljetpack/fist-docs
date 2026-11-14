# Panes

Every view in f:st is a pane: a self-contained listing with its own working directory, query, sort order, visibility filters, and preview state.

## What a pane is

Only one pane is drawn at a time. Opening a new pane or changing directories pushes a snapshot onto the navigation stack so you can step backward and forward with `ctrl-z` and `alt-z` (`Undo` and `Redo`). Overlays sit above the active pane without altering the navigation stack.

When you leave a pane and later return to it via `Undo`/`Redo` or a toggle action, the pane restores its saved query, cursor index, sort order, and marked selections.

## Pane kinds and overlays

| Pane | Purpose | Default entry |
| --- | --- | --- |
| Nav | Single-level listing of a directory | `fs`, `left` / `right` |
| Find | Recursive file and directory search | `fs ::`, `ctrl-f` |
| Search | Full-text content search with context | `fs :`, `ctrl-r` |
| Stream / Custom | Rows streamed from a command or stdin | `fs :custom` |
| History (`Folders`, `Files`) | Frecency-ranked directories and files | `fs :dir`, `fs :file`, `ctrl-g` |
| Stash | Named transient or persistent path collections | `alt-s`, `alt-b` |
| App | Installed desktop applications and launchers | `fs :open -w`, Menu `open with` |
| Mount | Process-wide mount and archive registry | See [Mount pane](./mount-pane) |

The Mount pane is the only pane whose rows represent mount entries rather than filesystem paths; see [Mount pane](./mount-pane).

Five overlays can open over any pane:

| Overlay | Purpose | Default trigger |
| --- | --- | --- |
| Options | Visibility filters, sort order, and pane-specific toggles | `alt-p` |
| Queue | Pending and running transfers and queued menu actions | `alt-u` |
| Menu | Contextual builtin and Lua menu actions | `alt-e`, `ctrl-e` |
| Confirm | Yes/no confirmation before destructive operations | Automatic on `Delete`, `ClearQueue` |
| Prompt | Single-line text input for `New`, `Rename`, `Set alias`, and queue edits | `ctrl-n`, `f2` |

Every overlay owns the keyboard while open and pages its own help document from `assets/help/` when you press `alt-h`.

## Pane transitions

Two pairs of bind actions move between panes:

- **`Parent` (`left`) and `Advance` (`right`)** move up to the parent directory or into the highlighted directory, switching from Find, Search, History, or Stash into a Nav pane at that target directory.
- **`Undo` (`ctrl-z`) and `Redo` (`alt-z`)** walk backward and forward through the pane stack, restoring the previous pane kind, working directory, query, cursor position, and sort order.

Toggling into History (`ctrl-g`), Stash (`alt-s` / `alt-b`), or the App pane remembers the originating pane so pressing the same toggle again (or `Undo`) backs out to where you were. Switching into a new directory resets the query and non-retained filetype filters unless restored through `Undo`.

## Nav

The Nav pane lists the immediate children of a single directory without recursing into subdirectories, keeping directory traversal instant regardless of tree depth. Type into the prompt to fuzzy-filter the current directory's rows; visibility follows `[panes.nav]` `default_visibility` and skips any globs listed in `ignore_patterns` unless `all` visibility (`-u`) is active.

<video controls preload="none" poster="./images/nav-pane.png" src="./images/nav-pane.mp4"></video>

## Find

Powered by `fd`, the Find pane (`ctrl-f` or `fs ::`) streams files and directories recursively under one or more search roots. You can narrow results by file type, extension, or category with `-t`, exclude noisy trees globally via `[panes.find] exclusions`, and reveal hidden entries automatically by starting your query with `.`. See [Find pane](./find-pane).

<video controls preload="none" poster="./images/find.png" src="./images/find.mp4"></video>

## Search

Powered by `ripgrep`, the Search pane (`ctrl-r` or `fs :`) searches file contents and displays the file path in column 1 and the matched lines in column 2. Pressing `ctrl-r` inside the pane toggles between **query mode** (which re-runs the full-text search as you type) and **filter mode** (which fuzzy-filters the current matches by file path, or by match content after `%`). See [Search pane](./search-pane).

<video controls preload="none" poster="./images/search.png" src="./images/search.mp4"></video>

## Stream and custom panes

The Custom pane (`fs :custom [CMD]...`) populates rows from arbitrary command output or standard input, splitting each record on `--input-sep` and `--tail-sep`. Passing `--transform` runs a Lua function over each row to rewrite paths, customize the displayed label, or populate the tail column, and `--no-store` drops the in-memory item cache for unbounded streams. See [Custom pane](./custom-pane).

<video controls preload="none" poster="./images/custom.png" src="./images/custom.mp4"></video>

## History panes

The Folders and Files panes (`ctrl-g`, `fs :dir`, `fs :file`) list directories and files from f:st's SQLite visit database, ordered by frecency. Pressing `ctrl-g` opens the Folders pane first and toggles between Folders and Files in place on subsequent presses; pressing `ctrl-z` backs out to the pane you came from. See [History database](./history-database).

<video controls preload="none" poster="./images/history.png" src="./images/history.mp4"></video>

## Stash panes

Stash panes (`alt-s` for the default transient stash, `alt-b` for the persistent `bookmark` stash) hold named collections of paths gathered across directories. Each stash configures its storage mode (`transient`, `filter`, or `prune`) and duplicate strategy (`replace`, `skip`, or `duplicate`) under `[panes.stashes.<name>]`. Pushing selected rows, opening the stash, and backing out all share a single smart `Stash(name)` bind action. See [Stash panes](./stash-panes).

<video controls preload="none" poster="./images/stash.png" src="./images/stash.mp4"></video>

## App pane and pending files

The App pane (`fs :open` or the menu's `open with` item) lists installed desktop applications with their resolved icons in the preview pane. When you invoke `open with` on selected files—or press `Copy`/`Move` inside the App pane—those paths are held in the pending-files list (`alt-u` inside the App pane) and passed as arguments to whichever application you accept.

<video controls preload="none" poster="./images/apps.png" src="./images/apps.mp4"></video>

## Results table

Every pane renders a two-column results table:

- **Column 1** shows the path, styled with Nerd Font icons, category colors, `~` home collapsing, and cwd-relative stripping as configured under `[styles.path]` in [config.toml](./configuration).
- **Column 2 (the tail)** shows contextual data when present: match lines in Search, user aliases in History and Stash, active sort values (size, mtime, atime) during hard sorts, or Lua `--transform` badges in Custom panes.

Narrow layouts or multi-line search contexts stack column 2 below column 1; a hidden location column tracks the canonical path and match coordinates (`HIGHLIGHT_LINE`, `HIGHLIGHT_COLUMN`) for actions and previews.

## Previews

The preview pane runs the `preview` preset from [lessfilter](./lessfilter) against the cursor row. You can define multiple geometries under `[[preview.layout]]` in [mm.toml](./mm.toml) and select a per-pane starting layout with `preview_layout_index` and `show_preview` in [config.toml](./configuration).

<video controls preload="none" poster="./images/previews.png" src="./images/previews.mp4"></video>

At runtime, `?` cycles layouts (including hidden), `alt-/` switches the preview to the `display` preset, `alt-i` switches to the `info` preset, `shift-up` / `shift-down` scrolls the preview, and `ctrl-l` / `alt-l` opens the full output in the interactive [pager](./pager).

## Options overlay

Pressing `alt-p` opens the Options overlay, which exposes up to three columns:

- **Filter** — toggles for hidden files, hidden-only, git-ignored files, `Dirs`, `Files`, and `all` (`-u`).
- **Sort** — sort order selection (`name`, `mtime`, `atime`, `size`).
- **Pane** — pane-specific controls, shown only in panes that define them (such as `one line` and `regex` in the Search pane). Database-backed panes (History, App, Stash) omit the Filter column entirely.

<video controls preload="none" poster="./images/options.png" src="./images/options.mp4"></video>

See [`assets/help/options.txt`](https://github.com/Squirreljetpack/fist/blob/main/assets/help/options.txt) for the overlay keys.

## Queue overlay

Pressing `alt-u` opens the Queue overlay, listing pending, running, completed, and failed rows by kind (`copy`, `move`, `symlink`, `extract`, or a custom menu-action key). From the overlay you can edit source and destination paths in place, reorder rows, filter by kind, cancel active transfers, or press `enter` to dispatch rows into the current directory. See [Queue](./queue) and [`assets/help/queue.txt`](https://github.com/Squirreljetpack/fist/tree/main/assets/help/queue.txt).

<video controls preload="none" poster="./images/queue.png" src="./images/queue.mp4"></video>

## Menu, confirm, and prompt overlays

- **Menu (`alt-e`)** filters and runs builtin file operations (`Copy`, `Move`, `Symlink`, `Rename`, `Trash`, `Delete`, `New`, `Open with`, `Set alias`) alongside custom [menu actions](./menu-actions) whose conditions match the active target; see [`assets/help/menu.txt`](https://github.com/Squirreljetpack/fist/blob/main/assets/help/menu.txt).
- **Confirm** intercepts destructive actions (`Delete` and `ClearQueue`) with a keyboard-navigable button row (`y`/`n`, `left`/`right`, `enter`, `esc`).
- **Prompt** opens a single-line input box for creating files or directories (`ctrl-n`, `ctrl-shift-n`), renaming (`f2`), or assigning a database alias.

## Status line, footer, and toasts

The `[status]` line in `mm.toml` connects the query bar to the results table, displaying match counts, active filter badges, and background progress gauges. Below the table, the footer renders transient toasts at five severity levels (`normal`, `info`, `success`, `warning`, `error`). Informational toasts (such as empty-directory notices) clear as soon as you move the cursor, while action results, warnings, and errors persist until replaced or dismissed.

## Styles

Path rendering (`collapse_home`, `relative`, icons, and colors), per-category file styles (`[styles.path.file_styles]`), horizontal separator weight (`[styles.matchmaker]`), and toast colors (`[styles.toast]`) are configured in [config.toml](./configuration#styles). Passing `--style` on the command line overrides icon and color visibility for a single invocation.

## Mouse

Mouse support is enabled by default in matchmaker (`[tui] mouse = true` in `mm.toml`). Clicking selects rows or buttons, dragging selects ranges, and scrolling over the results list or preview pane triggers `MouseScrollUp` / `MouseScrollDown` and `PreviewScrollUp` / `PreviewScrollDown` with a configurable scroll debounce.

Next: [Navigation in depth](./navigation-in-depth) · [Visibility](./visibility) · [Sorting](./sorting)
