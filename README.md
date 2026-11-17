# Cassette Player

A web cassette deck that plays YouTube links or your own audio files, with the feel and sound of an old tape.

**Try it:** https://orniki9535-ultimate.github.io/tape-player/

## Features

- YouTube links (videos and playlists) or audio files from your device (pick or drag & drop)
- A queue: paste more YouTube links while one plays, and they play one after another (NEXT skips ahead).
  A playlist link lists every song in it; drag songs (or use ↑ / ↓) to reorder them, × to remove one
- Real deck keys: play, pause, stop / eject, hold to rewind or fast-forward (with the squeal), next track, loop.
  LOOP sends each song back to the end of the queue; a single tape rewinds and plays again ("Skip the rewind" jumps straight back)
- Keyboard keys: Space play / pause, hold ← → to wind, N next song, ? the tour
- The phone's lock screen, headphone buttons and media keys show the song and control the deck
- Remembers your tape and queue: close the tab, come back, and it's cued where you left off (YouTube links)
- Spinning reels, a tape counter you can reset, and a door that opens when a tape goes in or out
- Every tape is a random cassette design, its label striped in colours from the video's thumbnail
- Old-tape sound: wow & flutter, tape age, tape hiss, random tape snaps, and an "Original" button to compare
- A guided tour on the first visit (press ? or the ? button to see it again)
- English and Thai interface; your settings are remembered

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
