Democraft – Product Listing & Cloud-Synced Favorites App

Democraft is a React Native application built with TypeScript that demonstrates authentication, API data fetching, Redux state management, and cloud-synced user-specific favorites using Firebase.

The project focuses on clean architecture, state synchronization, and secure backend integration rather than full e-commerce functionality.

✨ Features
🔐 Authentication

Email & Password login via Firebase

Google Sign-In integrated with Firebase Auth

Persistent login session handling

Secure Firestore rules for user-specific data

📦 Product Listing

Products fetched from DummyJSON public API

Clean FlatList rendering

Loading states and error handling

Type-safe API normalization

❤️ Favorites System

Add / remove favorites from listing screen

Remove favorites from favorites screen

Favorites stored per user in Firestore

Sync favorites from Firestore on app load

Duplicate-safe Redux reducer logic

☁ Cloud Persistence

Favorites stored at:

users/{uid}/favorites

Only authenticated users can read/write their own data

Firestore acts as source of truth

Redux used as UI cache

🏗 Architecture Overview

Authentication → Firebase Auth
Persistent Storage → Firestore
UI State → Redux Toolkit

Application Flow:

User logs in (Email or Google)

Firebase provides authenticated uid

App loads user favorites from Firestore

Favorites are synced into Redux

On toggle:

Firestore updates first

Redux updates after success

Logout clears local state

Firestore is treated as the backend authority.
Redux handles client-side rendering.

🧠 Technical Highlights

Modular Firebase v22 API usage

Firestore security rule implementation

Consistent ID normalization strategy

Centralized Product type definition

Duplicate-safe reducer logic

Strict TypeScript configuration

Separation of UI state and persistence layer

🔐 Firestore Security Rules
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{userId} {
allow read, write: if request.auth != null
&& request.auth.uid == userId;
}
}
}

Each user can only access their own favorites.

🛠 Tech Stack

React Native CLI

TypeScript

Redux Toolkit

Firebase Authentication

Firebase Firestore

React Navigation

DummyJSON API

📂 Project Structure
src/
├── main/ // Screens
├── redux/ // Redux slices & store
├── types/ // Shared interfaces
├── helpers/ // Assets & constants
├── navigators/ // Navigation setup
