# Tsukuyomi.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![Expo](https://img.shields.io/badge/mobile-Expo%20(React%20Native)-black.svg)

**Tsukuyomi**, a next-generation music player that allows you to manage your local music archive with an aesthetic and powerful interface; working on Web, Desktop, and Mobile (Android/iOS) platforms.

---

##  Features

### Interface & Experience
*   **Modern Design:** Frosted glass effects, vibrant colors, and smooth animations.
*   **Responsive Layout:** Seamless appearance on desktop and mobile devices.
*   **Mini & Full-Screen Player:** Keep song controls at your fingertips at all times.

### Music Management
*   **Automatic Scanning & Monitoring:** Instantly detects changes in your designated folders (Watchdog integration).
*   **Smart Metadata Reading:** ID3 tags, album covers, and FLAC/MP3 support.
*   **Advanced Search:** Real-time filtering by artist, album, or song name.
*   **Favorites & Playlists:** Create your own lists and manage your favorites.

### Mobile (Expo) (Well, working on it little by little, doesn't seem usable yet.)
*   **Native Performance:** Smooth mobile experience developed with React Native.
*   **Synchronization:** Connect to the server on the same network for access to your library from anywhere.
*   **Background Playback:** Enjoy music even when the app is closed (iOS/Android).

### Technical Features
*   **Streaming:** Range-request-supported streaming that plays even large files without waiting.
*   **Live Song Lyrics:** Synchronized or plain lyrics with `lrclib.net` integration.
*   **Hot-Reload Database:** Fast data management based on SQLite.

---

## Installation and Setup

The project consists of two main parts: Server and Client.

### Requirements
*   Python 3.9+
*   Node.js 18+ & Bun (or npm/yarn)

### 1. Server (Backend) Setup
The server scans music files and provides the API.

```bash
cd server

# Create virtual environment (Recommended)
python -m venv venv
# For Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server (Default port: 8000)
python main.py
```

### 2. Client (Web/Desktop) Setup
Modern web / tauri interface.

```bash
cd client

# Install dependencies
bun install

# Start in development mode (Web)
bun run dev

# Start as a Desktop Application (Tauri)
bun run tauri dev
```

### 3. Mobile (Expo) Application
To run on your mobile device.

```bash
cd client

# Start for Android (or just use 'bun run mobile' to scan QR code)
bun run mobile -- --clear
```
_Note: Make sure your phone and computer are on the same Wi-Fi network._

---

## API Documentation

Tsukuyomi uses a RESTful API structure. Basic endpoints are listed below:

### Music Operations

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/music/scan` | Scans the library and updates the database. |
| `GET` | `/api/v1/music/search` | Searches for songs. (`?q=query`) |
| `GET` | `/api/v1/music/stream/{id}` | Streams the song file. |
| `GET` | `/api/v1/music/cover/{album_id}` | Retrieves album cover. |
| `GET` | `/api/v1/music/track-cover/{id}` | Retrieves embedded cover for song. |
| `GET` | `/api/v1/music/lyrics` | Fetches song lyrics. |

### Favorites & Lists

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/music/favorites` | Lists favorite songs. |
| `POST` | `/api/v1/music/favorites/{id}` | Adds song to favorites. |
| `DELETE` | `/api/v1/music/favorites/{id}` | Removes song from favorites. |
| `GET` | `/api/v1/music/playlists` | Retrieves all playlists. |
| `POST` | `/api/v1/music/playlists` | Creates a new playlist. |
| `GET` | `/api/v1/music/playlists/{id}` | Retrieves playlist details. |
| `DELETE` | `/api/v1/music/playlists/{id}` | Deletes a playlist. |

---

## Project Structure

```
tsukuyomi/
├── client/                 # Frontend (React + Vite + Expo)
│   ├── src/
│   │   ├── components/     # UI Components (Web & Mobile)
│   │   ├── views/          # Page Views
│   │   └── MobileApp.jsx   # Mobile Entry Point
│   └── package.json
│
├── server/                 # Backend (FastAPI)
│   ├── app/
│   │   ├── api/            # API Routes
│   │   ├── db/             # Database Models
│   │   └── services/       # Scanner and Music Services
│   └── main.py             # Server Launcher
│
└── README.md
```

## Contributing

1.  Fork this repository.
2.  Create a new feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes (`git commit -m 'Add new feature'`).
4.  Push your branch (`git push origin feature/NewFeature`).
5.  Create a Pull Request.
