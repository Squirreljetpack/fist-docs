# Panes

Every view in f:st is a pane: a self-contained listing with its own working directory, query, sort order, visibility filters, and preview state.

## What a pane is

Only one pane is drawn at a time. Opening a new pane or changing directories pushes a snapshot onto the navigation stack so you can step backward and forward with `ctrl-z` and `alt-z` (`Undo` and `Redo`). Overlays sit above the active pane without altering the navigation stack.

When you leave a pane and later return to it via `Undo`/`Redo` or a toggle action, the pane restores its saved query, cursor index, sort order, and marked selections.

## Pane kinds and overlays

| Pane | Purpose | Default entry |
| --- | --- | --- |
| [Nav](./navigation-in-depth) | Single-level listing of a directory | `fs`, `left` / `right` |
| [Find](./find-pane) | Recursive file and directory search | `fs ::`, `ctrl-f` |
| [Search](./search-pane) | Full-text content search with context | `fs :`, `ctrl-r` |
| [Stream / Custom](./custom-pane) | Rows streamed from a command or stdin | `fs :custom` |
| [History](./history-database) (`Folders`, `Files`) | Frecency-ranked directories and files | `fs :dir`, `fs :file`, `ctrl-g` |
| [Stash](./stash-panes) | Named transient or persistent path collections | `alt-s`, `alt-b` |
| [App](./app) | Installed desktop applications and launchers | `fs :open`, Menu `open with` |

Three overlays can open over any pane:

| Overlay | Purpose | Default trigger |
| --- | --- | --- |
| [Options](./visibility#the-options-overlay) | Visibility filters, sort order, and pane-specific toggles | `alt-p` |
| [Queue](./queue) | Pending and running transfers and queued menu actions | `alt-u` |
| [Menu](./menu-actions) | Contextual builtin and Lua menu actions | `alt-e`, `ctrl-e` |

Every overlay owns the keyboard while open and pages its own help document when you press `alt-h`.

## Pane transitions

Two pairs of bind actions move between panes:

- **`Parent` (`left`) and `Advance` (`right`)** move up to the parent directory or into the highlighted directory, switching from Find, Search, History, or Stash into a Nav pane at that target directory.
- **`Undo` (`ctrl-z`) and `Redo` (`alt-z`)** walk backward and forward through the pane stack, restoring the previous pane kind, working directory, query, cursor position, and sort order.

Toggling into History (`ctrl-g`), Stash (`alt-s` / `alt-b`), or the App pane remembers the originating pane so pressing the same toggle again (or `Undo`) backs out to where you were. Switching into a new directory resets the query and non-retained filetype filters unless restored through `Undo`.

## Results table

Every pane renders a two-column results table:

- **Column 1** shows the path, styled with Nerd Font icons, category colors, `~` home collapsing, and cwd-relative stripping as configured under `[styles.path]` in [config.toml](./configuration).
- **Column 2 (the tail)** shows contextual data when present: match lines in Search, user aliases in History and Stash, active sort values (size, mtime, atime) during hard sorts, or Lua `--transform` badges in Custom panes.

Narrow layouts or multi-line search contexts stack column 2 below column 1; a hidden location column tracks the canonical path and match coordinates (`HIGHLIGHT_LINE`, `HIGHLIGHT_COLUMN`) for actions and previews.

## Previews

The preview pane runs the `preview` preset from [lessfilter](./lessfilter) against the cursor row. You can define multiple geometries under `[[preview.layout]]` in [mm.toml](./mm.toml) and select a per-pane starting layout with `preview_layout_index` and `show_preview` in [config.toml](./configuration).

<video controls preload="none" poster="./images/previews.png" src="./images/previews.mp4"></video>

At runtime, `?` cycles layouts (including hidden), `alt-/` switches the preview to the `display` preset, `alt-i` switches to the `info` preset, `shift-up` / `shift-down` scrolls the preview, and `ctrl-l` / `alt-l` opens the full output in the interactive [pager](./pager).

## Help

Press `alt-h` in any pane to open the keybind reference in the interactive [pager](./pager); scroll to the bottom for pane-specific help. All keybindings shown in the help menu can be customized in [mm.toml](./mm.toml#binds).

<video controls preload="none" poster="./images/help.png" src="./images/help.mp4"></video>
