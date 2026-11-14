# lessfilter

`lessfilter` is f:st's file-handler dispatcher: given a preset name and a target path, it scores the path against that preset's rules in `~/.config/fist/lessfilter.toml` and runs the highest-scoring rule's actions.

## What it is

Three parts of f:st call into `lessfilter`:

- **The preview pane** — runs `fs :tool lessfilter preview <path>` whenever the cursor moves.
- **TUI display, edit, and open actions** — `Advance` on a file (`edit` preset), `LFPreview(preset)`, `LFPaged(preset)`, and `Lessfilter(preset)`.
- **The CLI and shell aliases** — `fs :tool lessfilter` (alias `lf`) and the shell aliases `l` (`display`), `la` (`extended`), `ll` (`info`), and `n` (`edit`).

Running `fs --dump-config` seeds `~/.config/fist/lessfilter.toml` with the shipped defaults.

## How a file gets its command

When `lessfilter` is called for a preset and path:

1. **Rule assembly** — `lessfilter` loads the rule list for the requested preset and appends the `default` preset's rules to the end.
2. **Metadata memoization** — permissions, file type, MIME type, built-in category, and directory children (or sibling filenames) are inspected once and cached for the path.
3. **Scoring** — every rule's pattern list is folded left to right to produce a score from `0` to `255`. Score `0` never matches; score `255` short-circuits immediately; ties go to the **first** rule that reached the winning score.
4. **Execution** — the winning rule's actions run according to its execution policy (`All`, `Abort`, or `Until`). If no rule scores above `0`, `lessfilter` exits with code `2`; if the winning rule's actions fail, it exits with code `1`.

## Presets

`lessfilter.toml` defines nine preset tables under `[rules]`:

| Preset | Alias | Purpose |
| --- | --- | --- |
| `preview` | `p` | Non-interactive preview pane inside the TUI |
| `display` | `d` | Standard terminal output (default when `<PRESET>` is omitted on the CLI; `l` shell alias) |
| `extended` | `x` | Detailed or paged terminal view (`la` shell alias, `alt-l` in TUI) |
| `info` | `i` | File and media metadata inspection (`ll` shell alias, `alt-i` in TUI) |
| `open` | `o` | System application launch (`ctrl-enter` / `alt-o` in TUI) |
| `edit` | `e` | Editor or directory visualizer (`n` shell alias, `Advance` on a file) |
| `alternate` | — | Custom user slot (`alt-8` in TUI) |
| `alternate2` | — | Second custom user slot |
| `default` | — | Fallback rules appended to the end of every other preset |

<video controls preload="none" poster="./images/previews.png" src="./images/previews.mp4"></video>

- **`default` fallback rules** — `default` is appended to every preset at dispatch and competes by score: the active preset's rule wins on a tie, while a higher-scoring `default` rule outranks a lower-scoring preset rule.
- **Opener presets** — in `open`, `alternate`, and `alternate2`, the built-in content actions (`Directory`, `Text`, `Image`, `Metadata`, `Application`) all defer to the system opener.

<video controls preload="none" poster="./images/info.png" src="./images/info.mp4"></video>

Invoke any preset directly from the shell:

```shell
fs :tool lessfilter info photo.jpg
fs :tool lf display --header=true -a --line-numbers src/main.rs
```

Pass `--header=true` or `--header=false` to force or suppress the file header, `--record=true` or `--record=false` to override history recording, and `-a` / `--arg` to forward extra arguments to the first custom action.

## Rules

Each entry in a preset array pairs an action list with a pattern list:

```toml
[rules]
preview = [
  # Short form: [actions, patterns]
  [["sqlite"], ["application/vnd.sqlite3", "have:sqlite3"]],

  # Long form with execution policy
  [{ kind = ["mediainfo", "Metadata"], execution = "Until" }, ["cat:image", "have:mediainfo"]],
]
```

When a rule lists multiple actions, `execution` chooses how they chain:

| Policy | Behavior |
| --- | --- |
| `"All"` (default) | Run every action in order; succeed if at least one action succeeds |
| `"Abort"` | Run actions in order and stop on the first failure |
| `"Until"` | Run actions in order and stop after the first action that succeeds |

Each rule starts at score `0` and folds its patterns left to right using score modifiers prefixed before `|`:

| Prefix | Modifier | Effect when the pattern matches |
| --- | --- | --- |
| `>n\|pat` or `n\|pat` | `Max(n)` | Set score to `max(score, n)` (`>\|pat` is `Max(1)`) |
| `<n\|pat` | `Min(n)` | Set score to `min(score, n)` |
| `+n\|pat` | `Add(n)` | Add `n` to score (`+\|pat` adds `1`, saturating at `255`) |
| `-n\|pat` | `Sub(n)` | Subtract `n` from score (`-\|pat` subtracts `1`) |
| `^\|pat` or `^pat` | `Req` | Keep current score if matched; **reset score to `0` if unmatched** |

