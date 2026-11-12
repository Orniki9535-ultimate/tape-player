#!/bin/sh
# Copies the app's tape-tone chain into the extension (an extension can't load files from outside its folder).
# Run after editing js/engine/fx.js;  `sh extension/sync.sh --check` only reports whether the copy is stale.
cd "$(dirname "$0")/.." || exit 1
if [ "$1" = "--check" ]; then cmp -s js/engine/fx.js extension/fx.js && echo "extension/fx.js is up to date" || { echo "extension/fx.js is stale: run sh extension/sync.sh"; exit 1; }
else cp js/engine/fx.js extension/fx.js && echo "copied js/engine/fx.js -> extension/fx.js"; fi
