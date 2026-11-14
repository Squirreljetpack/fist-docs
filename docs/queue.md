# Queue

The queue separates *choosing* files from *acting* on them. You can mark files in one directory, navigate across panes to pick a destination—or collect paths from Find, Search, and Stash panes—review or edit every target before anything touches disk, and dispatch transfers and long-running [menu actions](./menu-actions) into parallel background workers without blocking navigation.

## The queue overlay

Press `alt-u` (`ShowQueue`) from any pane to open the queue overlay. Press `q`, `esc`, or `alt-u` to close it, and `alt-h` to open the overlay's contextual help in the [pager](./pager) with your active keybindings filled in.

<video controls preload="none" poster="./images/queue.png" src="./images/queue.mp4"></video>

Inside the [App pane](./app), `alt-u` opens the pending-files view instead: a single-column list of files staged to open with a desktop application.

## The overlay layout

The overlay displays a four-column table with a `[kind: All]` filter indicator in the top border:

| Column | Content |
| --- | --- |
| `Kind` | Builtin kind (`copy`, `move`, `symlink`, `none`, `extract`) or menu action key |
| `Source` | Shortened source path, or `[n items]` when a row holds multiple paths |
| `To` | Explicit destination path or directory, or blank when resolved at dispatch |
| `Progress` | File size while pending or finished, or a live `0%`–`100%` gauge while running |

Color in the `Progress` column reflects row state: default while pending, light red when blocked before launch (such as a missing source path or an identity move), a live gauge while running, green after success, and red on failure.

## Row kinds

Each queued row carries a `kind` that decides both what runs and how multiple paths are grouped:

- **Builtin transfer kinds (`copy`, `move`, `symlink`)** enqueue one row per path. Re-queuing the same path under the same pending builtin kind replaces the earlier pending row and moves it to the end of the queue.
- **`none`** enqueues one row per path as a no-op marker that completes immediately when dispatched.
- **`extract`** tracks an in-flight preview extraction of an archive; these rows start immediately and have no pending phase.
- **Custom menu-action kinds** use the action's key from `actions.toml` or `actions/`. Depending on the action's `strategy`, targets stay grouped into a single multi-path row (`Queue`, `Enqueue`) or split into fixed-size chunks (`QueueBatch`).

## Enqueuing rows

Use `ctrl-c` (`Copy`) and `ctrl-x` (`Move`) to queue marked selections—or the cursor row when nothing is marked—under `copy` and `move`. When the prompt is focused on a directory, `Copy` and `Move` queue the pane's working directory instead.

