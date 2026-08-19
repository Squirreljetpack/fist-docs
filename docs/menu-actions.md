# Menu actions

Menu actions are user-defined commands shown in the menu overlay (`ctrl-e`).
They are declared as TOML tables keyed by name; the insertion order is the
menu display order.

Effectively, these act as f:st's _plugins_. Actions execute with the full capacity of standard [lua](https://www.lua.org/about.html) virtual machine. Some hooks into the main app are available from within:
- `set_progress` is available for actions with `ExecuteStrategy::Queue/Batch` to display their progress in the [queue](queue.md).
- `toast`, `toast_push` are available to create notification toasts.

In time and if there is demand, more hooks may be added, such as sending arbitrary actions or creating overlays.

![The menu](images/13-menu.png)

Menu actions live in `actions.toml` next to `config.toml`, plus every `*.toml` file
in the `actions/` folder next to it, merged in sorted filename order (numeric
prefixes order them). `--dump-config` writes the shipped `actions.toml`.

The key (name of the action) serves two roles:

- the **name** shown in the menu,
- For actions which execute by enqueuing, the same name serves as the [queue kind](queue.md).

## Fields

| Field           | Type           | Default           | Meaning                                            |
| --------------- | -------------- | ----------------- | -------------------------------------------------- |
| `command`       | string         | required          | The lua script (`@file` syntax supported).         |
| `alias`         | string         | none              | The alias shown in the menu's second column.       |
| `strategy`      | string         | `"ExecuteSilent"` | How the command runs; see below.                   |
| `condition`     | list or object | always visible    | Visibility rules; see below.                       |
| `requires_dest` | bool           | `false`           | Queued executions require a non-empty destination. |
| `close`         | bool           | strategy default  | Override the strategy's menu-closing behavior.     |

## Strategies

| Strategy        | Waits | Closes menu | Effect                                                  |
| --------------- | ----- | ----------- | ------------------------------------------------------- |
| `Execute`       | yes   | yes         | Run the lua command and wait for it.                    |
| `ExecuteSilent` | no    | yes         | Run without waiting (`silent` is accepted as an alias). |
| `ExecPaged`     | yes   | yes         | Run and page its stdout.                                |
| `Queue`         | —     | no          | Enqueue all targets as one multi-path queue item.       |
| `QueueBatch`    | —     | no          | Enqueue the targets in chunks of at most *n* paths.     |

`Queue`/`QueueBatch` create queue rows of the action's key; the row's
destination is editable in the [queue](queue.md) overlay (`ctrl-u`).

## The Lua environment & global contract

Each action's `command` runs in an isolated Lua VM with `paths`, `dst`, and `nav_cwd` passed in, plus globals for toasts and progress. The full reference — arguments, built-in functions, `@file` loading, and binding the same Lua to keys — is on [Lua scripting](lua.md).

`@file` commands load the script from disk (`~/` and absolute paths work; relative paths resolve against the actions folder).

## Conditions

An action is visible iff at least one condition passes; an empty list means
always visible. A single condition is accepted without the outer array wrapper.
Conditions are evaluated once when the menu opens.

There are two forms:

### 1. Positional sequence (`["type:f", "type:d"]`)

Direct array of file rules evaluated positionally against selections in order:

```toml
condition = ["type:f", "type:d"]
```

Exactly as many items must be selected as there are rules, and rule *i*
must match the *i*-th selected item in selection order. Multiple sequence alternatives
can be supplied in an array (`condition = [["type:text", "type:text"], ["type:text", "type:d"]]`).

### 2. Scoped rule table (`{ selected = "...", condition = "...", strict = bool }`)

Flat table evaluated against the target set chosen by `selected`:

```toml
condition = { selected = "active", condition = "type:f", strict = true }
```

The rule must match **every** path in the target set:

| `selected`           | strict = false                                                                                                                         | strict = true                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `"cursor"` (default) | an enabled cursor with an item (selections are ignored)                                                                                | additionally: nothing selected                    |
| `"cwd"`              | a current directory **while the cursor is disabled** (the prompt state)                                                                | the Nav pane directory, regardless of the cursor  |
| *n*                  | at least *n* selected items                                                                                                            | exactly *n* selected items                        |
| `"active"`           | the selection when any items are selected, else the cursor item, else (cursor disabled) the current directory; fails when none resolve | the resolved target set contains exactly one path |

