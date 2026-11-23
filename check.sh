#!/bin/sh
# Does this repository actually work as a Codex marketplace?
#
# Everything happens in a throwaway CODEX_HOME, so the person's own Codex is not touched. What is
# checked is the path a newcomer walks: add the marketplace, install the plugin, and see the skill
# reach the model.
#
# Run it from anywhere:  sh check.sh

set -eu

repo=$(cd "$(dirname "$0")" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

CODEX_HOME="$work/codex"
mkdir -p "$CODEX_HOME"
export CODEX_HOME

fail() {
  echo "FAILED: $1" >&2
  exit 1
}

echo "1. the marketplace"
codex plugin marketplace add "$repo" >"$work/add.txt" 2>&1 || fail "codex would not add the marketplace
$(cat "$work/add.txt")"
grep -q 'nido-codex' "$work/add.txt" || fail "the marketplace is not called nido-codex
$(cat "$work/add.txt")"

codex plugin list >"$work/list.txt" 2>&1 || fail "codex plugin list did not run"
grep -q 'nido@nido-codex' "$work/list.txt" || fail "the catalogue does not offer nido
$(cat "$work/list.txt")"

echo "2. the install"
codex plugin add nido@nido-codex >"$work/install.txt" 2>&1 || fail "the plugin would not install
$(cat "$work/install.txt")"

codex plugin list >"$work/list.txt" 2>&1
grep -q 'nido@nido-codex *installed, enabled' "$work/list.txt" ||
  fail "the plugin is not installed and enabled
$(cat "$work/list.txt")"

echo "3. the model is offered the skill"
# Installed is not offered: the skill has to show up in what Codex sends to the model. This asks
# Codex itself — it answers into a throwaway endpoint, so no account and no tokens.
node "$repo/scripts/skill-offered.mjs" nido:nido ||
  fail "Codex does not put the nido skill in front of the model"

echo
echo "All three passed."
