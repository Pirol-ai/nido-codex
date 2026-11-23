# nido for Codex

**nido** runs code in isolated sandboxes: each one is a small virtual machine of its own, in the EU,
run by [Pirol](https://pirol.ai). This plugin teaches Codex when and how to use them — so you can
say *"try this in a sandbox"* or *"fine-tune this on a GPU"*, and Codex creates the sandbox, runs
the work there, copies the results back and cleans up.

Codex drives nido the way you would: with the `nido` command line on your computer, as you, with
your account and your budget. Nothing new runs in the background.

## What you need

The **nido command line**, version 0.7.4 or newer (Node 20 or newer), installed and logged in once:

```bash
npm install -g @pirol/nido
nido login
```

`nido login` opens your browser and you confirm with your Pirol account. Codex never sees a key.

> **Closed beta.** Sandboxes are open to invited accounts. Ask for access at
> [hello@pirol.ai](mailto:hello@pirol.ai).

## Install

```bash
codex plugin marketplace add Pirol-ai/nido-codex && codex plugin add nido@nido-codex
```

Start a new Codex session afterwards. The skill is called `nido`; Codex uses it on its own when a
task fits, and `$nido` calls it by name.

## Use it

Ask in plain words. A few prompts to start with:

- *"Run the test suite in a nido sandbox, not on my machine."*
- *"Clone this repo into a sandbox and check whether `npm install` runs any install scripts."*
- *"Start Postgres in one sandbox and our API in another, connected, and run the integration tests."*
- *"Fine-tune Qwen2.5-0.5B with LoRA on `data/tickets.jsonl` on an L4 GPU, then bring the adapter back."*
- *"Which sandboxes are still running? Remove the ones from today."*

Codex checks that nido is installed and logged in, asks before it installs nido or starts a GPU,
opens only the network hosts and secrets the task needs, and removes the sandboxes it created when
the work is done.

## Network for nido

nido talks to the Pirol API, so it needs the network. In Codex's default sandbox, shell commands
have none: Codex asks to run `nido` outside its sandbox the first time, and you approve it. To
approve it for good, choose *always allow* for the `nido` prefix when Codex asks.

Allow only `nido` this way, not every command.

## What it runs, sends and stores

- **Runs:** only the `nido` command on your computer, when Codex decides to call it. This
  plugin adds instructions, no server and no background process.
- **Sends:** what you copy into a sandbox with `nido cp` goes to that sandbox, in the EU. What a
  command in the sandbox prints goes back to Codex and from there to its model, as with any
  command it runs.
- **Stores:** nothing of its own. nido keeps its login key in `~/.nido/config.json`.
- **Costs:** sandboxes are billed from your Pirol budget while they run; GPUs cost more. Prices:
  [pirol.ai/pricing](https://pirol.ai/pricing#sandboxes).

## The same skill for every agent

The skill in `plugins/nido/skills/nido` is the same in all five nido integrations:
[Claude Code](https://github.com/Pirol-ai/nido-claude-code),
[Codex](https://github.com/Pirol-ai/nido-codex),
[GitHub Copilot](https://github.com/Pirol-ai/nido-copilot),
[OpenCode](https://github.com/Pirol-ai/nido-opencode) and
[Qwen Code](https://github.com/Pirol-ai/nido-qwen-code).
Any other agent that runs shell commands can use it too: copy the folder to wherever it reads
skills.

## Checking it

`sh check.sh` walks the whole path in a throwaway `CODEX_HOME`, so your own Codex is not
touched: it adds the marketplace, installs the plugin and then reads what Codex puts in front of
the model. That last step asks Codex itself, through a throwaway local endpoint, so no account is
used and no tokens are spent. It needs `codex` and `node`.
`node --test tests/*.test.mjs` checks the manifests alone and runs on every pull request.

## Support

Questions and problems: [github.com/Pirol-ai/nido-codex/issues](https://github.com/Pirol-ai/nido-codex/issues).
Documentation: [pirol.ai/docs/sandboxes](https://pirol.ai/docs/sandboxes) ·
Privacy: [pirol.ai/privacy](https://pirol.ai/privacy) · Terms: [pirol.ai/terms](https://pirol.ai/terms)

## License

MIT — see [LICENSE](LICENSE). The licence covers this plugin; the nido command line is licensed
separately.
