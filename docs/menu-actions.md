# Menu actions

Menu actions are contextual Lua commands listed in the menu overlay (`alt-e` / `ctrl-e`). They are declared as TOML tables keyed by action name in `~/.config/fist/actions.toml` and any `*.toml` files under `~/.config/fist/actions/`, merged in filename order.

An action's table key serves two roles:

- The **queue kind** used by `Enqueue(key)`, `ExecuteQueue(key)`, and `ClearQueue(key)` in [mm.toml](./mm.toml).
- The label suffix shown in the menu: `{prefix}: {key}`.

The built-in queue kinds (`copy`, `move`, `symlink`, `extract`, `none`), the queue selectors (`all`, `builtins`, `first`, `last`), and the empty string are reserved and rejected by `fs :tool check`.

## Fields

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `command` | string | required | Inline Lua chunk or `@file` script path |
| `prefix` | string | `":"` (file stem) | Menu group prefix (`""` omits the prefix) |
| `alias` | string | none | Shortcut hint shown in the menu's second column |
| `help` | string | `""` | Description shown under Action Guidance in the menu help |
| `strategy` | string | `"ExecSilent"` | Execution mode |
| `condition` | list or table | unconditional | Target and tool requirements for the row to appear |
| `requires_dest` | bool | `false` | Require a non-empty destination before a queued row can run |
| `close` | bool | strategy default | Override whether running the action closes the menu overlay |

### Prefixes

Each menu row renders as `{prefix}: {key}`. The default prefix `":"` is replaced at load time with the stem of the defining file (`actions/compress.toml` → `compress`), grouping each file's actions together. Setting `prefix = ""` renders the bare key. Duplicate `{prefix}: {key}` labels are rejected by `fs :tool check`.

`@file` commands load a `.lua` file from disk; relative paths resolve against `~/.config/fist/actions/`.

## Strategies

| Strategy | Waits | Closes menu | Effect |
| --- | --- | --- | --- |
| `Exec` | yes | yes | Run in foreground with `/dev/tty` attached |
| `ExecWait` | yes | yes | Run in foreground, then wait for `Enter` before resuming the TUI |
| `ExecSilent` | no | yes | Run asynchronously in a background worker |
| `ExecPaged` | yes | yes | Stream standard output into the interactive [pager](./pager) |
| `Queue` | no | no | Enqueue all target paths as a single multi-path queue row |
| `QueueBatch(n)` | no | no | Enqueue target paths in rows of at most `n` paths each |
| `Enqueue` | no | yes | Enqueue all target paths as one row and dispatch it immediately |

<video controls preload="none" poster="./images/compress.png" src="./images/compress.mp4"></video>

`Queue`, `QueueBatch`, and `Enqueue` create rows in the [queue](./queue) whose kind is the action's key. `requires_dest = true` is valid only with `Queue` and `QueueBatch`, because `Enqueue` dispatches immediately with an empty destination.

## Lua environment

Each invocation runs in a fresh Lua 5.4 state with all standard f:st modules (`path`, `fs`, `proc`, `util`, `input`, `lunacolors`) and the action globals (`paths`, `to`, `nav_cwd`, `toast`, `toast_push`, `set_progress`). See [Lua](./lua) for module signatures and return values.

## Conditions

An action appears in the menu when at least one of its conditions matches the current target state. Conditions are evaluated once when the menu opens; any condition requiring an external binary (`have:prog`) that is not on `PATH` is stripped when configuration loads.

Conditions take either a positional array or a scoped table:

### Positional sequence

An array of rule strings matches when the selection count equals the array length and the *i*-th selected row satisfies the *i*-th rule:

```toml
condition = ["type:f", "type:f"]
```

Wrap multiple sequences in an outer array to allow alternatives:

```toml
condition = [["type:text", "type:text"], ["type:text", "type:d"]]
```

### Scoped rule table

A table `{ selected = "...", condition = "...", strict = bool }` selects which paths are tested and requires every path in that target set to match `condition`:

