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
| App | Installed desktop applications and launchers | `fs :open`, Menu `open with` |
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

Every overlay owns the keyboard while open and pages its own help document when you press `alt-h`.

## Pane transitions

Two pairs of bind actions move between panes:

- **`Parent` (`left`) and `Advance` (`right`)** move up to the parent directory or into the highlighted directory, switching from Find, Search, History, or Stash into a Nav pane at that target directory.
- **`Undo` (`ctrl-z`) and `Redo` (`alt-z`)** walk backward and forward through the pane stack, restoring the previous pane kind, working directory, query, cursor position, and sort order.

Toggling into History (`ctrl-g`), Stash (`alt-s` / `alt-b`), or the App pane remembers the originating pane so pressing the same toggle again (or `Undo`) backs out to where you were. Switching into a new directory resets the query and non-retained filetype filters unless restored through `Undo`.

## Built-in panes

- **Nav** lists the immediate children of a single directory without recursing into subdirectories, keeping directory traversal instant regardless of tree depth. Type into the prompt to fuzzy-filter the current directory's rows; visibility follows `[panes.nav]` `default_visibility` and skips any globs listed in `ignore_patterns` unless `all` visibility (`-u`) is active.
- **Find** (`ctrl-f` or `fs ::`) streams files and directories recursively under one or more search roots. Narrow results by file type, extension, or category with `-t`, exclude noisy trees globally via `[panes.find] exclusions`, and reveal hidden entries automatically by starting your query with `.`. See [Find pane](./find-pane).
- **Search** (`ctrl-r` or `fs :`) searches file contents and displays the file path in column 1 and the matched lines in column 2. Pressing `ctrl-r` inside the pane toggles between **query mode** (live full-text search) and **filter mode** (fuzzy-filtering matches by path, or by match content after `%`). See [Search pane](./search-pane).
- **Stream and custom** (`fs :custom [CMD]...`) populates rows from arbitrary command output or standard input, splitting records on `--input-sep` and `--tail-sep`, with optional Lua `--transform` rewriting and `--no-store` streaming. See [Custom pane](./custom-pane).
- **History** (`ctrl-g`, `fs :dir`, `fs :file`) lists directories and files from f:st's SQLite visit database, ordered by frecency. Pressing `ctrl-g` opens Folders first and toggles between Folders and Files in place; pressing `ctrl-z` backs out. See [History database](./history-database).
- **Stash** (`alt-s` for the transient default stash, `alt-b` for the persistent `bookmark` stash) holds named collections of paths gathered across directories via the smart `Stash(name)` bind action. See [Stash panes](./stash-panes).
- **App pane** (`fs :open` or Menu → `open with`) lists installed desktop applications with icon previews and stages pending files (`alt-u` inside the App pane) to pass to whichever application you launch. See [App pane](./app).
- **Mount** exposes f:st's process-wide mount and archive extraction registry. See [Mount pane](./mount-pane).

## Results table

Every pane renders a two-column results table:

- **Column 1** shows the path, styled with Nerd Font icons, category colors, `~` home collapsing, and cwd-relative stripping as configured under `[styles.path]` in [config.toml](./configuration).
- **Column 2 (the tail)** shows contextual data when present: match lines in Search, user aliases in History and Stash, active sort values (size, mtime, atime) during hard sorts, or Lua `--transform` badges in Custom panes.

Narrow layouts or multi-line search contexts stack column 2 below column 1; a hidden location column tracks the canonical path and match coordinates (`HIGHLIGHT_LINE`, `HIGHLIGHT_COLUMN`) for actions and previews.

## Previews

The preview pane runs the `preview` preset from [lessfilter](./lessfilter) against the cursor row. You can define multiple geometries under `[[preview.layout]]` in [mm.toml](./mm.toml) and select a per-pane starting layout with `preview_layout_index` and `show_preview` in [config.toml](./configuration).

<video controls preload="none" poster="./images/previews.png" src="./images/previews.mp4"></video>

At runtime, `?` cycles layouts (including hidden), `alt-/` switches the preview to the `display` preset, `alt-i` switches to the `info` preset, `shift-up` / `shift-down` scrolls the preview, and `ctrl-l` / `alt-l` opens the full output in the interactive [pager](./pager).

## Overlays

- **Options (`alt-p`)** — toggles [visibility filters](./visibility#the-options-overlay), [sort orders](./sorting#choosing-a-sort), and pane-specific options (omitting the Filter column in database-backed panes).
- **Queue (`alt-u`)** — inspects, edits, reorders, filters, cancels, or dispatches pending and running transfers and queued actions; see [Queue](./queue).
- **Menu (`alt-e`), Confirm, and Prompt (`ctrl-n`, `ctrl-shift-n`, `f2`)** — runs builtin file operations and custom [menu actions](./menu-actions), confirms destructive deletes, and prompts for new filenames or renames. See [mm.toml](./mm.toml#overlays) for overlay styling.

<video controls preload="none" poster="./images/options.png" src="./images/options.mp4"></video>

<video controls preload="none" poster="./images/queue.png" src="./images/queue.mp4"></video>

<video controls preload="none" poster="./images/fileops.png" src="./images/fileops.mp4"></video>

Next: [Navigation in depth](./navigation-in-depth) · [Visibility](./visibility) · [Sorting](./sorting)
