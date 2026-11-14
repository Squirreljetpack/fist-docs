# config.toml

`config.toml` configures the application itself: pane behavior, history, transfers, the filesystem watcher, and path styling. UI configuration lives separately in [mm.toml](./mm.toml); [lessfilter](./lessfilter), the [pager](./pager), and [menu actions](./menu-actions) have their own files as well.

| File | Purpose |
| --- | --- |
| `config.toml` | Pane behavior, history, transfers, watcher, path styles |
| `mm.toml` | Columns, previews, TUI layout, overlays, key bindings — see [mm.toml](./mm.toml) |
| `lessfilter.toml` | Preview and handler presets — see [lessfilter](./lessfilter) |
| `pager.toml` | Pager behavior — see [Pager](./pager) |
| `actions.toml`, `actions/` | Menu actions — see [Menu actions](./menu-actions) |

The config directory is the platform config directory (`~/.config/fist` on Linux). An existing `~/.config/fist` is preferred on every platform, even when `XDG_CONFIG_HOME` points elsewhere. `fs --dump-config` writes the shipped defaults for all config files when stdout is a terminal, skipping files that already exist, and prints the fully resolved `config.toml` when piped.

Values omitted from the file keep their defaults. Unknown keys are rejected with an error.

## Top level

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `state_dir` | path | `~/.local/state/fist` | Database, logs, and persistent state |
| `cache_dir` | path | `~/.cache/fist` | Cache data |

On macOS and Windows these follow the platform state and cache directories.

## Panes

`[panes.<name>]` configures the behavior of one pane. The common fields are:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `prompt` | string | none | Query-bar prompt |
| `prompt_style` | style | none | Style of the prompt |
| `show_preview` | bool or integer | pane-specific | Preview visibility on pane entry, or minimum terminal dimension |
| `lock_prompt` | `when` | `"never"` | Lock the prompt on pane entry |
| `preview_layout_index` | integer | `0` | Index into `[[preview.layout]]` in [mm.toml](./mm.toml) |

When `show_preview` is an integer, it sets the minimum terminal width—or height for top/bottom preview layouts—required to display the preview. A pane without a `show_preview` value inherits the active preview visibility.

### Nav

`[panes.nav]` adds:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `default_sort` | sort order | `"mtime"` | Initial soft sort |
| `default_visibility` | visibility | none | Initial hidden, ignored, and file-type filters |
| `ignore_patterns` | array of globs | `[]` | Gitignore-style patterns skipped unless `all` visibility is active |

When `default_visibility` is omitted, hidden rows are shown and git-ignored rows are hidden inside a git repository, and the reverse outside one; see [Visibility](./visibility).

### Find

`[panes.find]` adds:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `default_visibility` | visibility | none | Initial visibility (same git-aware fallback as Nav) |
| `default_sort` | sort order | none | Initial soft sort |
| `max_refresh_items_threshold` | integer | `20000` | Maximum row count for automatic filesystem watcher refreshes |
| `max_refresh_execution_time_threshold` | milliseconds | `400` | Maximum search duration for automatic watcher refreshes |
| `reduce_paths` | bool | `false` | Rebase the pane working directory to the common parent of target paths |
| `exclusions` | array of globs | platform-specific | Globs excluded from every search (`~` expands to home) |
| `base_args` | array of strings | `[]` | Extra arguments appended to every search invocation |
| `default_args` | array of strings | `[]` | Arguments used when `fs ::` is called with no extra search flags |

### Search

`[panes.search]` adds:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `default_visibility` | visibility | none | Initial visibility (same git-aware fallback as Nav) |
| `default_sort` | sort order | none | Initial soft sort |
| `one_line` | bool | `false` | Render each match on a single line instead of a stacked context block |
| `fixed_strings` | bool | `false` | Treat queries as literal strings instead of regular expressions |
| `preserve_whitespace` | bool | `false` | Keep the query as a single pattern instead of splitting on whitespace |
| `rg_status_template` | display template | none | Status-line template while in query mode |
| `fs_status_template` | display template | none | Status-line template while in filter mode |
| `iglobs` | table | `{}` | Folder-keyed case-insensitive globs (`""` applies everywhere) |
| `base_args` | array of strings | see below | Arguments passed to every search |
| `empty_pattern` | string | none | Fallback pattern when the query is empty (a leading `-v` inverts matching) |
| `default_args` | array of strings | `[]` | Arguments applied when no extra search arguments are given on the CLI |

The default `base_args` are `--trim --color=ansi --no-context-separator --field-context-separator=-`.

### Other panes

`[panes.app]`, `[panes.files]`, `[panes.dirs]`, and `[panes.custom]` share the common fields. The first three add:

