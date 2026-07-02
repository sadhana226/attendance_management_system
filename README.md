# AttendIQ - Automated Student Attendance & Analytics Portal

AttendIQ is a modern, high-fidelity college attendance management and visual analytics system built using the **MERN (MongoDB, Express, React, Node.js)** stack. It features a stunning, premium **glassmorphism style design**, responsive analytics charts, custom drift animations, and a seamless light/dark mode theme engine.

---

## Key Features

1. **Aesthetics & Glassmorphic Feel**: Translucent frosted panels with custom dynamic floating blobs moving in the background, neon glowing indicators, custom sliders, and smooth transition keyframes.
2. **Flexible Theme Engine**: Easy-to-use toggle button supporting responsive Light Mode and Dark Mode styling via HSL variables.
3. **Resilient Local Database Fallback**: If MongoDB is not pre-installed or running, the backend automatically falls back to a local JSON file-based database (`backend/data/fallbackDb.json`). This ensures the app is **100% operational immediately** out-of-the-box.
4. **Interactive Dashboard & Subject Analytics**: Key performance widgets showing weekly attendance fluctuations and subject-by-subject performance ratios via responsive Recharts graphs.
5. **Roster Status Board**: Fast search options, Present/Absent/Late toggle nodes, and "Mark All Present" or "Mark All Absent" bulk controls.
6. **Student Directory Profile Registry**: Add new student registrations, update profiles, or remove entries.
7. **Timeline Audit Logs**: Interactive lookups to trace the chronological history of any student.

---

## Initial Credentials (Seeded Account)
- **Email**: `jenkins@college.edu`
- **Password**: `password123`

---

## Project Structure

```
attanence management/
├── backend/                  # Node.js + Express API
│   ├── config/db.js          # DB Connect and local JSON fallback setup
│   ├── controllers/          # API route handlers (Auth, Students, Attendance)
│   ├── models/               # MongoDB models (User, Student, Attendance)
│   ├── routes/               # API route definitions
│   ├── services/dbService.js # Unified database service wrapper
│   ├── data/seedData.js      # Seeding script
│   └── server.js             # Express server entry point
└── frontend/                 # Vite + React UI
    ├── src/
    │   ├── context/          # State context providers (AuthContext)
    │   ├── components/       # Visual components (Navbar, Sidebar, GlassCard, etc.)
    │   ├── pages/            # Tab pages (Dashboard, Attendance, Students, Analytics)
    │   └── styles/           # Styling variables & glass effects
    └── vite.config.js        # Vite config with API port proxies
```

---

## Setup & Running Guide

To run this application, you will need **Node.js** installed on your computer.

### Step 1: Install Node.js
If you do not have Node.js installed, download it from the official site: [https://nodejs.org/](https://nodejs.org/).

### Step 2: Install Dependencies

Open a terminal or command prompt inside the project folder:

1. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

### Step 3: Seed the Database
Before running the application, seed the database with default administrator accounts, student rosters, and mock attendance history to populate the dashboard metrics immediately.

Inside the `backend` folder, run:
```bash
npm run seed
```

*Note: This creates the local JSON file database fallback `backend/data/fallbackDb.json` automatically if MongoDB is not running.*

### Step 4: Run the Application

Start both servers to begin:

1. **Start the Backend Server**:
   Inside the `backend` folder, run:
   ```bash
   npm run dev
   ```
   *(Defaults to port `5000`)*

2. **Start the Frontend Development Server**:
   Inside the `frontend` folder, run:
   ```bash
   npm run dev
   ```
   *(Defaults to port `3000`)*

Open your browser and navigate to `http://localhost:3000` to access the portal!
