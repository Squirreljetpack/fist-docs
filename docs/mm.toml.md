# mm.toml

`mm.toml` configures the **matchmaker** UI layer on top of f:ist's pane model: layout, preview, overlays, and keybindings. It is one of the TOML files f:ist reads (see [Configuration](configuration.md)); `--mm-config <path>` selects a different file, and `fs :tool check` validates everything including every bind.

Below is the complete set of options matchmaker understands. For what each one does, the up-to-date definitions live in the matchmaker documentation: [matchmaker-docs/configuration](https://squirreljetpack.github.io/matchmaker-docs/configuration). This page only lists them, so you can see what exists and where it goes.

## Available options

Each row is a section you can put in `mm.toml`, together with the options (and their short aliases) that section accepts.

| Section | Options |
| --- | --- |
| `[start]` | `command` (`x`, `cmd`), `input_separator` (`is`, `n`), `output_separator` (`os`), `output_template` (`ot`, `o`), `on_accept`, `sync`, `additional_commands` (`ax`), `mode`, `directory` (`d`), `save_orphans`, `skip_invalid_lines`, `shell` |
| `[exit]` | `first`, `allow_empty`, `abort_empty`, `last_key_path` |
| `[matcher]` | `normalize`, `ignore_case`, `prefer_prefix`, `match_paths`, `trim` (`t`), `ansi` (`a`), `sanitize`, `require_column`, `raw`, `track` — plus `[matcher.sort]`: `reverse`, `mode`, `column`, `threshold` |
| `[columns]` | `split` (`s`), `names` (`n`), `max_columns` (`max`), `default` (`i`) |
| `[ui]` | `tick_rate`, `mouse_events`, `mouse_scroll_debounce_ms`, `border` |
| `[query]` | `prompt`, `initial`, `style`, `prompt_style`, `scroll_padding`, `cursor`, `border`, `reset_cursor_on_query_change`, `word_boundaries` |
| `[results]` | `multi_prefix`, `default_prefix`, `current_prefix`, `multi`, `style`, `inactive_style` (`inactive`), `inactive_current_style`, `match_style` (`match`), `current_style` (`current`), `prefix_style` (`prefix`), `inactive_prefix_style` (`inactive_prefix`), `row_connection`, `scroll_wrap` (`cycle`), `scroll_padding` (`sp`), `reverse` (`r`), `wrap` (`w`), `width_overrides`, `min_width`, `min_width_from_cols`, `column_spacing`, `right_align_last`, `active_column_min_percentage_hint` (`acp`), `max_height`, `show_skipped`, `vscroll_current_only`, `uniformly_truncate_columns`, `vertical`/`stacked_columns` (`v`), `separator` (`hr`), `separator_style`, `autoscroll` (`a`: `enabled`, `initial_preserved`, `context`, `end`, `always`), `resize_col_thresholds` (`rct`), `border` |
| `[status]` | `style`, `show`, `match_indent`, `template`, `row_connection`, `interactions` |
| `[header]` / `[footer]` | `content` (`h`), `style`, `match_indent`, `wrap`, `row_connection`, `interactions`, `border` — header also adds `header_lines` |
| `[preview]` | `show`, `scroll_wrap`, `wrap`, `layout` (`l`), `border`, `initial` (`i`), `initial_layout`, `trim_ends`, `reevaluate_show_on_resize`, `drag_width` |
| `[[preview.layout]]` | per layout: `command` (`x`, `px`), `side`, `percentage`, `min`, `max`, `scroll`, `border` |
| `[previewer]` | `try_lossy`, `delay_clear`, `debounce_ms`, `max_procs`, `always_trigger`, `shell`, `trim_commands`, `help` (`colors`, `seq_brackets`, `hide_semantic`, `quote_traces`, `max_item_len`, `ellipsize_center`, `event_trigger_prefix`, `show_events`, `sort_fn_last`, `combine_keys`), `cache` |
| `[pager]` | `line_numbers` (`ln`), `follow`, `prompt`, `horizontal_scroll` |
| `[tui]` | `stream`, `restore_fullscreen`, `extended_keys`, `sleep_ms`, `clear_on_exit`, `clear_after_execute`, `layout` (`percentage`, `min`, `max`), `osc52`, `copy_trailing_newline` |
| `[overlay]` | `border`, `outer_dim`, `layout` (`percentage`, `min`, `max`, `y_offset`) |
| `[envs]` | arbitrary `name = value` pairs injected into spawned commands |
| `[binds]` | keys mapped to actions — see [Keybindings](#keybindings) |

### Shared blocks

Some options are structured blocks that recur across sections:

- **`style`** — `fg`, `bg`, `modifier`.
- **`border`** — `type`, `color`, `bg`, `sides`, `padding`, `title`, `title_modifier`, `modifier`.

## Keybindings

The `[binds]` table maps keys to actions. It defaults to the shipped set, and anything you write here overrides a matching default. Actions come from two places:

- **f:ist's built-in file actions**, for example `ToggleHidden`, `Find`, `CopyPath`.
- **matchmaker's own builtins**, such as `Accept`, `Down`, `HScroll`, `AutoJump`, `LockPrompt`.

A single key can trigger one action, or a chain of several run in order. The value is a string for one action, or an array for a chain:

```toml
[binds]
"ctrl-f" = "Find"                    # a single action
"tab" = ["ToggleSelection", "Down"]  # two actions, run in order
"alt-s" = "PushStash"                # your own bind overrides the default
```

Some actions take an argument, written in parentheses after the name:

```toml
"ctrl-2" = "AutoJump(2)"         # jump to the second result
"alt-b" = "PushStash(bookmark)"  # push onto a named stash
"alt-8" = "LFPaged(Alternate)"   # a specific lessfilter preset
```

To see the *fully resolved* map — every key with the action or actions it fires, defaults and your overrides merged — run:

```sh
fs :tool show-binds
```

The in-app help (`Alt-h`) shows the same list.

### Keys that need terminal enhancement

A few keys require **keyboard enhancement** (CSI-u) for the terminal to report them at all. They're flagged that way in the shipped `mm.toml`:

- `Ctrl-[` and `Ctrl-]`
- `Ctrl-Shift-Z`
- `` Ctrl-` ``
- `Ctrl-Esc`

On terminals without CSI-u these keys are often indistinguishable from ordinary letters. Where an `Alt-`-prefixed variant exists, use that instead (for example `Alt-Z` for redo, or `` Alt-` `` for jump).

A reference of the binds that belong to matchmaker lives here: [matchmaker-docs/binds-and-actions](https://squirreljetpack.github.io/matchmaker-docs/binds-and-actions).
