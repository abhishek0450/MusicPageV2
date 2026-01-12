# MusicPage Microservice App

A full-stack music streaming application built using a microservice architecture. This project consists of three dedicated backend services and a modern frontend application so users can browse, listen to, and manage music.

## 🏗 Architecture

The application is split into the following services:

1.  **AdminService:** Handles administrative tasks like uploading songs/albums, managing content, and interacting with Cloudinary for media storage.
2.  **SongService:** A public-facing API responsible for fetching songs, albums, and related metadata.
3.  **UserService:** Manages user authentication, user profiles, and playlists.
4.  **Frontend:** A responsive Single Page Application (SPA) built with React and Vite.

## 🚀 Tech Stack

*   **Frontend:** React (Vite), TypeScript, TailwindCSS, Context API, Axios.
*   **Backend:** Node.js, Express, TypeScript.
*   **Databases:**
    *   **PostgreSQL (via Neon DB):** Used by AdminService and SongService for structured data (Songs/Albums).
    *   **MongoDB:** Used by UserService for user data and playlists.
    *   **Redis:** Used for caching data in AdminService and SongService.
*   **Storage:** Cloudinary (for storing song audio files and image thumbnails).

## 🛠️ Prerequisites

Ensure you have the following installed or available:
*   [Node.js](https://nodejs.org/) (v16+)
*   [Redis](https://redis.io/) (Running locally or via a cloud provider)
*   A [Neon](https://neon.tech/) PostgreSQL Database connection string
*   A [MongoDB](https://www.mongodb.com/) Database connection string
*   A [Cloudinary](https://cloudinary.com/) Account (Cloud Name, API Key, Secret)

---


## 📡 API Endpoints Summary

### Admin Service
*   `POST /api/v1/album/new` - Create a new Album (Authenticated)
*   `POST /api/v1/song/new` - Create a new Song (Authenticated)
*   `POST /api/v1/song/:id` - Add Thumbnail to a Song
*   `DELETE /api/v1/album/:id` - Delete an Album
*   `DELETE /api/v1/song/:id` - Delete a Song

### Song Service
*   `GET /api/v1/album/all` - Retrieve all Albums
*   `GET /api/v1/song/all` - Retrieve all Songs
*   `GET /api/v1/album/:id` - Retrieve Songs by Album ID
*   `GET /api/v1/song/:id` - Retrieve a single Song by ID

### User Service
*   `POST /api/v1/user/register` - User Registration
*   `POST /api/v1/user/login` - User Login
*   `GET /api/v1/user/me` - Get current User Profile
*   `POST /api/v1/song/:id` - Add Song to User's Playlist

### Screenshots
