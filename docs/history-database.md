# History & the database

F:ist keeps a single SQLite database of everything you've visited — directories, files, and applications — and uses it for the **Files / Folders** panes, the **Apps** pane, and the `z` jump function.

![Folders pane](images/07-history.png)

## Overview

- One database, four tables: `dirs`, `files`, `apps`, `stashes`.
- Ranking uses an **event clock** — scores decay per visit, not per second.
- `fs :tool bump` adjusts entries manually; pruning is lazy and automatic.

## Where the database lives

| Path | Contents |
| --- | --- |
| `~/.local/state/fist/record.db` | The database |
| `~/.cache/fist/` | Helper scripts used by lessfilter (including `liza`) |
| `fist.log` / `fist.tools.log` | Logs, next to the database |

All four tables share a schema: `name`, `path`, `alias`, `cmd`, `atime`, `count`, `score` (stashes: `name`, `path`, `tail`, `add_time`).

## What records a visit

| Event | Bumps |
| --- | --- |
| Entering a directory (Advance, `z`, `--cd`, shell chpwd hook) | `dirs` |
| Opening a file (`fs :open`, Advance, tracked lessfilter presets) | `files` |
| Successful menu actions | the target |
| `fs :tool bump <path>` | manually |

The default tracked lessfilter presets are `edit`, `alternate`, and `extended` — running them records the file.

## Ranking: the event clock

Ranking is what makes `z` and the Files/Folders panes feel right. Instead of zoxide's wall-clock decay, f:ist uses an **event clock**: every visit is one tick (`atime = max(atime) + 1`), and scores decay per tick. Inactivity doesn't rot your history — only other activity does.

The decay constant `history.lambda` (default `8e-3`) sets a half-life of about **87 visits**: each tick multiplies the stored score by `exp(-λ·Δt)` before adding the new visit. Set `lambda = none` for wall-clock, zoxide-compatible bucketed scoring.

## History configuration (`[history]` in config.toml)

| Setting | Default | Meaning |
| --- | --- | --- |
| `lambda` | `8e-3` | Event-clock decay; `none` = wall clock |
| `refind` | `Search` | What `z` does when the best match is the current directory |
| `exclude` | `[]` | Glob patterns never bumped (`["**/node_modules"]`) |
| `base_dir` | `null` | Only track paths under this root |
| `show_missing` | `false` | Hide entries whose path no longer exists |
| `query_strategy` | `substring` | `substring` or `monotonic` matching |
| `case_sensitive` | `null` | `null` = smart (caps → case-sensitive) |
| `resolve_symlinks` | `true` | Resolve symlinks before recording |

### `refind`

When `z`'s best match *is* the current directory (or there's no match), `refind` picks the fallback:

| Value | Behavior |
| --- | --- |
| `Search` | Launch the interactive `fs :dir` picker (shipped default) |
| `Next` | Return the second-best match |
| `None` | Return the current directory as-is |

## Pruning

Pruning is lazy. When a frecency listing exceeds `prune_max` entries (default 10,000), the tail past `prune_min` (default 8,000) is removed. Missing paths are swept on demand:

```shell
fs :tool bump --prune
```

This removes entries whose path no longer exists and whose score is below the `--count` threshold.

## The Files and Folders panes

- `ctrl-g` opens both; `fs :file` / `fs :dir` from the shell.
- Sort options are **name / atime / count / frecency** (keys `n` / `t` / `c` / `f` in the options overlay); toggling the active sort off lands on insertion order.
- `fs :dir --cd query` prints the best match and exits — this is what `z` calls.
- `fs :dir -l` prints matching folders non-interactively.

## The Apps pane

Prepopulated from your system:

| Platform | Sources |
| --- | --- |
| Linux | `.desktop` entries: `/usr/share/applications`, `~/.local/share/applications`, `~/Desktop` |
| macOS | `.app` bundles |

Use it as a launcher for a set of files: `fs :open` (or menu → **Open With**), then pick a program. `fs :open -w prog files` skips the picker. Applications rank like anything else once used; `SetAlias` in the menu sets a display-name override.

## Inspecting with `:info`

```shell
fs :info                  # config paths (config, mm config, logs)
fs :info dirs             # the folders table, frecency-sorted
fs :info files --sort atime --limit 20
fs :info apps --minimal   # bare paths, one per line
```

| Flag | Meaning |
| --- | --- |
| `--sort <sort>` | `name` `mtime` `atime` `size` (count) `none` (frecency) |
| `-l, --limit N` | Max rows (default 50; `0` = all) |
| `-m, --minimal` | Bare paths only, no table decorations |

## `:tool bump` quick reference

```shell
fs :tool bump /some/path                 # +1 visit
fs :tool bump --count 5 --glob '*.rs'    # +5 to every .rs entry
fs :tool bump --count 0 --glob 'old*'    # remove matching entries
fs :tool bump --prune                    # sweep missing paths (all tables)
fs :tool bump --reset                    # wipe a table (or the whole db)
```

Note: bumping honors `history.exclude` — excluded paths are skipped, not recorded.

## FAQ

**Why do my scores decay even when I do nothing?**

They don't — decay is per-visit (event clock), not per-second. Only activity moves the clock forward.

**How do I stop `z` from jumping to deleted folders?**

`show_missing = false` hides entries whose paths are gone; `fs :tool bump --prune` sweeps them from the database.

**Can I have frecency instead of the event clock?**

Set `history.lambda = none` for wall-clock, zoxide-style scoring.
