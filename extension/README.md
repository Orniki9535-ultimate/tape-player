# Tape Deck FX

A small browser extension that lets the old-tape sound in the [Tape Deck](https://orniki9535-ultimate.github.io/tape-player/)
app (the **Wow & flutter** and **Tape age** sliders, and the **Original** button) work on YouTube songs, not just audio files.

- It **only** touches YouTube playing inside the Tape Deck app. Other sites and regular youtube.com are left alone.
- It collects and sends nothing. The sound is changed only in your own browser.
- YouTube ads get the effect too.
- When rewinding, you only hear the parts you have already played (parts not played yet stay silent).
- Works on desktop: Chrome, Edge, Opera / Opera GX, Firefox (not on phones or iPads).

Once installed, the badge next to the **Old-tape sound** heading in the app changes to
**"Files + YouTube (extension on)"** when a YouTube tape is in.

## Install

### Chrome, Edge, Opera / Opera GX
1. Get the `tape-deck-fx-<version>.zip` file and unzip it into a folder you won't delete (the browser keeps using it).
2. Open the extensions page: `chrome://extensions` / `edge://extensions` / `opera://extensions`
3. Turn on **Developer mode** → click **Load unpacked** → pick the unzipped folder.
4. Refresh the app page.

Chrome may warn about developer mode when it starts. You can just close the warning.

### Firefox
1. Get the `tape-deck-fx-<version>.xpi` file (the one signed by Mozilla).
2. Drag it into a Firefox window, or `about:addons` → ⚙️ → **Install Add-on From File…** → click **Add**.
3. If it doesn't work: `about:addons` → Tape Deck FX → **Permissions** tab → allow youtube.com.
4. Refresh the app page.

Needs Firefox 140 or newer.

## Updating to a new version
- **Chrome / Edge / Opera:** unzip the new zip over the old folder, then click the reload button (⟳) on the Tape Deck FX card.
- **Firefox:** just install the new .xpi over the old one.

## Not working?
- Refresh the app page (Ctrl+F5) after every install or update.
- Press F12 → Console and type `tapeDeck` in the filter box. If it works you'll see a line like `[tapeDeck] connected to ...`.
  Send whatever lines you see to the maintainer.
- Without the extension the app still works as normal; the tape effects just work on audio files only.

---

## For maintainers

| File | What it is |
| --- | --- |
| `manifest.json` | Manifest V3; one file works for both Chromium and Firefox |
| `content.js` | Runs in the YouTube embed: says hello to the app, then wires `<video>` into the FX chain |
| `fx.js` | A **copy** of `js/engine/fx.js`. Don't edit it here |
| `sync.sh` | Copies `js/engine/fx.js` to `fx.js` (`--check` only reports whether the copy matches) |
| `pack.sh` | Builds `dist/tape-deck-fx-<version>.zip` (checks the fx.js copy first) |

Messages between the app and the extension (`postMessage`; both sides check origin and source):

```
app → extension  { tapeDeck: 'hello' }                  when the player is ready, and every time a tape goes in
extension → app  { tapeDeck: 'ready' }
app → extension  { tapeDeck: 'fx', wow, age, bypass }   on every change (wow, age: 0..1)
app → extension  { tapeDeck: 'wind', rate }             while winding: + forward (up to 16), - rewind, 0 stop winding
```

If the app moves to another address, update the `APP` list in `content.js`.

### Releasing a new version
1. Edit `js/engine/fx.js`, then run `sh extension/sync.sh` (if you changed the FX chain).
2. Bump `version` in `manifest.json`.
3. Run `sh extension/pack.sh` to get the zip in `dist/` (not committed).
4. Check it with Firefox's linter (optional): `npx web-ext lint --source-dir extension --ignore-files sync.sh pack.sh '*.md'`

### Signing for Firefox (free, not listed in the store)
1. Log in at https://addons.mozilla.org/developers/ → **Submit a New Add-on**.
2. Choose **On your own** (self-distribution / unlisted) → upload the zip from `pack.sh`.
3. If it asks for source code: not needed (the code isn't built or minified).
4. Wait for the automatic review (usually a few minutes), then download the signed `.xpi` and share it.
5. Upload later versions on the same add-on page (**Upload New Version**). Bump `version` every time.

## Credits

Made 100% by Claude (an AI by Anthropic). If there are any mistakes, I sincerely apologize.