| Table | Key | Type | Default | Meaning |
| --- | --- | --- | --- | --- |
| `app` | `app_scan_directories` | array of paths | `[]` | Extra directories scanned for desktop applications |
| `app` | `require_icon` | bool | `true` on macOS | Only list applications with a resolvable icon |
| `files` | `default_sort` | sort order | none | Initial soft sort |
| `dirs` | `default_sort` | sort order | none | Initial soft sort |

### Stashes

Every stash is a pane addressed by name under `[panes.stashes.<name>]`, with `[panes.stashes.""]` for the unnamed default stash. Stashes share the common pane fields and add:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `kind` | string | `"transient"` | Storage mode: `"transient"`, `"filter"`, or `"prune"` |
| `insert` | string | `"replace"` | Duplicate handling: `"replace"`, `"skip"`, or `"duplicate"` |

`kind` selects where rows live:

- `"transient"` keeps rows in memory for the current process only.
- `"filter"` stores rows in the database and hides paths that no longer exist on disk.
- `"prune"` stores rows in the database and deletes missing paths when the pane populates.

`insert` selects what happens when pushing a path that is already in the stash:

- `"replace"` removes the existing row and appends a fresh one at the end.
- `"skip"` leaves the existing row untouched.
- `"duplicate"` appends a second row for the same path.

A stash without an explicit `prompt` displays `<name>>`. A stash with no table in `config.toml` falls back to a white prompt.

## Interface

`[interface]` controls interactive navigation and action defaults:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `advance_command` | output template | lessfilter edit preset | Command run when `Advance` targets a file |
| `alt_accept` | bool | `false` | Swap the open and print behaviors of the accept bindings |
| `no_multi_print` | bool | `false` | Print only the cursor row when accepting with a selection |
| `always_paste` | bool | `false` | Treat clipboard paste as query text entry even outside the prompt |
| `remove_db_record_action` | `"None"`, `"Trash"`, or `"Delete"` | `"None"` | Action that drops database rows in history and stash panes instead of touching disk |
| `hide_preview_when_cursor_disabled` | bool | `false` | Hide the preview pane while the cursor is in the prompt |
| `allow_enter_unzip_directory` | bool | `false` | Walk up into the temporary extraction root on `Parent` instead of returning to the archive's parent directory |
| `stability_threshold` | integer | `30` | Score-change tolerance across reloads before re-sorting (`0` always re-sorts) |
| `preserve_size_cache` | bool | `false` | Retain cached directory sizes when switching between cached directories |
| `cwd_prompt` | output template | `"{=} "` | Prompt template displayed when the cursor enters the prompt |
| `toast_on_empty` | bool | `true` | Show a toast when entering an empty directory |
| `jump_or_advance` | bool | `false` | Make `JumpOrAccept` advance instead of accept when already on the target row (`0` always accepts) |
| `refill_selections_after_reload` | bool | `true` | Re-mark selected paths after a pane reloads |
| `copy_files_to_clipboard` | bool | `true` | Copy selected file paths to the system clipboard on `Copy` |
| `move_files_to_clipboard` | bool | `false` | Cut selected file paths to the system clipboard on `Move` |
| `bump_menu_action_paths` | bool | `false` | Record menu-action targets in the history database |
| `bump_transfer_destinations` | bool | `false` | Record completed transfer destinations in the history database |

## Queue

`[queue]` configures background transfers; see [Queue](./queue) for conflict and dispatch semantics.

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `clear_completed_on_close` | bool | `false` | Keep completed rows when closing the queue overlay (`false` clears them) |

`[queue.copy]` and `[queue.move]` accept the same transfer parameters:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `workers` | integer | CPU count | Parallel transfer workers |
| `preserve_metadata` | bool | `true` | Preserve timestamps and permissions |
| `reflink` | `"Auto"` or `"Never"` | `"Auto"` | Copy-on-write cloning when supported by the filesystem |
| `conflict` | string | `"Overwrite"` | Nested conflict resolution: `"Fail"`, `"Overwrite"`, `"Skip"`, `"RenameSuffix"`, or `"Abort"` |
| `root` | string | `"Rename"` | Top-level destination collision strategy: `"Overwrite"`, `"Merge"`, `"Rename"`, or `"Fail"` |
| `buffer_size` | integer | `524288` | Copy buffer size in bytes |

## Smart visibility

