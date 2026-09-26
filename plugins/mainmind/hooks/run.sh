#!/bin/sh
# Claude Code runs every Mainmind hook through this file. Anthropic's directory
# asks a hook command in hooks.json to name only files under the plugin folder,
# so the question "is Node here?" is asked in this file instead of there. A
# computer without Node starts and stops sessions as if no hook existed.
#
#   sh run.sh plain  <hook.mjs>   output and exit code pass through (Stop)
#   sh run.sh stdout <hook.mjs>   keeps stdout, drops errors, always exits 0
#   sh run.sh silent <hook.mjs>   prints nothing, always exits 0
command -v node >/dev/null 2>&1 || exit 0
mode="$1"
shift
case "$mode" in
  plain) exec node "$@" ;;
  stdout) node "$@" 2>/dev/null; exit 0 ;;
  silent) node "$@" >/dev/null 2>&1; exit 0 ;;
  *) exit 0 ;;
esac
