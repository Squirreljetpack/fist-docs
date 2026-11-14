# mm.toml

`mm.toml` configures the matchmaker UI layer: the results table, preview layouts, terminal dimensions, overlays, and key bindings. Application logic lives in [config.toml](./configuration).

| File | Purpose |
| --- | --- |
| `config.toml` | Pane behavior, history, transfers, watcher, path styles — see [config.toml](./configuration) |
| `mm.toml` | Columns, previews, TUI layout, overlays, key bindings |

Because `mm.toml` uses matchmaker's configuration schema, this page covers the sections specific to f:st. For shared matchmaker tables—`[ui]`, `[query]`, `[results]`, `[status]`, `[preview]`, `[preview.image]`, `[header]`, `[footer]`, `[tui]`, `[overlay]`, `[previewer]`, and `[help]`—consult the [matchmaker configuration reference](https://squirreljetpack.github.io/matchmaker-docs/configuration).

## Binds

`[binds]` maps keys, mouse events, and lifecycle triggers to bind actions or action sequences. Bindings defined here merge over the built-in keymap; run `fs :tool showbinds` to inspect the resolved bindings after overrides.

```toml
[binds]
"tab" = ["ToggleSelection", "Down"]
"nav^^alt-n" = "Execute($EDITOR .)"
```

Mode prefixes before `^^` scope a binding to a pane or state (`nav`, `find`, `search`, `files`, `dirs`, `app`, `custom`, `stash`, `in_prompt`, `locked_prompt`). For the full list of bind actions and trigger syntax, see [actions.md](https://github.com/Squirreljetpack/fist/blob/main/user_docs/actions.md).

## Preview layouts

`[[preview.layout]]` declares the preview geometries cycled by `SwitchPreviewLayout` (`?`) and indexed by `preview_layout_index` in [config.toml](./configuration):

```toml
[[preview.layout]]
side = "right"
percentage = 40
min = 30
max = 120

[[preview.layout]]
side = "top"
percentage = 50
min = 5
max = 50
```

## Overlays

### Queue and app views

`[queue]` styles the [queue overlay](./queue); `[app]` styles the app pane's pending-files overlay. Both tables accept the same keys:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `frame` | frame | inherits `[overlay].frame` | Border and padding |
| `column_spacing` | integer | `2` | Spaces between columns |
| `cell` | style | default | Normal cell style |
| `current_style` | style | black background | Highlight style of the cursor row |
| `selected_style` | style | yellow foreground | Style of marked rows |
| `editing_style` | style | black background | Style of the cell being edited |
| `editing_row_style` | style | default | Style of non-edited cells on the row being edited |

### Options

`[options]` styles the options overlay (`alt-p`):

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `frame` | frame | title `Options` | Outer border and padding |
| `item_fg` | color | `"DarkGray"` | Foreground color of option labels |
| `item_modifier` | modifier | none | Text modifiers on option labels |
| `alignment` | alignment | left | Column alignment |

`[options.filter]`, `[options.sort]`, and `[options.pane]` style the three inner columns and each accept `frame` and `alignment`.

### Prompt

`[prompt]` styles the text-entry overlay used by actions such as `New`, `Rename`, and `Set alias`:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `frame` | frame | all sides | Border and padding |
| `scroll_padding_left` | integer | `3` | Minimum characters kept visible to the left of the caret |

### Menu

`[menu]` styles the action menu overlay (`alt-e` / `ctrl-e`):

<video controls preload="none" poster="./images/action.png" src="./images/action.mp4"></video>

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `frame` | frame | title `Menu`, all sides, padding `2,2,0,1` | Border and padding |
| `no_default_aliases` | bool | `false` | Hide built-in key aliases on builtin rows while keeping custom action aliases |
| `compact` | bool | `false` | Omit `Move`, `Copy`, `Open`, and `Trash` from the menu |
| `min_width` | integer | `16` | Minimum overlay width |
| `min_height` | integer | `12` | Minimum overlay height |
| `[menu.results]` | table | `min_width_from_cols = false` | Matchmaker results table settings for the menu list |

### Confirmation

`[confirm]` styles destructive confirmation overlays:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `frame` | frame | all sides, white border, padding `2,2,0,1` | Outer border and padding |
| `content_frame` | frame | light double-dashed border | Inner frame around listed target paths |
| `button_fg` / `button_bg` | color | reset | Unfocused button colors |
| `selected_fg` / `selected_bg` | color | black on white | Focused button colors |
| `hotkey_modifier` | modifier | `BOLD` | Modifier applied to button hotkey letters |
| `options_alignment` | alignment | center | Button row alignment |
| `options_gap` | integer | `2` | Horizontal gap between buttons |

### Mounts

`[mount]` styles the mount overlay:

| Key | Type | Default | Meaning |
| --- | --- | --- | --- |
| `frame` | frame | title `Mounts`, all sides, padding `2,2,0,1` | Border and padding |
| `[mount.results]` | table | `min_width_from_cols = false` | Matchmaker results table settings |

### Locked prompt

`[query_locked]` overrides the query bar and status line while the prompt is locked (see [Prompt locking](./navigation-in-depth#prompt-locking)):

```toml
[query_locked.query]
frame = { sides = "BOTTOM", fg = "red" }

[query_locked.status]
# partial [status] settings
```

`[query_locked.query]` accepts any partial `[query]` configuration and `[query_locked.status]` any partial `[status]` configuration.

## Defaults

At startup, f:st applies several defaults on top of raw matchmaker settings:

- Overlay frames (`[queue]`, `[app]`, `[options]`, `[menu]`, `[confirm]`, `[mount]`) inherit `[overlay].frame` when omitted.
- When no `[[preview.layout]]` is configured, f:st installs a right-side preview layout (70% initial size) backed by the `preview` lessfilter preset.
- Unless `--fullscreen` is passed, `[tui].layout` defaults to `60%` height when unset.
