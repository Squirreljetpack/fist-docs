# Queue

The queue stages file transfers (`copy`, `move`, `symlink`), archive extractions (`extract`), and queued [menu actions](./menu-actions) as inspectable rows and executes them asynchronously in the background.

## The queue and why it exists

Pressing `ctrl-c` or `ctrl-x` on a file does not touch the disk immediately. Instead, f:st adds a **pending** row to the queue so you can gather files from several panes or directories, inspect or edit their destinations in the Queue overlay (`alt-u`), and dispatch them together when you reach the target directory.

Dispatched rows execute asynchronously in the background.

## The queue overlay

Press `alt-u` (`ShowQueue`) from any pane to open the Queue overlay, and press `q` or `esc` to close it:

<video controls preload="none" poster="./images/queue.png" src="./images/queue.mp4"></video>

- Opening the overlay validates every pending row and marks any row whose source path no longer exists on disk in light red.
- Pressing `alt-h` inside the overlay opens the queue help document in the pager with your active keybindings substituted in.
- When you press `alt-u` inside the **App** pane, f:st opens the pending-files variant instead, listing the file paths staged to be passed to the chosen application under a single `To open:` column.

## The overlay layout

In the shared queue view, each row renders four columns:

| Column | Content |
| --- | --- |
| `Kind` | Executor kind (`copy`, `move`, `symlink`, `extract`, or menu-action key) |
| `Source` | Source path with `~` collapsed, or `[n items]` for multi-path rows |
| `To` | Target destination path (empty until edited or dispatched) |
| `Progress` | File size while pending (`-` for multi-path rows), or live progress gauge while running |

Row state is reflected by the color of the `Progress` column:

| State | Appearance |
| --- | --- |
| Pending | Default text style showing human-readable byte size |
| Running | Live progress gauge (`0%`–`100%`) |
| Completed (`CompleteOk`) | Green |
| Invalid pending (`PendingErr`) | Light red (missing source or skipped self-move) |
| Failed (`CompleteErr`) | Red |

