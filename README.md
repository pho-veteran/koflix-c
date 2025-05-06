# Koflix-C: Mobile Streaming App

<div align="center">
  <img src="assets\images\koflix-logo-bg.png" alt="Koflix Mobile Logo" width="150" height="150" />
  <h3>Your favorite movies on the go</h3>
</div>

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## 📋 Overview

Koflix-C is a high-performance React Native Expo app that provides a Netflix-like movie streaming experience for Android users. With a sleek interface, powerful video player, and offline capabilities, Koflix-C delivers premium streaming functionality while connecting seamlessly to the Koflix-A backend.

## ✨ Features

- **Authentication**
  - User registration and login
  - Social authentication
  - Secure token management
  - Remember me functionality

- **Content Discovery**
  - Home screen with trending and recommended content
  - Discover by genres, countries, and types
  - Advanced search with filters
  - Voice search capabilities

- **Video Playback**
  - Support for HLS (.m3u8) and MP4 streaming
  - Custom video player with advanced controls
  - Multiple server selection for each episode
  - Background playback support
  - Picture-in-picture mode

- **Offline Experience**
  - Download movies and episodes
  - Offline playback
  - Download queue management
  - Storage management

- **Personalization**
  - Watch history tracking
  - Continue watching functionality
  - Favorites system
  - Custom playlists

## 🛠️ Technology Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React Native with Expo |
| **UI Components** | NativeWind, GlueStack UI |
| **Navigation** | Expo Router (file-based routing) |
| **Authentication** | Firebase Auth |
| **Network** | Axios, React Query |
| **State Management** | Context API, Zustand |
| **Video Player** | React Native Video, ExoPlayer |
| **Utilities** | date-fns, Zod validation |
| **Dev Tools** | TypeScript, ESLint, Prettier |
| **Storage** | AsyncStorage, MMKV |

## 🚀 Get Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a:

- [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

> **Note:** For environment variables, refer to `.env.example` file in the project root and create your own `.env` file based on it.

## 📁 Folder Structure Overview

```
koflix-c/
├── api/                 # API client and service functions
├── app/                 # Expo Router app directory
│   ├── (auth)/          # Authentication screens
│   │   └── login.tsx    # Login screen
│   │   └── register.tsx # Registration screen
│   ├── (main)/          # Main app screens
│   │   ├── (tabs)/      # Bottom tab routes
│   │   └── movie/       # Movie details screens
│   └── _layout.tsx      # Root layout
├── assets/              # Images, fonts, and static assets
├── components/          # UI components
│   ├── movie/           # Movie-related components
│   ├── player/          # Video player components
│   └── ui/              # Generic UI components
├── constants/           # App constants and configuration
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and helpers
├── providers/           # React context providers
├── services/            # Core services for features
├── types/               # TypeScript type definitions
└── android/             # Android-specific configuration
```

## 🔗 Related Projects

- [Koflix-A](https://github.com/pho-veteran/koflix-a) - Backend admin dashboard and API