# Lua

f:st embeds a Lua 5.4 runtime with built-in filesystem, process, formatting, and interactive input modules. You use it in two places: [menu actions](./menu-actions) under `actions/` and row transforms in the [custom pane](./custom-pane#transforming-rows-with-lua) (`--transform`).

## Modules

Every Lua execution context pre-injects six modules, available both as globals (`path.join(...)`) and through `require("<name>")`.

### `path`

Path inspection and manipulation without touching the filesystem (except `exists`, `lexists`, `is_file`, `is_dir`, `is_empty`, and `mime`):

| Function | Return type | Meaning |
| --- | --- | --- |
| `path.parent(p)` | `string` | Parent directory (`/` for root, `.` for a bare file name) |
| `path.base(p)` | `string` | Final path component |
| `path.stem(p)` | `string` | File name without its final extension (`foo.tar.gz` → `foo.tar`) |
| `path.ext(p)` | `string` | Final extension without the leading dot (`""` when absent) |
| `path.join(...)` | `string` | Path components joined with the platform separator |
| `path.exists(p)` | `bool` | Whether `p` exists after following symlinks |
| `path.lexists(p)` | `bool` | Whether `p` exists without following symlinks (true on broken symlinks) |
| `path.is_file(p)` | `bool` | Whether `p` is a regular file |
| `path.is_dir(p)` | `bool` | Whether `p` is a directory |
| `path.is_empty(p)` | `bool` | Whether a file is 0 bytes or a directory has no entries |
| `path.rel(target, base)` | `string \| nil` | Path of `target` relative to `base` |
| `path.mime(p)` | `string` | Detected MIME type string (such as `"image/png"`) |

### `fs`

Filesystem reads, writes, metadata, and trash operations:

| Function | Return type | Meaning |
| --- | --- | --- |
| `fs.stat(p)` | `table \| nil` | Metadata table `{ size, is_file, is_dir, is_symlink, readonly, mtime, mode, executable }` |
| `fs.chmod(p, mode)` | `bool` | Change permissions (`0o755`, `"755"`, `"+x"`, or `"-x"`) |
| `fs.mkdir(p, [recursive=true])` | `bool` | Create a directory |
| `fs.readdir(p)` | `table` | Array of entry names inside directory `p` |
| `fs.read(p)` | `string` | Read entire file as a string |
| `fs.write(p, content)` | `bool` | Write string contents to `p` |
| `fs.remove(p, [recursive=false])` | `bool` | Permanently delete a file or directory |
| `fs.copy(src, dst)` | `bool` | Copy a file from `src` to `dst` |
| `fs.rename(src, dst)` | `bool` | Rename or move `src` to `dst` |
| `fs.symlink(src, dst)` | `bool` | Create a symlink at `dst` pointing to `src` |
| `fs.readlink(p)` | `string` | Read the target of symlink `p` |
| `fs.canonicalize(p)` | `string` | Resolve all symlinks and relative segments |
| `fs.trash(path_or_paths)` | `bool` | Move a path string or array of paths to the system trash |
| `fs.tempdir([prefix])` | `string` | Create and return a temporary directory path |
| `fs.tempfile([prefix])` | `string` | Create and return a temporary file path |

```lua
local st = fs.stat(paths[1])
if st and not st.executable then
  fs.chmod(paths[1], "+x")
end
```

### `proc`

Direct subprocess execution without a shell:

| Function | Return type | Meaning |
| --- | --- | --- |
| `proc.run(prog, [args], [opts])` | `table` | Run and wait; returns `{ ok, code, stdout, stderr }` |
| `proc.spawn(prog, [args], [opts])` | `table` | Spawn detached; returns `{ ok, pid }` |
| `proc.has(prog)` | `bool` | Whether `prog` is on `PATH` |
| `proc.editor([path])` | `table` | Run `$FS_EDITOR` / `$EDITOR` / `nano` on `/dev/tty`; returns `{ ok, code, editor }` |

`opts` accepts `cwd` (working directory string), `env` (table of environment variables), and `stdin` (string piped to standard input):

```lua
if proc.has("ffmpeg") then
  local res = proc.run("ffmpeg", {"-y", "-i", paths[1], out_file}, { cwd = "/tmp" })
  if not res.ok then
    error("ffmpeg failed (" .. res.code .. "): " .. res.stderr)
  end
end
```

### `util`

Serialization, timestamps, clipboard access, and shell quoting:

| Function | Return type | Meaning |
| --- | --- | --- |
| `util.sleep(ms)` | `nil` | Sleep for `ms` milliseconds |
| `util.uuid()` | `string` | Random v4 UUID |
| `util.timestamp([fmt])` | `string` | Current time as ISO 8601 (default), `"unix"`/`"epoch"`, `"ms"`, or `strftime` format |
| `util.json_encode(value)` | `string` | Serialize a Lua value to JSON |
| `util.json_decode(text)` | `value` | Parse JSON into a Lua value |
| `util.toml_encode(table)` | `string` | Serialize a table to TOML |
| `util.toml_decode(text)` | `value` | Parse TOML into a table |
| `util.clipboard_get()` | `string \| nil` | Read text from the system clipboard |
| `util.clipboard_set(text, [opts])` | `nil` | Copy text to the clipboard (`{ toast = false }` suppresses the toast) |
| `util.shq(str)` | `string` | POSIX shell-quoted string |

### `input`

Interactive prompts drawn over `/dev/tty`. `input` is available only in foreground menu strategies (`Exec` and `ExecWait`); in background or queued runs, `input` is `nil`.

| Function | Return type | Meaning |
| --- | --- | --- |
| `input.prompt(msg, [default])` | `string \| nil` | Read a line of text, falling back to `default` when empty |
| `input.confirm(msg, [default])` | `bool` | Yes/no confirmation prompt |
| `input.select(items, [prompt])` | `string \| nil` | Fuzzy picker over `items`; returns `nil` on cancel |

```lua
local choice = input.select({"webp", "png", "avif"}, "Format:")
if not choice then return end
```

### `lunacolors`

ANSI color and style helpers for terminal and paged output:

```lua
print(lunacolors.bold("Header"))
print(lunacolors.green("Done: ") .. paths[1])
print(lunacolors.format("{bold}{yellow}Warning:{reset} file exists"))
```

Colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `brightBlack` (`gray`), `brightRed`, `brightGreen`, `brightYellow`, `brightBlue`, `brightMagenta`, `brightCyan`, `brightWhite`, plus `<color>Bg` background variants. Modifiers: `bold`, `dim`, `italic`, `underline`, `invert`, `hidden`, `strikethrough`.

## Globals

When running a [menu action](./menu-actions), f:st populates context globals alongside the `...` chunk arguments:

| Global | Type | Meaning |
| --- | --- | --- |
| `paths` | `table` | Array of targeted absolute paths |
| `to` | `string` | Destination directory (empty for immediate menu runs; populated for queued runs) |
| `nav_cwd` | `string` | Active Nav pane working directory |
| `toast(style, msg)` | function | Emit a footer toast (`"info"`, `"success"`, `"warning"`, `"error"`, `"normal"`) |
| `toast_push(style, prefix, item)` | function | Append an item to a grouped summary toast |
| `set_progress(n)` | function | Set the queue row progress gauge from `0` to `255` (queued strategies only) |
| `os.exit(code)` | function | Stop the Lua chunk with `code` without terminating `fs` |
| `error(msg)` | function | Abort the chunk and show an error toast |

## Custom stream transforms

Passing `--transform <LUA>` (or `@file.lua`) to `fs :custom` or `fs` runs a Lua chunk once per row with `local path, tail = ...` and expects `return path, display, tail`. Returning `nil` as the first value drops the row; see [Transforming rows with Lua](./custom-pane#transforming-rows-with-lua) for the full contract and examples.
