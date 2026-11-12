#!/bin/sh
# Builds dist/tape-deck-fx-<version>.zip: the files a browser needs, manifest at the top.
# Hand the zip to friends (unzip, then Load unpacked), or upload it to addons.mozilla.org to sign for Firefox.
cd "$(dirname "$0")" || exit 1
sh sync.sh --check || exit 1
v=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' manifest.json)
mkdir -p ../dist && out="../dist/tape-deck-fx-$v.zip" && rm -f "$out"
zip -q "$out" manifest.json fx.js content.js && echo "built dist/tape-deck-fx-$v.zip"
