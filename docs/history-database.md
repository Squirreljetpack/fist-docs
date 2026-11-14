# History database

f:st records the directories, files, and applications you use in a single SQLite database, ranking them with an event-clock frecency algorithm that powers both the in-app History panes and the shell's `z`, `x`, and `Z` functions.

## What gets recorded

Three kinds of entries are tracked in one database:

- **Directories (`dirs`)** — bumped when you enter a directory in the TUI (`Advance`, `Parent`, `Jump`), accept or print a directory, jump via `z` / `--cd`, pass search roots to `fs ::`, or change directories in an integrated shell.
- **Files (`files`)** — bumped when you accept or open a file (`enter`, `fs :open`), edit a file via `Advance`, enter an archive, or run a [lessfilter](./lessfilter) preset listed in `tracked_presets`.
- **Applications (`apps`)** — seeded when the App pane scans desktop launchers and bumped whenever you launch an application from f:st.

Two optional settings under `[interface]` in [config.toml](./configuration#interface) record additional activity: `bump_menu_action_paths` bumps targets of custom [menu actions](./menu-actions), and `bump_transfer_destinations` bumps destination directories of completed [queue](./queue) transfers.

Any path matching a glob in `[history] exclude` (or outside `[history] base_dir`) is never recorded or bumped.

## Where the database lives

The database is stored at `<state_dir>/record.db` (`~/.local/state/fist/record.db` on Linux, `~/Library/Application Support/fist/record.db` on macOS, `%LOCALAPPDATA%\fist\record.db` on Windows).

`record.db` holds four tables:

| Table | Columns | Purpose |
| --- | --- | --- |
| `dirs` | `name`, `path`, `alias`, `cmd`, `atime`, `count`, `score` | Visited directories |
| `files` | `name`, `path`, `alias`, `cmd`, `atime`, `count`, `score` | Visited and edited files |
| `apps` | `name`, `path`, `alias`, `cmd`, `atime`, `count`, `score` | Discovered and launched desktop applications |
| `stashes` | `id`, `name`, `stash`, `tail`, `add_time` | Database-backed [stash panes](./stash-panes) |

In `dirs` and `files`, `cmd` caches the canonical path when `path` traverses a symlink; in `apps`, `cmd` stores the launch command template. When `record.db` is created for the first time, f:st seeds `dirs` with standard existing directories under your home folder (`~`, `Documents`, `Downloads`, `Desktop`, `.config`, and platform equivalents) at an initial count of `5`.

## Frecency scoring

Wall-clock frecency algorithms decay every score over real time, which means returning from a week away collapses historical scores toward zero and lets the first directory you visit dominate the rankings. f:st replaces the wall clock with an **event clock** controlled by `[history] lambda` (default `0.008`):

- **Logical ticks** — each table (`dirs`, `files`, `apps`) uses `MAX(atime)` as an integer tick counter that advances by `1` only when a visit is recorded in that table.
- **Exponential decay + visit increment** — when an entry is visited with weight `c` (normally `1`), its stored score updates to:
  $$\text{score}_{\text{new}} = \text{score}_{\text{old}} \times e^{-\lambda (\text{tick}_{\text{new}} - \text{atime}_{\text{old}})} + c$$
- **Half-life** — the half-life in visits is $\ln(2) / \lambda$. At the default `lambda = 0.008`, an entry's score halves every ~87 visits in that table.
- **Zero idle decay** — while you are not visiting entries in a table, its event clock stands still and relative rankings never decay. (Setting `lambda` to `None` / commenting it out falls back to classic wall-clock age buckets).

Pruning happens lazily: whenever a table is queried in frecency order and exceeds `prune_max` rows (default `10000`), f:st deletes the lowest-ranked tail so `prune_min` rows (default `8000`) remain. To sweep entries whose paths no longer exist on disk, run `fs :tool bump --prune`.

## History configuration

`[history]` in [config.toml](./configuration#history) configures matching, decay, and pruning:

| Key | Default | Meaning |
| --- | --- | --- |
| `resolve_symlinks` | `false` | Follow symlinks when verifying whether a recorded path still matches its file/directory type |
| `query_strategy` | `"Substring"` | Keyword matching mode: `"Substring"` or `"Monotonic"` |
| `case_sensitive` | smart case | Force case sensitivity (`true` / `false`), or omit for smart case |
| `lambda` | `0.008` | Exponential decay rate per event tick |
| `exclude` | `[]` | Globs excluded from recording (`~` expands to home) |
| `prune_max` | `10000` | Row count that triggers lazy tail pruning |
| `prune_min` | `8000` | Row count kept after lazy pruning |
| `refind` | `"Next"` (`"Search"` in `--dump-config`) | Action when `--cd` matches the current directory or finds nothing: `"Search"`, `"Next"`, or `"None"` |
| `show_missing` | `false` | Include database rows whose paths no longer exist on disk |
| `base_dir` | none | Only record and query paths inside this directory |

## Query matching

When resolving command-line keywords (`z foo bar`, `fs :dir --cd foo bar`, `fs :file -l foo`), f:st matches keywords against path components from right to left:

- **Anchored final keyword** — the last keyword must match the final component of the path; earlier keywords must match earlier path components in order.
- **Separators force adjacency** — a keyword containing `/` (such as `src/api`) splits into sub-components that must match adjacent path components contiguously.
- **Substring vs monotonic** — with `query_strategy = "Substring"` (default), each keyword must appear as a contiguous substring of the component; with `"Monotonic"`, the keyword's characters must appear in order within the component.
- **Smart case** — unless `case_sensitive` is set explicitly, a keyword containing uppercase letters matches case-sensitively and an all-lowercase keyword matches case-insensitively.
- **`refind` fallback** — when `--cd` resolves to the directory you are already in, `"Next"` skips to the second-best match, `"Search"` opens the interactive History pane seeded with your query, and `"None"` returns the current directory as-is.

## History panes

Pressing `ctrl-g` from any pane opens the **Folders** pane (`dirs` table). Pressing `ctrl-g` again switches in place to the **Files** pane (`files` table), and subsequent presses toggle between the two; pressing `ctrl-z` (`Undo`) backs out to the pane you started from.

<video controls preload="none" poster="./images/history.png" src="./images/history.mp4"></video>

The **App** pane (`fs :open` or Menu → `open with`) queries the `apps` table using the same frecency engine.

History panes do not use filesystem visibility filters (`hidden` / `ignored`). Instead, they expose five SQL-backed sort orders in the Options overlay (`alt-p`) and via `ctrl-d` (`CycleFilter`), with `ctrl-s` toggling between `frecency` and `atime`:

| Sort label | SQL ordering |
| --- | --- |
| `frecency` (`none`) | Decayed frecency score descending |
| `atime` (`recent`) | Most recently visited tick descending |
| `count` (`size`) | Total visit count descending |
| `name` | Entry basename alphabetically |
| `mtime` | Database insertion order (`rowid` descending) |

## Records, aliases and tooling

- **Set alias** — choosing `set alias` from the menu (`alt-e`) opens a prompt that edits the entry's `alias` column, rendered in column 2 (the tail) and searchable via `%`.
- **Removing database rows vs disk files** — `[interface] remove_db_record_action` (`"None"`, `"Trash"`, or `"Delete"`) in [config.toml](./configuration#interface) chooses which bind action deletes the database record in History and Stash panes while leaving the other action to operate on the real file on disk.
- **CLI subcommands** — `fs :dir` and `fs :file` open the Folders and Files panes directly (or list rows with `--list`). `fs :info` prints the database tables and their paths, and `fs :info --help` lists its flags. `fs :tool bump` manually increments, resets (`--reset`), or prunes (`--prune`) database entries; see [Tools](./tools#bump).

## Ambient integration

The shell integration (`fs :tool shell`) wires `z` (`fs :dir --cd`), `x` (`z ... ./`), and `Z` (`fs :file --cd`) directly to `record.db` and installs a `PWD` change hook so shell navigation and interactive TUI sessions share a single unified history. See [Shell integration](./shell-integration).
