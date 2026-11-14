# Navigation in depth

Navigation in f:st combines directory traversal (`Parent` and `Advance`), a reversible pane stack (`Undo` and `Redo`), frecency history recording, and prompt locking.

## Parent and Advance

`Parent` (`left`) and `Advance` (`right`) are the primary traversal bind actions:

- **In the Nav pane**, `Parent` walks up to the parent directory of the current working directory. **In multi-directory panes** (Find, Search, History, Stash, Custom), `Parent` switches into the Nav pane at the parent directory of the highlighted row, with the cursor placed on that row.
- **`Advance` on a directory** enters that directory in the Nav pane.
- **`Advance` on a file** opens the file through `[interface] advance_command` in [config.toml](./configuration), which defaults to the [lessfilter](./lessfilter) `edit` preset (`$FS_EDITOR` / `$EDITOR`).

## Browsing archives transparently

Pressing `Advance` (`right`) on a supported archive (`.zip`, `.tar`, `.tar.gz`, `.tar.bz2`, `.tar.xz`, `.tar.zst`, `.7z`, `.rar`, `.iso`, `.dmg`) extracts or mounts the archive in the background and enters its contents directly in the Nav pane as a transparent preview, with no confirmation dialog.

<video controls preload="none" poster="./images/archive.png" src="./images/archive.mp4"></video>

While browsing inside an archive, all read and copy operations work as normal. Pressing `Parent` (`left`) at the top of the archive returns directly to the directory containing the archive file (unless `[interface] allow_enter_unzip_directory = true` is set in `config.toml`). Temporary extraction directories live under the process temp directory and are cleaned up automatically when `fs` exits.

In contrast, pressing `Advance` on an active mount point—or running the `Extract` action explicitly—opens the mount overlay rather than entering transparently; see [Mount pane](./mount-pane).

## Changing directory

Whenever a transition changes the pane's working directory, f:st starts an asynchronous directory walk and updates the status line while rows stream in; if the directory is empty and `[interface] toast_on_empty = true`, f:st shows an informational toast.

Changing directories clears the current query and resets `files`/`dirs` filetype filters (unless `[smart_visibility] retain_filetype_filters = true`), while keeping your active visibility toggles (`hidden`, `ignored`, `all`) and inherited sort order.

## The navigation stack

Every pane or directory transition updates the navigation stack:

- **Pushing** — entering a directory with `Advance`, climbing with `Parent`, or switching to another pane kind (`ctrl-f`, `ctrl-r`, `ctrl-g`, `alt-s`) pushes a new entry onto the stack.
- **Truncating on a new branch** — if you step back with `Undo` and then navigate to a new directory or pane, the forward (`Redo`) history above your current stack position is discarded.
- **In-place replacement** — toggling between Folders and Files with `ctrl-g` replaces the active History pane in place so a single `Undo` returns directly to the pane you opened History from.

Each pane resolves its working directory differently: Nav, Find, and Search use their search root; History, Stash, and Custom panes keep the working directory of the pane that opened them; the App pane has no working directory.

## Undo and redo

`Undo` (`ctrl-z`) and `Redo` (`alt-z`) step backward and forward through the navigation stack without touching the filesystem.

<video controls preload="none" poster="./images/undo.png" src="./images/undo.mp4"></video>

Returning to a stack entry restores its pane kind, working directory, typed query, cursor row, and sort order. You can jump across the filesystem through History (`ctrl-g`), copy or cut files there, and press `ctrl-z` to land back in your starting directory with the cursor where you left it:

<video controls preload="none" poster="./images/undo-jump.png" src="./images/undo-jump.mp4"></video>

External filesystem changes and completed queue transfers are not reversed by `Undo`.

## Jump and JumpOrAccept

Two bind actions provide direct positional or bookmark jumps:

- **`Jump`** cycles the Nav pane through configured quick-jump roots: your home directory (`~`), the filesystem root (`/`), and named system directories. By default `/` and `~` in the Nav pane jump to your home directory when the query is empty.
- **`JumpOrAccept(0..9)`** (`ctrl-1` through `ctrl-9`, plus `alt-space` for the prompt) moves the cursor to row index `N`. If the cursor is already on row `N`, it accepts the row—or runs `Advance` instead when `[interface] jump_or_advance = true` is set in [config.toml](./configuration). `JumpOrAccept(0)` always accepts.

## How navigation feeds history

f:st records visits to the [history database](./history-database) selectively so transient browsing does not pollute frecency rankings:

