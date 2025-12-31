# Backend Practice Project

A comprehensive backend system built with **Node.js**, **Express**, and **MongoDB**, following industry best practices for building scalable and secure REST APIs. This project is part of a learning journey inspired by "Chai aur Code" by Hitesh Choudhary.

## 🚀 Features

* **User Authentication & Authorization**: Complete authentication flow including registration, login, logout, and password management.
* **Token-based Security**: Implements JWT (JSON Web Tokens) with both Access and Refresh tokens for secure communication.
* **File Management**: Integrated with **Cloudinary** and **Multer** for handling high-quality image (Avatar/Cover) and video uploads.
* **Mongoose Schemas**: Well-structured data models for Users, Videos, Tweets, Playlists, and Subscriptions.
* **Aggregation Pipelines**: Advanced data retrieval using Mongoose aggregation for complex queries like channel profiles and watch history.

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB with Mongoose ODM
* **Storage**: Cloudinary (Cloud-based media management)
* **Security**: Bcrypt (Password hashing) and JWT
* **Tools**: Prettier (Code formatting) and Nodemon (Dev server)

## 📁 Project Structure

```text
src/
├── controllers/    # Request handling logic
├── db/             # Database connection setup
├── middlewares/    # Custom middlewares (Auth, File Upload)
├── models/         # Mongoose schemas (User, Video, etc.)
├── routes/         # API endpoint definitions
├── utils/          # Reusable utilities (ApiError, ApiResponse)
└── app.js          # Express app configuration

```

## 🛣️ API Endpoints

### User Routes (`/api/v1/users`)

* `POST /register`: Create a new user with avatar/cover image uploads.
* `POST /login`: Authenticate user and receive tokens.
* `POST /logout`: Clear refresh tokens (Secured).
* `GET /get-user`: Fetch current user details (Secured).
* `PATCH /update-avatar`: Update user profile picture (Secured).
* `GET /c/:username`: Get public channel details (Secured).

### Video & Tweet Routes

* Endpoints for managing video content and social interactions.

## ⚙️ Installation

1. **Clone the repository**:
```bash
git clone <your-repo-url>

```


2. **Install dependencies**:
```bash
npm install

```


3. **Environment Variables**:
Create a `.env` file in the root directory and add the following keys:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

```


4. **Run the project**:
```bash
npm run dev

```



## 📄 License

Distributed under the **ISC License**.
