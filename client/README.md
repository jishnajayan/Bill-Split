# Bill Split Frontend

A React-based frontend for the Bill Split application. This application allows users to split bills with friends and keep track of who owes what.

## Features

- User authentication (login & registration)
- Dashboard to view friends and their balances
- View incoming and outgoing bills
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm start` - Starts the development server
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from Create React App

## Backend Connection

The frontend is configured to connect to the backend API at `http://localhost:5000` via the proxy setting in package.json.

## Authentication

Authentication is handled using JWT tokens. The access token is stored in localStorage, and HTTP-only cookies are used for refresh tokens.

## Technologies Used

- React
- React Router
- Axios for API calls
- Context API for state management