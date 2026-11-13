# Cassette Player

A web cassette deck that plays YouTube links or your own audio files, with the feel and sound of an old tape.

**Try it:** https://orniki9535-ultimate.github.io/tape-player/

## Features

- Real deck keys: play, pause, stop / eject, hold to rewind or fast-forward, next track, loop
- Spinning reels, a tape counter, and a door that opens when a tape goes in or out
- YouTube links (videos and playlists) or audio files from your device (pick or drag & drop)
- Old-tape sound: wow & flutter, tape age, tape hiss, random tape snaps, and an "Original" button to compare
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