| `selected` | `strict = false` (default) | `strict = true` |
| --- | --- | --- |
| `"cursor"` (default) | Cursor row (ignores selections) | Cursor row only when nothing is selected |
| `"cwd"` | Pane working directory while the cursor is disabled in the prompt | Active Nav pane working directory regardless of cursor state |
| `n` (integer) | At least `n` selected rows | Exactly `n` selected rows |
| `"active"` | Selected rows if any, else cursor row, else working directory | Resolved target set has exactly 1 path |

### Rule syntax

| Rule | Matches |
| --- | --- |
| `ext:rs` or `.rs` | File extension (`rs`) |
| `glob:*.rs` | Full path matching glob |
| `child:Cargo.toml` | Directory (or file's parent) containing a matching child |
| `mime:image/*` | MIME type or wildcard |
| `type:f`, `type:d`, `type:l`, `type:x`, `type:text` | Regular file, directory, symlink, executable, or text file |
| `have:prog` | Executable `prog` exists on `PATH` |
| `cat:name` | Built-in or custom [lessfilter category](./lessfilter#categories) |
| `application` | Platform application bundle, `.desktop` launcher, or executable |
| `git` | Path inside a git work tree |
| `*` | Any target |

Prefix any rule with `!` to invert it (`!type:d`).

## Examples

Ready-to-use action bundles for archiving, diffing, media conversion, file organization, and sharing ship in [`assets/actions/`](https://github.com/Squirreljetpack/fist/tree/main/assets/actions).

<video controls preload="none" poster="./images/action.png" src="./images/action.mp4"></video>

### Toggle executable bit (`ExecSilent`)

```toml
["chmod +x"]
strategy = "ExecSilent"
condition = { selected = "active", condition = "type:f" }
command = """
local all_exec = true
for _, p in ipairs(paths) do
  local st = fs.stat(p)
  if not (st and st.executable) then
    all_exec = false
    break
  end
end
local mode = all_exec and "-x" or "+x"
for _, p in ipairs(paths) do
  fs.chmod(p, mode)
end
toast_push("success", "set " .. mode .. ": ", #paths == 1 and path.base(paths[1]) or (#paths .. " files"))
"""
```

### Diff two selected files in the pager (`ExecPaged`)

<video controls preload="none" poster="./images/diff.png" src="./images/diff.mp4"></video>

```toml
["diff"]
strategy = "ExecPaged"
condition = ["type:f", "type:f"]
command = """
local p1, p2 = paths[1], paths[2]
print(lunacolors.bold(lunacolors.underline(path.base(p1) .. " <-> " .. path.base(p2))))
os.execute("diff -u --color=always " .. util.shq(p1) .. " " .. util.shq(p2))
"""
```

### Queued action with a destination (`Queue`)

```toml
["convert-webp"]
strategy = "Queue"
requires_dest = true
condition = { selected = "active", condition = ["have:cwebp", "cat:image"] }
command = """
for i, p in ipairs(paths) do
  local out = path.join(to, path.stem(p) .. ".webp")
  local res = proc.run("cwebp", {"-q", "85", p, "-o", out})
  if not res.ok then error(res.stderr) end
  set_progress(math.floor(i / #paths * 255))
end
toast("success", "Converted " .. #paths .. " image(s)")
"""
```

## Running from the shell

`fs :tool action` runs any configured menu action directly from the command line without opening the TUI:

```shell
fs :tool action "compress: zip" src/ docs/
fs :tool action convert-webp --dest ./out photo.png
```

Pass either the full `{prefix}: {key}` label or the bare key. Actions with `requires_dest = true` require `--dest <DIR>`. Use `--` before paths that begin with `-`. Toasts print to standard error, and the process exits with the code passed to `os.exit`.

## Queue interaction

- `Queue` and `QueueBatch` rows remain pending in the queue until you dispatch them with `Enter` inside `alt-u` or via `ExecuteQueue`.
- When `ExecuteQueue(all)` runs, custom rows with `requires_dest = true` and an empty destination are skipped silently; targeting a specific kind (`ExecuteQueue(convert-webp)`) raises an error toast if the destination is still empty.
- `Paste` (`ctrl-v`) runs `ExecuteQueue(builtins)`, which dispatches `copy`, `move`, and `symlink` rows while leaving custom action rows in place.

Next: [Lua](./lua) · [Queue](./queue) · [Tools](./tools)