`[smart_visibility]` controls automatic filter adjustments; see [Visibility](./visibility).

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `dot_query_show_hidden` | bool | `true` | Show hidden files when a find query starts with `.` |
| `dot_query_show_ignored` | bool | `false` | Also show ignored files for dot-prefixed find queries |
| `empty_folders` | bool | `true` | Reveal hidden files when a directory has no visible entries |
| `git_repo` | `when` | `"auto"` | Git-aware visibility on startup (`"auto"`), across repo boundaries (`"always"`), or disabled (`"never"`) |
| `ignored_targets` | bool | `true` | Un-ignore git-ignored target paths passed explicitly on the command line |
| `retain_filetype_filters` | bool | `false` | Keep `files`/`dirs` filters when switching into a Nav pane |

## History

`[history]` configures the frecency database; see [History database](./history-database).

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `resolve_symlinks` | bool | `false` | Resolve symlinks when verifying recorded entry types |
| `query_strategy` | string | `"Substring"` | Component matching mode: `"Substring"` or `"Monotonic"` |
| `case_sensitive` | bool | smart | Force case sensitivity (smart case when omitted) |
| `lambda` | float | `0.008` | Event-clock exponential decay rate |
| `exclude` | array of globs | `[]` | Globs excluded from recording and bumping (`~` expands to home) |
| `prune_max` | integer | `10000` | Row threshold that triggers lazy pruning |
| `prune_min` | integer | `8000` | Row count retained after pruning |
| `refind` | string | `"Next"` | Behavior when the top match is the current directory: `"Search"`, `"Next"`, or `"None"` |
| `show_missing` | bool | `false` | Keep rows whose paths no longer exist on disk |
| `base_dir` | path | none | Restrict recording to paths under this directory |

## Watcher

`[notify]` configures automatic filesystem watching:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `fs_poll_ms` | milliseconds | `2000` | Poll interval |
| `debounce_ms` | milliseconds | `100` | Quiet window used to coalesce bursts of events |
| `thrash_threshold.count` | integer | `5` | Event count within `duration_ms` that trips storm throttling |
| `thrash_threshold.duration_ms` | milliseconds | `5000` | Sliding window for storm detection |
| `thrash_threshold.resume_delay_ms` | milliseconds | `10000` | Quiet period required before resuming automatic reloads |

## Miscellaneous

`[misc]` configures logging, process spawning, and list output:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `append_mode_logging` | bool | `false` | Append to the main log file instead of truncating on startup |
| `tools_append_mode_logging` | bool | `false` | Append to the subtool log file |
| `spawn_with` | array of strings | `[]` | Command prefix prepended when spawning external programs |
| `list_absolute_paths` | bool | `false` | Print absolute paths in `--list` mode |

## Styles

`[styles.path]` configures how file and directory paths render in column 1:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `collapse_home` | bool | `true` | Shorten the home directory prefix to `~` |
| `relative` | bool | `true` | Render paths relative to the pane working directory |
| `file_icons` | bool | `true` | Show file icons |
| `file_colors` | bool | `true` | Color file names |
| `dir_icons` | bool | `true` | Show directory icons |
| `dir_colors` | bool | `true` | Color directory names |
| `icon_colors` | bool | `true` | Color icons |

`[styles.path.file_styles]` overrides the ratatui style (`fg`, `bg`, `add_modifier`, `sub_modifier`, `underline_color`) for each category: `image`, `video`, `music`, `lossless`, `crypto`, `document`, `compressed`, `temp`, `compiled`, `build`, `source`, `configuration`, `text`, and `other`.

Additional style tables:

| Table | Meaning |
| --- | --- |
| `[styles.matchmaker]` | `horizontal_separator`: `"None"`, `"Empty"`, `"Light"`, `"Normal"`, `"Heavy"`, or `"Dashed"` |
| `[styles.toast]` | Per-level toast styles: `normal`, `info`, `success`, `warning`, `error` |
| `[styles.raw_prompt_style]` | Style applied to raw query text |

Passing `--style` overrides `file_icons`, `file_colors`, `dir_icons`, `dir_colors`, and `icon_colors` for a single run.

## Value formats

- **`when`** — `"never"`, `"auto"`, or `"always"`.
- **sort order** — `"name"`, `"mtime"`, `"atime"`, `"size"`, or `"none"` (`"frecency"` is an alias for `"none"` in database panes).
- **visibility** — a table with any of `hidden`, `ignore`, `unrestricted`, `files`, and `follow`. `files = true` shows files only; `files = false` shows directories only.
- **style** — `fg`, `bg`, and pipe-separated `modifier` (for example `modifier = "BOLD | ITALIC"`).
- **output template** — `{…}` placeholders expanded against the target row; see [Output templates](./output-templates).
- **display template** — matchmaker status-line template syntax (`\m`, `\t`, `{red:text}`).
- **milliseconds** — integer milliseconds, such as `400`.

Next: [mm.toml](./mm.toml) · [lessfilter](./lessfilter) · [Pager](./pager)
