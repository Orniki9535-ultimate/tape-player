# Cassette Player

A web cassette deck that plays YouTube links or your own audio files, with the feel and sound of an old tape.

**Try it:** https://orniki9535-ultimate.github.io/tape-player/

## Features

- A queue: paste more YouTube links while one plays, and they play one after another (NEXT skips ahead).
  A playlist link lists every song in it, so you can reorder or remove them; LOOP loops the whole queue
- Real deck keys: play, pause, stop / eject, hold to rewind or fast-forward, next track, loop
- Spinning reels, a tape counter, and a door that opens when a tape goes in or out
- YouTube links (videos and playlists) or audio files from your device (pick or drag & drop)
- Old-tape sound: wow & flutter, tape age, tape hiss, random tape snaps, and an "Original" button to compare
- Keyboard keys (Space play / pause, hold ← → to wind, N next) and the phone's lock screen / headphone buttons
- Remembers your tape and queue: close the tab, come back, and it's cued where you left off (YouTube links)
- A guided tour on the first visit (press ? to see it again)
- English and Thai interface

The worn-tape effects work on audio files out of the box. To get them on YouTube too, install the small
browser extension in [`extension/`](extension/README.md).

## Run locally

No build step. Serve the folder with any static server and open it:

```bash
python3 -m http.server
```

## Why this exists

I made this to satisfy my own wants: I just wanted a tape player that looks and sounds the way I like.

## Credits

This project was made 100% by Claude (an AI by Anthropic).
If there are any mistakes, I sincerely apologize.