- **Recorded as visits**: entering a directory with `Advance`, accepting or editing a file, launching an application from the App pane, and (when enabled in `[interface]`) running menu actions or completing queue transfers.
- **Not recorded**: walking up with `Parent` (`left`), stepping through `Undo`/`Redo`, or previewing rows.
- **Locked-prompt actions**: accepting or running an action while the cursor is disabled in the prompt records the visit against the prompt's working directory.
- **Exclusions**: any path matching `[history] exclude` or outside `[history] base_dir` is silently dropped.

## Selection cycling and the prompt

Pressing `tab` marks the cursor row and moves down; `ctrl-a` (`CycleSelections`) cycles between selecting all visible rows, inverting the selection, and restoring the previous selection, while `ctrl-shift-a` clears all selections.

Moving past the top of the results list with `up` at row `0` (or `down` at the last row when layout direction is reversed) moves focus out of the results list and into the prompt.

## Prompt locking

Because `left` and `right` are bound to `Parent` and `Advance` for single-key directory traversal, moving the text caret inside the query bar uses `shift-left` and `shift-right` while unlocked. To prevent accidental directory changes when editing a complex query, f:st supports **prompt locking**:

<video controls preload="none" poster="./images/prompt.png" src="./images/prompt.mp4"></video>

While the prompt is locked:

- The query bar displays the `[query_locked]` style from [mm.toml](./mm.toml#locked-prompt) (a red bottom border by default).
- `left` and `right` swap roles with `shift-left` and `shift-right`, so bare `left`/`right` move the text caret and `shift-left`/`shift-right` run `Parent`/`Advance`.
- On macOS, `cmd-backspace` deletes a word in the query instead of trashing the highlighted row.

Entering the prompt with `up` at row `0` (`in_prompt`) automatically enables `locked_prompt`. You can also toggle the lock manually at any time with `ctrl-space` or `alt-hyphen`, or press `alt-space` (`JumpOrAccept(prompt)`) to jump to and accept the locked working directory.

Prompt locking is defined entirely by the `locked_prompt^^...` bindings block in `~/.config/fist/mm.toml`; deleting that block disables the role swap. You can control automatic locking on pane entry with `--lock-prompt` (`never`, `auto`, `always`) on the CLI or `lock_prompt` under `[panes.<name>]` in [config.toml](./configuration).

## Cwd prompt and the cursor-disabled state

When you press `up` at the first row to enter the prompt, the results cursor is disabled and the query bar prefix switches to `[interface] cwd_prompt` (default `"{=} "`, showing the current working directory with `~` collapsed). In this state:

- Builtin actions (`Copy`, `Move`, `Open`, `Print`, `PushStash`) and menu actions with `selected = "cwd"` or `"active"` target the pane's current working directory itself.
- If `[interface] hide_preview_when_cursor_disabled = true`, the preview pane hides until you leave the prompt.
- Pressing `down` (or `ctrl-space` / `alt-hyphen`) returns focus to the first row in the results list.

## Per-pane defaults

Every `[panes.<name>]` table in [config.toml](./configuration#panes) can set its own entry defaults:

| Key | Effect on pane entry |
| --- | --- |
| `show_preview` | `true`, `false`, or minimum terminal cells required to show the preview |
| `preview_layout_index` | Index into `[[preview.layout]]` in `mm.toml` |
| `default_visibility` | Initial `hidden`, `ignore`, `unrestricted`, `files`, and `follow` state |
| `default_sort` | Initial soft sort (`name`, `mtime`, `atime`, `size`, `none`) |
| `lock_prompt` | `"never"`, `"auto"`, or `"always"` |
| `prompt` / `prompt_style` | Custom prompt prefix string and ratatui style |

## Selection refill and reload stability

When the filesystem watcher or a manual reload (`f5` / `ctrl-r`) repopulates the active pane:

- **`refill_selections_after_reload`** (default `true`) re-marks any previously selected paths that still exist in the new listing.
- **`stability_threshold`** (default `30`) keeps soft-sorted rows from jumping around when background metadata or frecency scores change by less than the threshold; set `0` to always re-sort immediately.
- **Sort inheritance** preserves an explicit hard sort across directory changes in the Nav pane, and restores the originating pane's sort when backing out of History or App panes.

## Mouse and scrolling

Scrolling the mouse wheel over the results table moves the cursor via `MouseScrollUp` and `MouseScrollDown`; scrolling over the preview pane scrolls the preview content via `PreviewScrollUp` and `PreviewScrollDown`. Both triggers respect `[tui] scroll_debounce_ms` in `mm.toml` so high-resolution trackpads do not flood the event loop.

Next: [Panes](./panes) · [Visibility](./visibility) · [Sorting](./sorting)