For `"cursor"` the rule is evaluated against the cursor item; for `"cwd"`
against the current directory (strict: the Nav directory); for *n* and
`"active"` against every resolved path. `strict` defaults to `false`;
`selected` defaults to `"cursor"` when omitted.

### Rule syntax

| Rule                                                    | Matches                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `ext:rs`                                                | File extension (`rs`). Bare `.ext` is shorthand (`.rs`).            |
| `glob:*.rs`                                             | The full path against the glob.                                     |
| `child:src`                                             | A child of the directory (or of a file's parent) matching the glob. |
| `mime:image/*`                                          | MIME type (type may be a wildcard; e.g. `mime:image/png`).          |
| `type:f` / `type:d` / `type:l` / `type:x` / `type:text` | File / directory / symlink / executable / text file.                |
| `have:program`                                          | The program exists on PATH.                                         |
| `cat:name`                                              | A file category (builtin or user-defined).                          |
| `application`                                           | Platform app bundle / launcher / executable.                        |
| `git`                                                   | The path is inside a git work tree.                                 |
| `*`                                                     | Anything.                                                           |

Prefix with `!` to invert (`!ext:rs`). (Same vocabulary as [lessfilter rules](lessfilter.md).)

## Examples

To download ready-to-use action plugins (such as compression, diffing, and more), see [assets/actions](https://github.com/Squirreljetpack/fist/assets/actions).

### 1. Direct Execution on Active Targets (`ExecuteSilent`)

Runs silently without waiting or paging output. Operates on the active selection or cursor item:

```toml
["chmod +x"]
strategy = "ExecuteSilent"
condition = { selected = "active", condition = "*" }
command = """
for _, p in ipairs(paths) do
  os.execute("chmod +x '" .. p .. "'")
end
toast_push("success", "set +x: ", #paths .. " items")
"""
```

### 2. Paged Output on Positional Pair (`ExecPaged` + Positional Array)

Requires exactly two files selected in order; runs and pages stdout:

```toml
["diff"]
strategy = "ExecPaged"
condition = ["type:f", "type:f"]
command = "os.execute('diff -u --color=always ' .. paths[1] .. ' ' .. paths[2])"
```

### 3. Prompt-Scoped Command (`selected = "cwd"`)

Visible only when in the prompt state (cursor disabled) inside a git repo:

```toml
["git: log"]
strategy = "ExecPaged"
condition = { selected = "cwd", condition = "git" }
command = "os.execute('cd ' .. paths[1] .. ' && git log')"
```

### 4. Gated on External Tool (`{ condition = "have:..." }`)

Visible only when `tar` is installed on `PATH`:

```toml
["tar.gz"]
strategy = "Execute"
condition = { condition = "have:tar" }
command = "print('compressing ' .. #paths .. ' items to ' .. dst)"
```

### 5. Queued Action Requiring Destination (`Queue` + `requires_dest`)

Enqueues matching targets as a custom queue item; requires destination to execute:

```toml
["stash-logs"]
strategy = "Queue"
condition = { selected = "active", condition = "ext:log" }
requires_dest = true
command = "print('processing log ' .. paths[1] .. ' -> ' .. dst)"
```

## Interaction with the queue

- `Queue`/`QueueBatch` rows execute the action's lua command once per row
  with the row's stored `dst` as the second argument.
- `requires_dest = true` rows need a non-empty destination: `All`
  (`ExecuteQueue` with no argument) silently skips such rows with an empty
  destination, exact selectors report an error.
- The queue overlay's `[kind: x]` filter cycles the shared queue by kind;
  `Paste` executes all pending `copy`, `cut`, and `symlink` rows.

## FAQ

**Can an action run without the menu?**

Yes — the same action key can be bound directly in `mm.toml` (`"ctrl-x" = "MenuAction(my-action)"`) or enqueued via `ExecuteQueue(my-action)`.

**How do I validate everything?**

`fs :tool check` parses the configs and validates every action's Lua script, failing non-zero on errors. See [Tools](tools.md).
