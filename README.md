# Bill Split Application

A web app to help split restaurant bills among friends and track who owes what.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (configured in .env file)

### Installation

1. Install dependencies for the root project, server, and client:

```bash
npm run install:all
```

Alternatively, you can install them separately:

```bash
# Root project
npm install

# Server
cd server
npm install

# Client
cd client
npm install
```

### Running the Application

To run both the client and server concurrently:

```bash
npm run dev
```

To run them separately:

```bash
# Server only (with nodemon for auto-restart)
npm run dev:server

# Client only
npm run dev:client
```

The server will run on http://localhost:8000, and the client will run on http://localhost:3000.

## Troubleshooting

If you encounter connection issues:

1. Make sure MongoDB is running and accessible
2. Check that the server is running on port 8000
3. Visit http://localhost:3000/test to run the connection diagnostic tool
4. Check for CORS issues in browser developer console

## Environment Variables

Make sure you have a `.env` file in the server directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_LIFETIME=15m
JWT_REFRESH_LIFETIME=7d
```

## Project Structure

- `/client` - React frontend
- `/server` - Express backend API
  - `/controllers` - API route controllers
  - `/models` - Mongoose database models
  - `/routes` - API route definitions
  - `/middleware` - Express middleware
  - `/db` - Database connection
