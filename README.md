# SLTMOBITEL - Business Analyst Progress Tracker

Centralized task assignment, document submission, and performance tracking for Business Analysts at SLTMOBITEL.

---

## ⚡ Quick Start on this Device

Both services can be run simultaneously using either method:

### Method 1: One-Click Shell Script
```bash
./start.sh
```
*(Checks PostgreSQL, verifies database schema, starts Backend + Frontend, and opens `http://localhost:5173`)*

### Method 2: NPM Command
```bash
npm run dev
```

---

## 🌐 URLs & Ports

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
  *(Also available on your local network: `http://192.168.1.5:5173`)*
- **Backend API & Explorer**: [http://localhost:5001](http://localhost:5001)
- **Prisma Database Visual Studio**: [http://localhost:5556](http://localhost:5556)

---

### 🗄️ Open Database Studio
To view and edit the database tables in your browser:
```bash
npm run studio
```

---

## 🔐 Default Login Accounts

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **Supervisor / Admin** | `supervisor` | `password123` | `supervisor@slt.com` |
| **Business Analyst (BA)** | `alicesmith` | `password123` | `ba@slt.com` |

---

## 🛠️ Tech Stack & Services

- **Database**: PostgreSQL 18 (Local Homebrew service: `ba_tracker` database)
- **Backend**: Node.js, Express 5, Prisma ORM, JWT, Bcrypt
- **Frontend**: React 19, Vite 8, TailwindCSS, Lucide Icons