You can also queue `copy`, `move`, `symlink`, and any `Queue` or `QueueBatch` custom action from the [context menu](./menu-actions) (`alt-e`), or bind `Enqueue(<kind>)` in [mm.toml](./mm.toml#binds) to queue directly with a single keystroke.

## Executing and pasting

Two workflows drain the queue: pasting into where you are now, or dispatching rows individually from the overlay.

<video controls preload="none" poster="./images/move.png" src="./images/move.mp4"></video>

- **Paste (`ctrl-v`)** dispatches all pending `copy`, `move`, and `symlink` rows into the active [Nav pane's](./navigation-in-depth) directory (or into an explicit path when bound as `Paste(/abs/path)`).
- **`ExecuteQueue([selector])`** dispatches pending rows matching a selector into the active Nav directory.
- **Overlay dispatch (`enter`)** runs the marked rows—or the highlighted row—inside the queue overlay. Unlike bulk selectors, pressing `enter` in the overlay can also re-run a finished, failed, or previously blocked row as long as it is not currently running.

When a `copy`, `move`, or `symlink` row is dispatched, its `To` cell controls the concrete destination:

- **Blank `To`**: pastes into the Nav pane's working directory under the source's file name. Without a Nav pane (for example in Find or History), rows with a blank `To` stay pending.
- **Trailing separator (`dir/` or `../out/`)**: treated as a directory to paste into, appending the source's file name (relative paths resolve against the Nav directory).
- **Name without trailing separator (`report-v2.pdf`)**: treated as the literal destination path (relative paths resolve against the Nav directory), letting you rename on paste.

Moves and symlinks whose resolved destination equals the source path are marked blocked and skipped. Copies onto themselves still reach the transfer engine so your root strategy (by default `Rename`) duplicates the file instead.

Custom [menu actions](./menu-actions) do not fill an empty `To` from the Nav directory; `To` is passed to the script verbatim as `to`. Actions marked `requires_dest = true` stay pending unless `To` is populated.

## Selectors

`ExecuteQueue([selector])` and `ClearQueue([selector])` accept a selector argument (`all` by default):

| Selector | Matches |
| --- | --- |
| `all` | All pending rows whose destinations are satisfied |
| `builtins` | Pending `copy`, `move`, and `symlink` rows whose destinations are satisfied |
| `first` | The first pending row |
| `last` | The last pending row |
| `<kind>` | Pending rows matching an exact kind (`copy`, `move`, `symlink`, `none`, or an action key) |

`all` and `builtins` silently skip rows that still need a destination (such as builtin transfers dispatched outside a Nav pane with a blank `To`, or `requires_dest` menu actions with a blank `To`). `first`, `last`, and exact `<kind>` selectors refuse to dispatch if any matched row is missing a destination. Reserved selector spellings (`all`, `builtins`, `first`, `last`) are case-insensitive; custom action keys match exact case.

## Editing rows

Inside the queue overlay, you can adjust paths before dispatching a row:

<video controls preload="none" poster="./images/queue-edit.png" src="./images/queue-edit.mp4"></video>

- **`alt-e` or `ctrl-e` (`ShowMenu`)** edits the `Source` cell of a single-path row (verified to exist on disk when confirmed; multi-path rows do not support `Source` editing).
- **`f2` or `ctrl-shift-r` (`Rename`)** edits the `To` cell.

Rows that are currently running—including active `extract` rows—cannot be edited.

## Removing, reordering, and filtering

- **Reorder (`shift-up` / `shift-down`)** swaps the highlighted row up or down in the queue.
- **Cancel or remove (`delete`, `shift-delete`, `backspace`)** cancels an active transfer or extraction, or removes a pending or finished row. Running Lua menu-action rows cannot be canceled mid-script.
- **Bulk clear (`alt-shift-u` / `ClearQueue`)** opens a confirmation prompt and removes pending and blocked rows matching the selector.
- **Filter by kind (`ctrl-z` / `alt-z`)** cycles `[kind: ...]` across `All` and each distinct kind present in the queue. The filter resets to `All` when the overlay closes.

<video controls preload="none" poster="./images/queue-complete.png" src="./images/queue-complete.mp4"></video>

- **Completed rows (`clear_completed_on_close`)**: by default, `clear_completed_on_close` in [config.toml](./configuration#queue) is `false`, so completed rows clear automatically when you close the queue overlay. Set `clear_completed_on_close = true` to keep finished rows across overlay closes so you can inspect results or re-run a row with `enter`.

## Progress and the status line

Active transfers and extractions update the `Progress` column with a live percentage gauge (`0%`–`100%`) computed from transferred bytes. Custom Lua actions on the queue can drive the same gauge by calling `set_progress(0..255)`. Multi-path rows display `-` instead of a byte size while pending or finished, completion and failure statuses report through footer toasts, and background archive extractions show a persistent `Extracting: <name>` status toast until finished.

<video controls preload="none" poster="./images/long-copy.png" src="./images/long-copy.mp4"></video>

## Configuration

Transfer behavior lives under `[queue]` in [config.toml](./configuration#queue): `clear_completed_on_close` controls whether finished rows survive closing the overlay, while `[queue.copy]` and `[queue.move]` each configure `workers`, `preserve_metadata`, `reflink`, `conflict`, `root`, and `buffer_size`.

Visual styling for the overlay (`frame`, `column_spacing`, and row/editing styles) lives under `[queue]` in [mm.toml](./mm.toml#queue-and-app-views).

## Conflict and root strategies

Transfers handle collisions in two stages: first when claiming the top-level destination (`root`), and then when writing entries inside a copied or merged directory (`conflict`).

### Top-level destination (`root`)

Checked once when a `copy` or `move` starts against an existing target:

| `root` | File target exists | Directory target exists |
| --- | --- | --- |
| `"Rename"` *(default)* | Duplicates as `name_1.ext`, `name_2.ext`, … | Duplicates as `dir_1/`, `dir_2/`, … |
| `"Merge"` | Skipped | Keeps directory and merges entries using `conflict` |
| `"Overwrite"` | Replaces file contents | Empties existing directory before copying into it |
| `"Fail"` | Fails immediately | Fails immediately |

> [!WARNING]
> Setting `root = "Overwrite"` clears an existing destination directory's contents before the transfer begins. If the transfer is canceled or fails midway, the original directory contents cannot be recovered.

Same-filesystem moves attempt an atomic rename when possible before falling back to a full copy-and-remove across devices. Copying or moving a directory into itself is always rejected.

### Nested entries (`conflict`)

Governs file collisions inside a directory transfer (including merged directories):

| `conflict` | Behavior on existing file |
| --- | --- |
| `"Overwrite"` *(default)* | Replaces the file (fails if the target is a directory) |
| `"Fail"` | Records a per-file failure and continues transferring remaining files |
| `"Skip"` | Leaves the existing file untouched and continues |
| `"RenameSuffix"` | Writes `name_1.ext`, `name_2.ext`, … alongside it |
| `"Abort"` | Cancels the entire transfer on the first collision |

## Cancellation and shutdown

Pressing `delete` on an active transfer or extraction cancels it immediately; the row stays marked as failed so you can see it did not finish. When you quit `fs`, any active background transfers are given a brief grace window to drain before remaining work is stopped and temporary preview workspaces are cleaned up.

## Extraction rows

Advancing (`right`) into an archive extracts it in the background into a temporary per-process workspace and appends a running `extract` row directly to the queue. Completed preview extractions register with f:st's mount registry so you can re-enter them, and all temporary preview extractions are removed when `fs` exits.

<video controls preload="none" poster="./images/extract.png" src="./images/extract.mp4"></video>

Choosing `extract` from the [context menu](./menu-actions) writes into the directory you specify instead; those user-chosen extractions are yours to keep and are not removed on exit.

## The queue and the clipboard

By default (`interface.copy_files_to_clipboard = true` and `interface.move_files_to_clipboard = false` in [config.toml](./configuration#interface)), `Copy` mirrors copied files onto the system clipboard so you can paste them into external file managers, while `Move` queues without modifying the system clipboard unless enabled.

When you paste into `fs` inside a Nav pane outside a prompt or overlay, bracketed paste triggers `Paste` (`builtins`) unless `interface.always_paste = true`, in which case pasted text goes into the query bar instead.

## History side effects

Two opt-in flags under `[interface]` connect the queue to the [history database](./history-database):

- `bump_transfer_destinations` (`false` by default) records the destinations of completed `copy`, `move`, and `symlink` rows.
- `bump_menu_action_paths` (`false` by default) records the target paths of menu actions when triggered, including actions that only enqueue their targets.
