# Backend Practice Project - A YT-Twitter Clone (Under Dev)

This project is a comprehensive video-sharing platform backend built with **Node.js**, **Express**, and **MongoDB**. It follows industry best practices for modular architecture, secure authentication, and scalable file handling. This project is part of a learning journey inspired by "Chai aur Code".

## 🚀 Features

* **User Authentication & Authorization**: Secure registration and login flows with password hashing using Bcrypt.
* **Token-based Security**: Advanced JWT implementation using both Access Tokens and Refresh Tokens stored via `cookie-parser`.
* **Media Management with Multer**: Implements **Multer** as a middleware to handle multi-part/form-data, specifically for uploading avatars, cover images, and video files to local storage before processing.
* **Cloudinary Integration**: Integrated with **Cloudinary** for permanent cloud-based storage and management of high-quality media.
* **Advanced Database Queries**: Utilizes Mongoose aggregation pipelines and the `mongoose-aggregate-paginate-v2` plugin for complex data retrieval like channel profiles and watch history.
* **Social Ecosystem**: Robust schemas and controllers for Users, Videos, Tweets, Playlists, Likes, Comments, and Subscriptions.

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js (v5.x)
* **Database**: MongoDB with Mongoose ODM
* **File Handling**: Multer (Local upload middleware) and Cloudinary (Cloud storage)
* **Security**: JSON Web Tokens (JWT) and Bcrypt
* **Middleware**: Cors and Cookie-Parser

## 📁 Project Structure

```text
src/
├── controllers/    # Logic for Users, Videos, Subscriptions, Tweets, etc.
├── db/             # Database connection setup
├── middlewares/    # verifyJWT and Multer upload configurations
├── models/         # Mongoose schemas (User, Video, Subscription, etc.)
├── routes/         # API endpoint definitions
├── utils/          # ApiError, ApiResponse, and asyncHandler
├── app.js          # Express app configuration & middleware integration
└── index.js        # Server entry point & DB connection execution

```

## 🛣️ API Endpoints

### Base URL: `/api/v1`

| Resource | Endpoint | Description |
| --- | --- | --- |
| **Users** | `/users` | Registration, login, profile updates, and channel details. |
| **Subscriptions** | `/subscription` | Toggle subscriptions and fetch subscriber/channel lists. |
| **Videos** | `/videos` | Video publishing, retrieval, and management. |
| **Tweets** | `/tweets` | Social micro-blogging interactions. |
| **Social** | `/comments`, `/likes`, `/playlist` | Community engagement and content organization. |
| **Admin** | `/dashboard`, `/healthcheck` | Channel statistics and system status monitoring. |

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
Create a `.env` file in the root directory and add your credentials:
```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

```


4. **Run the project**:
```bash
# Runs the server using nodemon with experimental JSON module support
npm run dev

```



## 📄 License

Distributed under the **ISC License**.
