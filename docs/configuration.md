# Configuration

F:ist reads five TOML files (plus a folder of action files). Most options have shipped defaults, so a fresh install works with zero config — this page documents what's there and what each knob does.

## Overview

- **`config.toml`** — application settings: panes, fd/rg behavior, history, styles, watcher.
- **`mm.toml`** — the matchmaker (UI) layer: layout, preview, overlays, and **keybindings** (see [mm.toml](mm.toml.md)).
- **`lessfilter.toml`** — preview presets and rules (see [lessfilter](lessfilter.md)).
- **`pager.toml`** — pager options passed to bat (see [The pager](pager.md)).
- **`actions.toml`** plus **`actions/`** — custom menu actions (see [Menu actions](menu-actions.md)).

All live in the config directory (`~/.config/fist/`).

| CLI flag | Effect |
| --- | --- |
| `--config <path>` | Use a different `config.toml` |
| `--mm-config <path>` | Use a different `mm.toml` |
| `--override <path>` | Declared, but not applied by the current build — use `--config` / `--mm-config` to load a different file, or edit the TOML directly. |
| `--dump-config` | Print the resolved config; on a TTY, writes the config files |
| `--style <style>` | `icons` `icon-colors` `colors` `none` `all` `auto` |

`fs :tool check` validates everything: configs, binds, and every menu-action script (see [Tools](tools.md)).

## `config.toml`

### `[interface]`

| Setting | Default | Meaning |
| --- | --- | --- |
| `prompt_locking` | `false` (shipped config: `true`) | Master switch for prompt locking (see [Navigation](navigation-in-depth.md)) |
| `advance_command` | `fs :tool lessfilter edit {}` | What advancing on a file runs |
| `alt_accept` | `false` | Accept prints the path instead of opening (used by `--cd` flows) |
| `no_multi_accept` | `false` | Don't accept multiple selections at once |
| `always_paste` | `false` | Paste without confirmation |
| `cwd_prompt` | `'{} '` | Prompt template for the current directory |
| `toast_on_empty` | `true` | Toast when an action targets nothing |
| `autojump_advance` | `false` | Autojump advances instead of accepting |
| `hide_preview_when_cursor_disabled` | `false` | Hide preview while the prompt is active |
| `prompt_locking_allow_delete_actions` | `true` | Allow delete actions while the prompt is locked |

### `[fs]`

| Setting | Default | Meaning |
| --- | --- | --- |
| `rename_policy` | `WrappedInc("_", "")` | Collision handling on paste: default suffixes `_1`, `_2`, …; `Replace` overwrites |
| `refill_selections_after_reload` | `true` | Restore selections across reloads |

### `[fd]` and `[rg]`

Search backends (documented in [The find pane](find-pane.md) and [The search pane](search-pane.md)). Highlights: `[fd] dot_query_show_hidden`, `default_search_in_home`, `default_search_ignore`, `exclusions` — all of which shape default [visibility](visibility.md#what-adjusts-it); `[rg] base_args`, `empty_pattern`.

### `[panes]`

Per-pane settings, applied when you switch to that pane type. Common fields: `show_preview`, `lock_prompt`, `preview_layout_index`, plus `default_sort` / `default_visibility` (see [Sorting](sorting.md) and [Visibility](visibility.md)).

| Section | Notable defaults |
| --- | --- |
| `[panes.nav]` | `show_preview = 60`, `lock_prompt = false`, default sort `mtime` (see [Sorting](sorting.md)) |
| `[panes.find]` | `show_preview = 60`, `lock_prompt = true` |
| `[panes.search]` | `lock_prompt = true`, `show_preview = 20`, `preview_layout_index = 1`, `one_line = true`, `default_sort = "none"`, status templates |
| `[panes.app]` | `preview_layout_index = 3`, `show_preview = true` |
| `[panes.history]` | preview/prompt settings for Files/Folders panes |
| `[panes.custom]` | preview/prompt settings for custom panes |
| `[panes.stashes.<name>]` | per-stash `kind` / `insert` (see [Stash panes](stash-panes.md)) |

Top-level pane plumbing:

| Setting | Default | Meaning |
| --- | --- | --- |
| `display_script_simultaneous_count` | `15` | Concurrent display scripts |
| `display_script_batch_size` | `1000` | Script batch size |
| `apply_default_sort` | `true` | Re-apply a pane's default sort when switching to it (see [Sorting](sorting.md)) |

### `[styles]`

Two groups — **path display** and **toasts**:

- `[styles.path]` — `collapse_home`, `relative`, `file_icons`, `file_colors`, `dir_icons`, `dir_colors`, `icon_colors` (all default `true`); per-file-type colors.
- `[styles.toast]` — `normal` (dark gray italic), `info` (light blue), `success` (green), `warning` (yellow), `error` (red).

### `[notify]`

The filesystem watcher that refreshes panes live:

| Setting | Default | Meaning |
| --- | --- | --- |
| `fs_poll_ms` | — | Poll interval |
| `debounce_ms` | — | Reload debounce |
| `thrash_threshold` | `{ count, duration_ms, resume_delay_ms }` | Event-storm throttle: pauses reloads during bursts, then emits one authoritative reload |

### `[misc]`

| Setting | Default | Meaning |
| --- | --- | --- |
| `clipboard_delay_ms` | `20` | Delay before reading the clipboard |
| `append_mode_logging` | `false` | Append instead of overwrite `fist.log` |
| `tools_append_mode_logging` | `false` | Append `fist.tools.log` |
| `spawn_with` | `[]` | Wrappers for opened programs |
| `list_absolute_paths` | `false` | `--list` prints absolute paths |

### `[history]`

Documented in [History & the database](history-database.md): `lambda`, `refind`, `exclude`, `base_dir`, `show_missing`, `query_strategy`, `case_sensitive`, `resolve_symlinks`, plus `prune_max` / `prune_min`.

## The matchmaker layer

`mm.toml` — layout, preview, overlays, and keybindings — is covered on its own page: see [mm.toml](mm.toml.md).

## FAQ

**Where do I put a custom keybinding?**

`~/.config/fist/mm.toml` under `[binds]`, then check it with `fs :tool show-binds` or `fs :tool check`.

**How do I begin configuration?**

Start from the shipped defaults — every setting is optional. To inspect or save your fully resolved configuration (defaults merged with your file), pipe `--dump-config` to a file:

```shell
fs --dump-config > resolved.toml
```

That snapshot is a complete, current reference to copy settings from or diff against. (On a TTY, `--dump-config` also writes the config files back — useful for migrating schema changes, but it overwrites your formatting.)
