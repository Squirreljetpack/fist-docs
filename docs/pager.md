# Pager

f:st includes a built-in terminal pager based on [minus](https://docs.rs/minus/latest/minus/) that wraps `bat` for syntax highlighting when installed, renders on `/dev/tty` so stdout stays clean for path printing, and exits immediately on empty non-file streams.

## When output gets paged

Output enters the pager from three places:

- **Bind and menu actions** — `ExecPaged`, `LFPaged(preset)`, and menu actions with `strategy = "ExecPaged"` stream standard output into the interactive pager on `/dev/tty`. Pressing `q` terminates the child process and returns to the active pane.
- **lessfilter presets** — the `Text` built-in action in `display`, `extended`, and `LFPaged` runs renders through the pager, while `preview` streams the same highlighted output into the preview pane.
- **`fs :tool pager`** — standalone CLI pager (alias `pg`) that can also serve as `$PAGER`.

<video controls preload="none" poster="./images/paged.png" src="./images/paged.mp4"></video>

## pager.toml

`~/.config/fist/pager.toml` configures both the embedded pager and `fs :tool pager`:

```toml
bat_opts = ["--color=always", "--style=rule"]
line_numbers = false
horizontal_scroll = false
smart_case = true
smart_changes = true
display_directory = ["fs", ":tool", "liza", ":u2", "--", "{}"]
```

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `bat_opts` | array of strings | `["--color=always", "--style=changes"]` | Arguments passed to `bat` (commenting out disables `bat`) |
| `line_numbers` | bool | `false` | Show line numbers in the pager |
| `prompt` | string | none | Custom footer prompt text |
| `horizontal_scroll` | bool | `false` | Enable horizontal scrolling on start (`ctrl-h` toggles at runtime) |
| `smart_case` | bool | `true` | Case-insensitive search unless the query contains uppercase letters |
| `smart_changes` | bool | `false` (`true` in shipped config) | Append `--style=+changes` or `--style=-changes` based on unstaged git changes |
| `copy_on_select` | bool | `false` | Copy mouse selections immediately on button release |
| `display_directory` | array of strings | `["fs", ":tool", "liza", ":u2", "--", "{}"]` | Command argv run when given a directory (`{}` expands to the raw path) |

When `bat` is not on `PATH`, text streams directly into the pager without syntax highlighting.

## `fs :tool pager +OFFSET`

`fs :tool pager` (alias `pg`) pages a file, a directory (via `display_directory`), or standard input when no path is given:

```shell
fs :tool pager Cargo.toml
fs :tool pager +120 src/main.rs
fs :tool pager +50p src/main.rs
fs :tool pager +F /var/log/syslog
fs :tool pager +200F /var/log/syslog
```

An initial `+OFFSET` argument controls where the pager opens:

| Offset | Meaning |
| --- | --- |
| `+N` | Open with 1-based line `N` at the top of the screen |
| `+Np` | Open `N` percent into the file (requires a file path) |
| `+F` | Jump to the end of the file and follow new lines (`ctrl-f` toggles) |
| `+NF` | Load only the last `N` lines, then follow new output |

Passing `-C <NUM>` pads `+N` with `NUM` lines of leading context above the target line. See `fs :tool pager --help` for all flags.

## Env vars

Environment variables override `pager.toml` per invocation and are also read by paged [lessfilter](./lessfilter) actions:

| Variable | Effect |
| --- | --- |
| `PG_RAW=true` | Bypass `bat` and stream raw input into the pager |
| `PG_FLAGS` | Comma-separated `bat` flags replacing `bat_opts` (`,,` escapes a literal comma) |
| `PG_LANG` | Language override passed as `bat -l <value>` |
| `PG_FILENAME` | File name hint passed as `bat --file-name <value>` when paging stdin |
| `HIGHLIGHT_LINE` | 1-based line number passed as `bat --highlight-line <value>` |

## minus keybindings

| Key | Action |
| --- | --- |
| `q`, `ctrl-c` | Quit the pager and return to f:st |
| `j` / `Down`, `k` / `Up` | Scroll one line (prefix a count to repeat) |
| `space`, `pagedown` / `pageup` | Scroll one full page |
| `d`, `ctrl-d` / `u`, `ctrl-u` | Scroll half a page down or up |
| `g` / `G` | Jump to top, bottom, or prefixed line `N` |
| `h` / `Left`, `l` / `Right` | Scroll horizontally |
| `ctrl-l` | Toggle line numbers |
| `ctrl-f` | Toggle follow mode |
| `ctrl-h` | Toggle line wrapping / horizontal scroll |
| `/`, `?` | Search forward or backward |
| `n`, `p` | Jump to next or previous search match |

## Files

- `~/.config/fist/pager.toml` — user pager configuration.
- `assets/config/pager.toml` — shipped defaults written by `fs --dump-config`.

Next: [lessfilter](./lessfilter) · [config.toml](./configuration) · [Tools](./tools)
