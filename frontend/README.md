# Task Manager Frontend

React frontend application for Task Manager.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env file:**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   echo "REACT_APP_ENV=development" >> .env
   ```

3. **Start development server:**
   ```bash
   npm start
   ```

4. **Open browser:**
   - App will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/     # React components
│   ├── services/       # API service layer
│   ├── context/        # React Context
│   ├── pages/          # Page components
│   ├── App.js
│   └── index.js
└── package.json
```

## Environment Variables

Create `.env` file in frontend folder:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

**Note:** Restart the React app after creating/updating `.env` file.
