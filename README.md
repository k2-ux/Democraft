# Democraft

**Democraft** is a React Native application built with **TypeScript** that demonstrates authentication, API data fetching, Redux state management, and cloud-synced user-specific favorites using Firebase.

The project focuses on **clean architecture, state synchronization, and secure backend integration** rather than full e-commerce functionality.

---

## ✨ Features

### 🔐 Authentication

- Email & Password authentication using Firebase
- Google Sign-In integrated with Firebase Auth
- Persistent login session handling
- Secure Firestore rules for user-specific data

### 📦 Product Listing

- Products fetched from the DummyJSON public API
- Efficient rendering with `FlatList`
- Loading states and error handling
- Type-safe API normalization

### ❤️ Favorites System

- Add or remove favorites from the product listing
- Remove favorites from the favorites screen
- User-specific favorites stored in Firestore
- Favorites synchronized from Firestore on app startup
- Duplicate-safe Redux reducer logic

### ☁️ Cloud Persistence

Favorites are stored under:

```text
users/{uid}/favorites
```

- Only authenticated users can access their own data
- Firestore acts as the source of truth
- Redux serves as the client-side UI cache

---

## 🏗 Architecture Overview

| Layer | Technology |
|--------|------------|
| Authentication | Firebase Authentication |
| Persistent Storage | Firebase Firestore |
| UI State Management | Redux Toolkit |
| Navigation | React Navigation |
| API | DummyJSON |

### Application Flow

```text
User Login
     │
     ▼
Firebase Authentication
     │
     ▼
Receive User UID
     │
     ▼
Load Favorites from Firestore
     │
     ▼
Sync Favorites into Redux
     │
     ▼
User Toggles Favorite
     │
     ├── Update Firestore
     │
     └── Update Redux after success
     │
     ▼
Logout → Clear Local State
```

**Design Principle**

- Firestore is the backend authority.
- Redux manages client-side rendering and caching.

---

## 🧠 Technical Highlights

- Modular Firebase v22 API usage
- Firestore security rule implementation
- Consistent ID normalization strategy
- Centralized `Product` type definition
- Duplicate-safe reducer logic
- Strict TypeScript configuration
- Clear separation of UI state and persistence layer

---

## 🔐 Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }
  }
}
```

Each user can only read and write their own favorites.

---

## 🛠 Tech Stack

- React Native CLI
- TypeScript
- Redux Toolkit
- Firebase Authentication
- Firebase Firestore
- React Navigation
- DummyJSON API

---

## 📂 Project Structure

```text
src/
├── main/         # Screens
├── redux/        # Redux slices & store
├── types/        # Shared interfaces
├── helpers/      # Assets & constants
└── navigators/   # Navigation setup
```

---

## 🎯 Project Goals

This project was built to demonstrate:

- Firebase Authentication integration
- Cloud-synced user data
- Redux state management
- Secure Firestore backend integration
- Clean React Native architecture
- TypeScript best practices
