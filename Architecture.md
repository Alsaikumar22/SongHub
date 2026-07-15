
# Implementation Plan - SongHub

Implement a clean, minimalist Next.js music player application with two main pages (Home Page and Single Song Page), a persistent global audio player context, and interactive features like search, favorites, playlists, and recently played tracking.

## User Review Required

> [!IMPORTANT]
> The styling will be minimalistic and clean (light/gray theme, elegant typography, and subtle borders) as requested, with support for TailwindCSS v4 which is already configured in the workspace.
>
> We will install `lucide-react` to provide beautiful icons for player controls, search, favorites, and playlists.

## Proposed Changes

We will introduce a global context provider to manage playback state, playlists, favorites, and recently played tracks, ensuring that navigating between pages does not disrupt music playback.

---

### Component: Audio & App Context

This will contain the React Context that manages the audio playback (`HTMLAudioElement` under the hood), lists of songs, playlist curation, favorites list, and recently played logs.

#### [NEW] [audio-context.js](file:///mnt/fun/praveen_project/songhub/src/app/context/audio-context.js)
- Define `AudioProvider` and `useAudio` hook.
- Maintain lists of mock songs (using stable royalty-free test MP3s).
- Maintain player state: `currentSong`, `isPlaying`, `progress` (seconds), `duration`, `volume`, `isMuted`, `isLooping`, `isShuffled`, `queue`, `favorites`, `playlists`, `recentlyPlayed`.
- Functions: `playSong(song)`, `togglePlay()`, `nextSong()`, `prevSong()`, `seekTo(time)`, `adjustVolume(vol)`, `toggleFavorite(songId)`, `createPlaylist(name)`, `addSongToPlaylist(playlistId, songId)`, `removeSongFromPlaylist(playlistId, songId)`.

---

### Component: Global Layout

#### [MODIFY] [layout.js](file:///mnt/fun/praveen_project/songhub/src/app/layout.js)
- Wrap children in `AudioProvider` to make context accessible globally.
- Keep the `AudioPlayerBar` component fixed at the bottom of the page, so it stays mounted and continues playing music seamlessly when users click between pages.

#### [NEW] [player-bar.js](file:///mnt/fun/praveen_project/songhub/src/app/components/player-bar.js)
- A sticky/fixed audio player bar at the bottom.
- Displays cover art, title, artist, and heart (favorite) button for the currently playing song.
- Contains playback controls (shuffle, previous, play/pause, next, loop).
- Interactive timeline seek slider and elapsed/remaining time displays.
- Volume control (mute icon + volume slider).
- Playlist/Queue shortcut drawer.

---

### Component: Home Page

#### [MODIFY] [page.js](file:///mnt/fun/praveen_project/songhub/src/app/page.js)
- Home/Main music dashboard.
- **Search Bar**: Real-time filtering of songs by title, artist, or album.
- **Genre Filters**: Tabs to filter songs by category (e.g. Pop, Synthwave, Lo-Fi, Rock).
- **Featured / Trending**: Beautiful layout displaying recommended songs.
- **Recently Played**: Horizontal scroll of recently listened songs.
- **Playlists Section**:
  - View existing playlists.
  - Create new playlist button.
  - Clicking a playlist filters the song list to that playlist.
- **Favorites Section**: Dedicated toggle/filter to view favorite tracks.
- **Song Grid / List**: Table/list of matching songs displaying thumbnail, title, artist, album, duration, play count, and buttons to play, favorite, or add-to-playlist.

---

### Component: Single Song Page

#### [NEW] [song-page](file:///mnt/fun/praveen_project/songhub/src/app/song/[id]/page.js)
- Dynamic route `/song/[id]` showing detailed information for a specific song.
- Large cover art display (high resolution).
- **Interactive Visualizer**: Animated canvas or CSS-bars synchronized with the play state (moves when playing, static when paused).
- **Song Metadata**: Details such as Album, Release Year, Genre, BPM, and Lyrics (mock scrollable display).
- **Quick Controls**: Large play/pause toggle, like/favorite toggle, and "Add to Playlist" selection menu.
- **Up Next**: Small list showing upcoming songs in the queue.

---

### Styling and Assets

We will use TailwindCSS v4 with custom configuration for transitions and aesthetic styling.
Since we want high-quality images and avoid placeholders, we will fetch standard royalty-free cover art or generate premium SVG/CSS designs for song covers if images aren't available.

---

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run build` to verify there are no compilation or syntax errors.

### Manual Verification
- Launch the development server (`pnpm dev` inside `songhub`).
- Test standard operations: search, filter, play song.
- Verify playback remains uninterrupted while navigating between Home `/` and Song Details `/song/[id]`.
- Verify favorites and playlists update reactivity.
