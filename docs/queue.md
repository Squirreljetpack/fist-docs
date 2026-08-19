# The queue

The **queue** is f:ist's task overview: a list of pending operations — file transfers, or custom tasks defined through the [menu](menu-actions.md) — that you review, reorder, filter, and execute when ready.

![Queue overlay](images/03-queue.png)

## Overview

- `Copy` / `Cut` **enqueue** rather than act: nothing moves until you say so.
- Menu actions with a `Queue` or `QueueBatch` strategy enqueue the same way — a queued row executes the action's Lua with `(paths, dst, nav_cwd)`.
- The overlay (`ctrl-u`) shows every row: **kind · source · destination · progress**.
- `Paste` executes the built-in transfer rows; `ExecuteQueue` executes any subset by kind.

## The two-step flow

1. `ctrl-x` (cut) or `ctrl-c` (copy) on a file or selection → a queue row (kind `cut` / `copy`), plus a clipboard write.
2. Navigate to the destination directory, then `ctrl-v` (**Paste**) — every pending transfer row executes there.

Destinations are resolved **at paste time**, against the directory you're in — not at copy time. That's what makes "copy in one place, paste in another" natural. A single-path row resolves its destination through the `fs.rename_policy` (by default: name collisions get a `_n` suffix).

## Kinds

Every row has a **kind**, which decides how it executes:

| Kind | Executes |
| --- | --- |
| `copy` / `cut` | Built-in transfer: files and directories moved or copied with live progress |
| `symlink` | Built-in symlink creation |
| `none` | Explicit no-op |
| *any other name* | The [menu action](menu-actions.md) with that key: its Lua runs with `(paths, dst, nav_cwd)` |

Custom kinds are how you define repeatable tasks — see [Queue strategies in menu actions](menu-actions.md#strategies). A row whose kind has no matching action fails with an error toast.

## The overlay

`ctrl-u` opens the queue. Rows that are already executing are skipped by selection actions; done/error rows can be retried.

| Keys | Row action |
| --- | --- |
| `↑` / `↓` | Move |
| `space` | Select rows |
| `shift-↑` / `shift-↓` | Reorder (swap adjacent rows) |
| `ctrl-e` | Edit the source (single-path rows) |
| `ctrl-shift-r` | Edit the destination |
| `Enter` | Execute the selected rows, or the current row |
| `delete` | Remove the row |
| `ctrl-z` / `ctrl-shift-z` | Cycle the transient `[kind: x]` filter |

The `[kind: x]` border filter narrows the overlay to one kind (`copy`, `cut`, a custom action key, …); it resets to `All` each time the overlay opens. In the Apps pane, `ctrl-u` shows the open-with pending list instead (rows there are files to open, not operations).

## Progress and status

Rows move through **pending → started → done/error**. Transfers show bytes copied as they run; custom kinds animate 0–255 via `set_progress()` from their Lua (the queue resets it to 0 when the call starts and forces 255 at the end, so the display is sane even if the script never calls it). Pending rows whose sources no longer exist are flagged before execution.

## Selectors

| Action | Executes |
| --- | --- |
| `Paste` | All pending built-in transfers (`copy` + `cut` + `symlink`) |
| `ExecuteQueue` | Everything pending |
| `ExecuteQueue(builtins)` | Built-in transfers only |
| `ExecuteQueue(kind)` | One kind — e.g. a custom action key |
| `ExecuteQueue(first)` / `ExecuteQueue(last)` | The first / last pending row |
| `ClearQueue` | Clear (with confirmation) instead of executing |

`All` and `Builtins` silently skip rows whose destination is missing; exact-kind and `First`/`Last` selectors report an error instead. A custom `requires_dest` kind refuses to run with an empty destination.

Note: the queue lives in memory for the run. For mission-critical transfers, prefer a custom menu action that performs the transfer itself (see [Menu actions](menu-actions.md)).

## FAQ

**Can I move files with the queue?**

Yes — cut + paste. The kind shows as `cut`; reordering rows changes execution order.

**How do I queue custom work?**

Define a menu action with a `Queue` or `QueueBatch` strategy — its Lua runs once per row at execution time, receiving `(paths, dst, nav_cwd)`. See [Menu actions](menu-actions.md).

**What happens if a paste fails halfway through?**

The row moves to the error state with the failure logged; other rows continue. You can retry the row from the overlay.