The overlay frame title displays the active kind filter (`[kind: All]` by default), which resets to `All` whenever the overlay is reopened. Border, spacing, and row styles are configured under `[queue]` and `[app]` in [mm.toml](./mm.toml#queue-and-app-views).

## Row kinds

Every row has a `kind` string that selects its executor:

| Kind | Executor |
| --- | --- |
| `copy` | Parallel file and directory tree copy (`[queue.copy]`) |
| `move` | Atomic rename on the same filesystem, or parallel copy + source cleanup across filesystems (`[queue.move]`) |
| `symlink` | Symbolic link creation pointing to the source path |
| `extract` | Background archive extraction into a target directory |
| `none` | Built-in no-op kind that completes immediately on dispatch |
| `<action-key>` | Custom [menu action](./menu-actions) executed in Lua with `(paths, to, nav_cwd)` |

## Enqueuing rows

Rows enter the queue from keybindings or from the action menu (`alt-e`):

- **`Copy` (`ctrl-c`), `Move` (`ctrl-x`), and menu `Copy` / `Move` / `Symlink`** — enqueue the selected rows (or the working directory when the cursor is disabled in the prompt) under `copy`, `move`, or `symlink`.
- **`Enqueue(kind)`** — bind action in [mm.toml](./mm.toml) that enqueues the active targets under any built-in kind or custom menu-action key (after verifying the action's conditions).
- **Menu strategies (`Queue`, `QueueBatch(n)`, `Enqueue`)** — `Queue` enqueues all targets as a single multi-path row; `QueueBatch(n)` splits targets into rows of at most `n` paths each; `Enqueue` enqueues a single row and dispatches it immediately.

Built-in kinds (`copy`, `move`, `symlink`, `none`) create **one row per path**. Re-enqueuing a path that already has a pending row of the same built-in kind replaces the existing row and moves it to the end of the queue with a cleared destination. Custom action kinds create **one multi-path row** per invocation without deduplicating against earlier rows.

## Executing and pasting

Rows can be dispatched from inside the Queue overlay or directly from a pane:

<video controls preload="none" poster="./images/move.png" src="./images/move.mp4"></video>

- **`Enter` in the Queue overlay** — dispatches all marked (`tab`) rows in the overlay, or the cursor row when nothing is marked.
- **Destination resolution** — for `copy`, `move`, and `symlink`, the destination resolves at dispatch time against the active Nav pane's working directory:
  - An empty `To` cell or a path ending in `/` places the item **inside** that directory using the source's file name.
  - A path without a trailing `/` is used as the exact target path (renaming the top-level entry).
- **Missing destinations** — if a row requires a destination (`copy`, `move`, `symlink`, or a custom action with `requires_dest = true`) and neither `To` nor a Nav working directory is available, the row remains pending.
- **Re-running completed rows** — pressing `Enter` on a completed or failed row in the overlay dispatches it again using its stored `To` path.
- **`Paste` (`ctrl-v`)** — equivalent to `ExecuteQueue(builtins)`, dispatching all pending `copy`, `move`, and `symlink` rows into the current Nav directory without opening the overlay.

## Selectors

`ExecuteQueue(selector)` and `ClearQueue(selector)` accept a selector argument (defaulting to `all` when omitted):

| Selector | Target rows | Missing-destination behavior |
| --- | --- | --- |
| `all` | Every pending row | Silently skips rows missing a destination |
| `builtins` | Pending `copy`, `move`, and `symlink` rows | Silently skips rows missing a destination |
| `first` | First pending row in the queue | Emits an error toast if its destination is missing |
| `last` | Last pending row in the queue | Emits an error toast if its destination is missing |
| `<kind>` | Pending rows of exact kind `<kind>` | Emits an error toast if any matching row is missing a destination |

`ClearQueue(selector)` (`alt-shift-u` by default for `all`) prompts for confirmation (`Clear the queue?`) before dropping matching pending rows.

## Editing rows

Inside the Queue overlay, you can edit a row's source or destination in place before (or after) running it:

<video controls preload="none" poster="./images/queue-edit.png" src="./images/queue-edit.mp4"></video>

- **Edit source (`alt-e` / `ctrl-e`, `ShowMenu`)** — opens an in-cell editor on the `Source` column for an existing path on disk. Editing the source is refused on running rows and on multi-path (`[n items]`) rows.
- **Edit destination (`f2`, `Rename`)** — opens an in-cell editor on the `To` column for any non-running row (including multi-path and completed rows). Relative paths entered here resolve against the Nav working directory when the row is dispatched.

## Removing, reordering, filtering

- **Cancel or remove (`delete`, `shift-delete`, `backspace`)** — on a running `copy`, `move`, or `extract` row, signals the transfer engine to cancel the task; on any pending, completed, or failed row, removes the row from the queue immediately.
- **Reorder (`shift-up` / `shift-down`)** — moves the cursor row up or down in the queue.
- **Filter by kind (`ctrl-z` / `alt-z`, `Undo` / `Redo`)** — cycles the overlay's `[kind: ...]` filter through `All` and each distinct kind currently present in the queue.

## Clearing completed rows

<video controls preload="none" poster="./images/queue-complete.png" src="./images/queue-complete.mp4"></video>

- **`[queue] clear_completed_on_close`** in [config.toml](./configuration#queue) — when `false` (default), closing the Queue overlay automatically removes all completed and failed rows; set `true` to keep completed rows across overlay closes so you can inspect or re-run them.
- **Bulk clear (`alt-shift-u`, `ClearQueue`)** — removes matching `Pending` and `PendingErr` rows (including rows flagged with missing sources or skipped self-moves) while leaving running and completed rows untouched.

## Progress and the status line

Active transfers compute a byte-weighted completion percentage across each task's tree (falling back to file counts for zero-byte trees).

<video controls preload="none" poster="./images/long-copy.png" src="./images/long-copy.mp4"></video>

While transfers run:

- Each active row in `alt-u` renders a live progress gauge (custom Lua actions can drive the same gauge with `set_progress(0..255)`).
- Completion and failure statuses report through footer toasts.
- Background archive extractions display a persistent `Extracting: <name>` status toast until finished.

## Configuration

`[queue]`, `[queue.copy]`, and `[queue.move]` in [config.toml](./configuration#queue) configure the transfer engine:

```toml
[queue]
clear_completed_on_close = false

[queue.copy]
workers = 8
preserve_metadata = true
reflink = "Auto"
conflict = "Overwrite"
root = "Rename"
buffer_size = 524288
```

`[queue.move]` accepts the exact same `TransferParams` keys (`workers`, `preserve_metadata`, `reflink`, `conflict`, `root`, `buffer_size`).

## Conflict and root strategies

f:st separates top-level destination collisions from collisions inside a merged directory tree:

| `root` (`RootStrategy`) | Effect when the top-level destination path already exists |
| --- | --- |
| `"Rename"` (default) | Claim the first free suffixed sibling (`name_1.ext`, `dir_1/`) |
| `"Overwrite"` | Replace an existing file, or empty and replace an existing directory |
| `"Merge"` | Keep an existing destination directory and resolve inner entries using `conflict` (existing top-level files are skipped) |
| `"Fail"` | Fail the transfer immediately before writing anything |

When `root = "Merge"` descends into an existing directory, `conflict` (`ConflictStrategy`) governs collisions on inner entries:

| `conflict` (`ConflictStrategy`) | Effect on colliding inner entries |
| --- | --- |
| `"Overwrite"` (default) | Replace existing files (fails if a file collides with an existing directory) |
| `"Skip"` | Leave existing entries untouched and continue |
| `"RenameSuffix"` | Write the incoming entry to `stem_1.ext` |
| `"Fail"` | Record a per-file failure and continue copying remaining files |
| `"Abort"` | Cancel the entire transfer on the first collision |

For `move` rows (except when merging into an existing directory), same-filesystem moves complete atomically without copying bytes; cross-filesystem moves copy in parallel and remove the source tree.

## Cancellation and shutdown

- **Cancelling running tasks** — `copy`, `move`, and `extract` rows can be cancelled with `delete` in `alt-u`. `symlink` and custom Lua action rows run to completion and cannot be cancelled.
- **Finalization** — cancelling or removing a running row cleans up partial work before finalizing.
- **Process shutdown** — when you quit `fs`, f:st waits briefly for active transfers to drain or cancel cleanly before removing temporary archive directories and detaching session disk images.

## Extraction rows

Advancing (`right`) into an archive—or choosing `extract` from the menu (`alt-e`)—starts an `extract` row immediately without waiting for manual dispatch:

<video controls preload="none" poster="./images/extract.png" src="./images/extract.mp4"></video>

- Because `extract` rows start immediately into a fresh work directory, their source and destination cells cannot be edited in the overlay.
- If an extraction fails, the row is recorded as `Failed` in the mount registry.
- See [Browsing archives transparently](./navigation-in-depth#browsing-archives-transparently) and [Mount pane](./mount-pane) for how completed extractions are browsed and cleaned up.

## The queue and the clipboard

When `[interface] copy_files_to_clipboard = true` (default) or `move_files_to_clipboard = true` is set in [config.toml](./configuration#interface), pressing `ctrl-c` or `ctrl-x` also places the selected file paths onto your system clipboard so you can paste them into external GUI applications. Inside f:st itself, `ctrl-v` (`Paste`) always drains f:st's internal queue rather than reading the system clipboard.

## History side effects

Two `[interface]` booleans in [config.toml](./configuration#interface) connect queue activity to the [history database](./history-database):

- **`bump_transfer_destinations`** (default `false`) — bumps the destination directory in `record.db` whenever a `copy`, `move`, or `symlink` row finishes with `CompleteOk`.
- **`bump_menu_action_paths`** (default `false`) — bumps target paths in `record.db` whenever a custom menu action is invoked or enqueued.

Next: [Menu actions](./menu-actions) · [Lua](./lua) · [config.toml](./configuration)