Because patterns fold left to right, place positive-scoring patterns (`cat:image`, `ext:sqlite`) **before** `Req` patterns (`have:mediainfo`): a `Req` evaluated while the score is still `0` leaves the score at `0`.

Prefix a pattern with `!` (after any score modifier, as in `10|!cat:text` or `!have:bat`) to invert the match. Prefix with `\` to escape a literal leading modifier character.

When no score modifier is written, each pattern kind uses its default modifier:

| Pattern kind | Default score modifier |
| --- | --- |
| `application` (`app`) | `Max(60)` |
| `glob:` | `Max(50)` |
| `child:` | `Max(50)` |
| `ext:` (`.ext`) | `Max(30)` |
| `mime:` (`type/subtype`) | `Max(20)` |
| `cat:` (`category:`) | `Max(20)` |
| `*` | `Max(0)` |
| `have:`, `type:`, `git` | `Req` |

Because `ext:` defaults to `Max(30)` while `cat:` defaults to `Max(20)`, an `ext:` rule in `default` (`30`) will outrank an unmodified `cat:` rule in `preview` (`20`) unless you lower the `default` rule's score (`1|ext:...`) or raise the preset rule's score.

## Patterns

| Pattern | Matches |
| --- | --- |
| `glob:<glob>` | Full path matching the glob |
| `child:<glob>` | Directory entry (or sibling file when the target is a file) matching the glob |
| `ext:<ext>` or `.<ext>` | Case-insensitive file extension (`ext:` with an empty value matches extensionless files) |
| `mime:<type>/<sub...>` or `<type>/<sub...>` | Detected MIME type (`*` wildcards supported, such as `image/*`; directories have `directory/*`) |
| `cat:<name>` | Built-in file category or custom `[categories]` group |
| `application` (`app`) | Platform application (`.app` on macOS, `.desktop` / `.AppImage` on Linux, `.exe` on Windows) |
| `*` | Any path |
| `have:<prog>` | Executable `<prog>` is present on `PATH` |
| `type:<ft>` | Filesystem or content type: `f` (file), `d` (directory), `l` (symlink), `x` (executable), `b` (block device), `c` (char device), `s` (socket), `p` (pipe), `e` (empty), or `text` (text MIME or detected text encoding) |
| `git` | Path inside a git work tree |

## Categories

f:st ships 33 built-in categories usable with `cat:<name>` (and with `-t <name>` in the [Find pane](./find-pane#filetype-arguments)):

| Group | Built-in categories |
| --- | --- |
| Media & Graphics | `image`, `video`, `audio`, `lossless`, `subtitle`, `playlist`, `font`, `model`, `diagram` |
| Code & Text | `source`, `configuration`, `markdown`, `text`, `build`, `compiled`, `temp` |
| Documents & Data | `document`, `spreadsheet`, `presentation`, `ebook`, `academic`, `formula`, `database`, `metadata`, `geospatial`, `email` |
| Archives & System | `compressed`, `package`, `disk`, `rom`, `executable`, `crypto`, `other` |

You can define additional categories under `[categories]` in `lessfilter.toml` as lists of MIME strings or wildcards:

```toml
[categories]
structured = ["application/json", "application/yaml", "application/toml"]
```

Custom category names cannot shadow any of the 33 built-in category names (`fs :tool check` rejects collisions). Any group defined under `[categories]` also becomes available to `fs :: -t <group>`.

## Built-in actions

Nine built-in action names are recognized (case-sensitively):

| Action | Behavior by preset |
| --- | --- |
| `Directory` | Tree preview (`liza :u2` in `preview`, `:u` in `display`, `::nav :a` in `extended`, `:sba` in `info`, `$FS_VISUAL` / `$VISUAL` in `edit`) |
| `Text` | Syntax-highlighted text via the [pager](./pager) (`extended` and `info` append `Metadata`; `edit` opens `$FS_EDITOR` / `$EDITOR`) |
| `Image` | Inline graphics preview (`extended` adds header and `Metadata`; `info` shows `Metadata`; `edit` opens via system opener) |
| `Application` | Resolves `.app`, `.desktop`, or `.AppImage` icon and renders it (`liza :u2` fallback if no icon is found) |
| `Extract` | Extracts plain text from PDF and office documents with `kreuzberg` and streams it into the pager |
| `Metadata` | Prints `file -bL` description plus character/word/line counts for text files (and `liza :l` in `extended` / `info`) |
| `Open` | Launches the path with the OS default opener in every preset |
| `Header` | Prints a dim italic path header when standard output is piped |
| `None` | No-op that succeeds immediately |

## Custom actions

Define custom shell commands under `[actions]` in `lessfilter.toml`:

```toml
[actions]
sqlite = "sqlite3 -readonly {} '.schema'"
mediainfo = "mediainfo {}"
```

- Names are case-sensitive and must not collide with the nine built-in action names.
- Placeholders use the [output template](./output-templates) grammar in shell context (`{}` is shell-quoted by default).
- Extra arguments passed via `fs :tool lessfilter -a <ARG>` are appended to the first custom action that runs.
- Referencing an action name in `[rules]` that is not defined in `[actions]` logs a warning and skips that action without failing the rule.

## The editor and visualizer environment

When `lessfilter` runs from the TUI, matchmaker and f:st export context variables into the environment:

- **`MM_PREVIEW_COLUMNS` and `MM_PREVIEW_LINES`** (`COLUMNS` and `LINES`) — dimensions of the preview pane.
- **`HIGHLIGHT_LINE` and `HIGHLIGHT_COLUMN`** — 1-based match coordinates from the [Search pane](./search-pane#acting-on-a-match).
- **Editor resolution (`Text` in `edit`)** — checks `$FS_EDITOR`, then `$EDITOR`, falling back to the system opener. When `HIGHLIGHT_LINE` is set, f:st automatically passes the native line/column jump flag for `nvim`, `vim`, `hx`, `kak`, `nano`, `micro`, `emacs`, `zed`, `code`, `codium`, `subl`, `kate`, `geany`, and `notepad++`.
- **Visualizer resolution (`Directory` in `edit`)** — checks `$FS_VISUAL`, then `$VISUAL` (expanding `{}` templates when present, or appending the directory path otherwise), without line-jump flags.

## Images and graphics protocols

When rendering `Image` or `Application` inside the TUI preview pane, `lessfilter` emits an `<MM_IMAGE>` header with fit options, and matchmaker renders the image using the protocol configured under `[preview.image]` in `mm.toml`:

<video controls preload="none" poster="./images/image.png" src="./images/image.mp4"></video>

- **Auto-detection (`protocol = "auto"`)** — negotiates Kitty graphics, iTerm2 inline images, or Sixel, and falls back to Unicode halfblock characters (`"characters"`) when no pixel protocol is supported.
- **Fit and filter options** — `horizontal_fit` (default `"contain"`), `vertical_fit` (default `"crop"`), and scaling `filter` (default `"triangle"`).
- **Direct CLI runs** — when `fs :tool lessfilter display` runs directly in a terminal, `Image` delegates to `chafa` using the detected terminal graphics protocol.

## Paging and headers

- **`Text` and `pager.toml`** — the `Text` action formats files with `bat` using the options in [pager.toml](./pager) (`bat_opts`, `smart_changes`, and `PG_*` environment variables), streaming directly to stdout in the preview pane or opening the interactive `minus` pager when stdout is a terminal.
- **Headers (`--header` and `Header`)** — `--header=true` prints the file path header once before running any actions; `--header=false` suppresses all headers; omitting `--header` prints a header only when the winning rule includes the `Header` action (such as in `extended` and `info`).
- **Highlighting** — `HIGHLIGHT_LINE` is forwarded automatically as `bat --highlight-line`.

<video controls preload="none" poster="./images/paged.png" src="./images/paged.mp4"></video>

## History and recording

Under `[settings]` in `lessfilter.toml`, `tracked_presets` lists the presets that record a visit in the [history database](./history-database) when invoked directly:

```toml
[settings]
tracked_presets = ["edit", "alternate", "extended", "open"]
```

`preview`, `display`, and `info` are untracked by default because `preview` runs automatically on every cursor movement. Pass `--record=true` or `--record=false` on the CLI to override `tracked_presets` for a single call (the TUI passes `--record=false` and records completed foreground commands itself).

## Detection settings

`[settings] infer` in `lessfilter.toml` controls how MIME types and file categories are detected:

| Value | Detection method |
| --- | --- |
| `"file_format"` (default) | Magic-byte and container inspection via `file-format`, populating both `mime:` and built-in `cat:`, with extension fallback |
| `"infer"` | Magic-byte inspection via `infer` with extension fallback (`mime:` only) |
| `"guess"` | Extension lookup via `mime_guess` only (`mime:` only) |

Built-in `cat:<name>` patterns rely on the category produced by `"file_format"`; keep `infer = "file_format"` if your rules use `cat:`.

## Diagnosing a resolution

To see why a file resolves to a particular rule without executing anything, pass `--diagnose`:

```shell
fs :tool lessfilter preview --diagnose Cargo.toml
```

`--diagnose` prints the detected permissions, file type, MIME string, category, directory children, the winning rule and its action execution policy, the step-by-step `[PASS]` / `[FAIL]` score transitions for every pattern, and the final resolved command strategies.

## Ties to the panes

Three bind actions in [mm.toml](./mm.toml#binds) connect `lessfilter` presets to the active pane:

- **`LFPreview(preset)`** — switches the in-app preview pane to render `<preset>` (`alt-i` / `alt-/` toggles `info`; `alt-shift-i` / `alt-shift-/` toggles `display`). Pressing the same key again returns the preview pane to `preview`.
- **`LFPaged(preset)`** — runs `<preset>` on the cursor row and streams its output into the interactive [pager](./pager) (`alt-l` runs `extended`; `alt-8` runs `alternate`).
- **`Lessfilter(preset)`** — runs `<preset>` in the foreground (`alt-o` runs `open`; `alt-n` runs `edit` on the row's parent directory).
