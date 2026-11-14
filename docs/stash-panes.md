# Stash panes

A stash is a named collection of paths that persists across directory changes, giving you a scratch space or bookmark list where you can gather files from different trees and act on them together.

## Actions

Every stash is addressed by name (with `""` for the unnamed default stash). Three bind actions operate on stashes:

- **`PushStash(name)`** — adds the current selection (or the current working directory when the cursor is disabled in the prompt) to the named stash without leaving the current pane.
- **`OpenStash(name)`** — switches to the named stash's pane.
- **`Stash(name)`** — a smart action that pushes selected rows if any are marked (or if the prompt is locked on the working directory), backs out via `Undo` if you are already inside that stash, and opens the stash pane otherwise.

<video controls preload="none" poster="./images/stash.png" src="./images/stash.mp4"></video>

By default in [mm.toml](./mm.toml), `alt-s` is bound to `Stash` (the unnamed default stash `""`, configured as transient) and `alt-b` is bound to `Stash(bookmark)` (the `bookmark` stash, configured as database-backed).

## Transient vs database-backed

Each stash configures its storage mode (`kind`) and duplicate handling (`insert`) under `[panes.stashes.<name>]` in [config.toml](./configuration#stashes):

| `kind` | Backing store | Missing paths on disk |
| --- | --- | --- |
| `"transient"` (default) | Process memory | Cleared when `fs` exits |
| `"filter"` | SQLite `stashes` table | Hidden when the pane populates, kept in the database |
| `"prune"` | SQLite `stashes` table | Deleted from the database when the pane populates |

Database-backed rows live in the `stashes` table (`id`, `name`, `stash`, `tail`, `add_time`) inside `record.db`, ordered newest-first (`add_time DESC`).

When you push a path that is already present in the target stash, `insert` decides what happens:

| `insert` | Duplicate behavior |
| --- | --- |
| `"replace"` (default) | Remove the existing row and insert a fresh row at the top with a new timestamp |
| `"skip"` | Keep the existing row in place and ignore the duplicate push |
| `"duplicate"` | Insert an additional row for the same path |

## Pushing and acting on rows

Inside a stash pane, rows behave like any other file listing:

- **Previews and navigation** — preview files (`?`, `alt-i`), press `right` (`Advance`) to enter a stashed directory or edit a stashed file, or press `left` (`Parent`) to jump to a stashed item's parent directory in the Nav pane.
- **Aliases in the tail column** — choosing `set alias` from the menu (`alt-e`) edits the row's `tail` annotation in column 2 (persisted in the `stashes` table for database-backed stashes or in memory for transient stashes), which you can filter with `%`.
- **Transfers and menu actions** — mark rows with `tab` (or `ctrl-a` to select all) and enqueue copies/moves (`ctrl-c` / `ctrl-x`) or run any [menu action](./menu-actions) (`alt-e`).

## Removing entries

Whether `Delete` (`shift-delete`) and `Trash` (`delete`) remove the stash record or the underlying file on disk is controlled by `[interface] remove_db_record_action` in [config.toml](./configuration#interface):

- When set to `"Trash"` (the shipped config default), pressing `delete` removes the selected rows from the stash without touching the files on disk, while `shift-delete` permanently deletes the real files (after confirmation).
- When set to `"Delete"`, `shift-delete` drops the stash rows and `delete` moves the real files to the system trash.
- When set to `"None"`, both actions operate on the real files on disk; missing paths are then hidden or removed on the next reload when `kind` is `"filter"` or `"prune"`.

## Per-stash settings

Configure any number of named stashes under `[panes.stashes.<name>]` in [config.toml](./configuration#stashes):

```toml
[panes.stashes.""]
prompt = "stash> "
kind = "transient"
insert = "replace"

[panes.stashes.bookmark]
prompt = "★> "
prompt_style = { fg = "Yellow" }
kind = "filter"
insert = "skip"
```

Every stash table also accepts the common pane fields (`prompt`, `prompt_style`, `show_preview`, `lock_prompt`, `preview_layout_index`). If `prompt` is omitted from a configured stash table, the prompt defaults to `<name>>`. Referencing a stash name in `Stash(name)` that has no table in `config.toml` creates a transient, replace-mode stash on the fly with a white prompt.

## Cross-directory workflows

Stashes are f:st's primary tool for operations that span multiple directories:

<video controls preload="none" poster="./images/compress.png" src="./images/compress.mp4"></video>

- **Multi-directory archiving, diffing, or conversion** — navigate across several directories, mark files with `tab` and press `alt-s` in each directory, then press `alt-s` with nothing selected to open the stash, press `ctrl-a` to select all stashed rows, and run `compress: zip` or `diff` from `alt-e`.
- **Staging transfers** — collect paths into a stash while browsing, open the stash to review or prune the list, cut or copy the subset you want (`ctrl-x` / `ctrl-c`), back out to your destination directory, and press `ctrl-v` to dispatch the transfer.

Next: [History database](./history-database) · [Menu actions](./menu-actions) · [Queue](./queue)
