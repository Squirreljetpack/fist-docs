# Output templates

Output templates substitute `{…}` placeholders in strings that describe the current row, the active selection, or the current directory. You reach for them when writing command bindings in [mm.toml](./mm.toml), custom rules in [lessfilter](./lessfilter), `--format` strings on the command line, or prompt templates in [config.toml](./configuration).

## Where templates expand

A single template grammar is shared across f:st, while the surrounding context decides whether paths are shell-quoted or raw and whether row-level fields (`{t}`, `{#}`, `{+}`) are populated.

| Context | Location | Default path quoting | Available data |
| --- | --- | --- | --- |
| Command actions | `Execute`, `ExecPaged`, `ExecTTY`, `ExecDetached`, `ExecSilent`, `CopyCommand`, `CopyCommandAsync` in `mm.toml`; custom `[actions]` in `lessfilter.toml` | Shell-quoted | Target path, tail, index, multi-selection |
| Previews | Preview `command` and `layout.command`, `Preview(...)`, `SetPreview` | Shell-quoted | Target path, tail, index, multi-selection |
| Printed output | `--format` and `Print(...)` | Raw | Printed row's path and tail (expanded once per printed row) |
| Listings | `--list` and `fs :info --format` | Raw | Path only (`{t}` and `{#}` stay literal) |
| lessfilter | Action commands in `lessfilter.toml` | Shell-quoted | Path only (`{t}` and `{#}` stay literal) |
| Cwd prompt | `[interface] cwd_prompt` in `config.toml` | Raw | Current directory path with `~` collapsed |
| Pager directory | `display_directory` in `pager.toml` | Raw (argv) | Directory path |

## Grammar

Every placeholder has the shape `{ body }` and performs one operation with at most one delimiter. An empty body `{}` expands to the row's path using the context's default quoting.

Component slices take the form `S<delim>E`, where `S` and `E` are optional signed integers:

- Positive indices count forward from the first path component.
- Negative indices count backward from the end (`-1` is the basename).
- `0` or an empty `E` means "to the end of the path".

| Body | Meaning |
| --- | --- |
| *(empty)* | Whole path using context default quoting |
| `S:E` | Component slice of the path, shell-quoted |
| `S=E` | Component slice of the path, raw |
| `S.E` | Component slice of the current directory, raw |
| `S~E` | Truncated display path (`head…/tail`), raw |
| `S+E` | Component slice of every selected row, context default quoting |
| `t`, `tail` | Tail column of the current row, raw |
| `+t`, `+tail` | Tail column of every selected row, raw |
| `#` | 0-based index of the current row, raw |
| `+#` | 0-based index of every selected row, raw |

## Path values

When both `S` and `E` are omitted, the delimiter alone selects the quoting for the entire path:

- `{}` uses the context's default quoting (shell-quoted in command, preview, and lessfilter contexts; raw in output, listing, cwd prompt, and pager argv contexts).
- `{:}` forces POSIX shell quoting in any context.
- `{=}` forces raw, unquoted output in any context.

## Component ranges

`S:E` slices path components and shell-quotes the result; `S=E` slices the same components without quoting.

For a row at `/home/you/docs/report.md`:

| Template | Expansion |
| --- | --- |
| `{0:-1}` | `'/home/you/docs'` |
| `{-1:0}` | `'report.md'` |
| `{-1=0}` | `report.md` |
| `{1:3}` | `'home/you'` |
| `{0=0}` | `/home/you/docs/report.md` |

## The current directory

`S.E` slices components from the pane's current working directory instead of the cursor row and always emits raw text. `{.}` expands to the entire working directory path, `{-1.}` to its basename, and `{1.3}` to components 1 through 2.

## Truncation

`S~E` keeps the first `S` components and the last `E` components of the row's path and joins them with `…/`, emitting raw text. If the path has `S + E` or fewer components, the full path is emitted unchanged. Negative indices are not supported with `~`.

For `/home/you/docs/report.md`, `{2~2}` expands to `/home…/docs/report.md` and `{1~1}` expands to `/…/report.md`.

## Multi-selection

Replacing the range delimiter with `+` expands the placeholder against every selected row and joins the results with a single space. When no rows are selected, `+` falls back to the current row.

| Template | Expansion for `a/first.txt` and `b/second.txt` |
| --- | --- |
| `{+}` | `a/first.txt b/second.txt` (quoted in shell contexts) |
| `{0+1}` | `a b` |
| `{-1+0}` | `first.txt second.txt` |
| `{+t}` | Tail of each selected row |
| `{+#}` | `0 1` |

Because a placeholder allows only one delimiter, `+` cannot be combined with `=`, `:`, or `~`; `{+=}` and `{+~2:2}` are not valid placeholders.

## The tail column

`{t}` (or `{tail}`) expands to the second column of the current row: match context in the search pane, an alias in history or stash panes, or the third return value of a Lua `--transform`. Because it carries arbitrary text rather than a path, `{t}` is always emitted raw; wrap it in quotes in the template when passing it as a single shell argument.

In contexts without a live row—`--list`, `fs :info`, lessfilter commands, `cwd_prompt`, and commands run while the cursor is disabled in the prompt—`{t}` stays literal.

## The index

`{#}` expands to the 0-based index of the current row in the live results list, always raw. It requires a live results table; in `--format`, `--list`, lessfilter, and `cwd_prompt` contexts, `{#}` stays literal.

## Output templates

On the command line, `--format` and the `Print(...)` bind action expand their template once per printed row rather than once for the whole selection:

```shell
fs --list --format '{-1=0}\t{0=-1}'
```

Because each expansion sees a single printed row, `{t}` resolves to that row's tail, `{+}` sees only that row, and `{#}` remains literal. Rows are joined by `--output-sep` (default `\n`), which decodes standard C escapes (`\n`, `\t`, `\0`, `\\`).

## Listing templates

Non-interactive listings (`fs --list --format` and `fs :info --format`) stream paths without constructing a two-column results table. Path slices (`{}`, `{:}`, `{=}`, `S:E`, `S=E`, `S.E`, `S~E`) expand normally, while `{t}` and `{#}` stay literal.

## The cwd prompt template

When the cursor is moved into the prompt, the query bar displays `[interface] cwd_prompt` from [config.toml](./configuration) (default `"{=} "`). In this context `{}` is the pane's current working directory with your home directory collapsed to `~`, emitted raw; use `{:}` when you want shell quotes around the directory path.

<video controls preload="none" poster="./images/prompt.png" src="./images/prompt.mp4"></video>

## The pager directory template

When `fs :tool pager` is given a directory path, it runs `display_directory` from [pager.toml](./pager):

```toml
display_directory = ["fs", ":tool", "liza", ":u2", "--", "{}"]
```

Each element is passed directly in `argv` without a shell, so `{}` expands to the raw directory path. Use `{:}` only if the target program expects literal quote characters.

## Escaping and literals

- Escape an opening brace with `\{` to emit a literal `{` (for example, `find . -exec echo \{}` in a shell command).
- Standard C escapes (`\n`, `\t`, `\r`, `\0`, `\"`, `\\`) are decoded outside and inside templates.
- Unmatched braces, nested braces, and unrecognized bodies (`{foo}`, `{a:b}`) are emitted verbatim so typos remain visible.
- Status lines, footers, and help headers use matchmaker display templates (`\m`, `\t`, `{red:text}`), not output templates; see [mm.toml](./mm.toml).

Next: [Command line](./command-line) · [lessfilter](./lessfilter) · [mm.toml](./mm.toml)
