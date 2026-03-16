# MERN Monorepo

This repository contains a MERN stack monorepo with separate `backend/` and `frontend/` folders.

Structure
```
project-root/
├── backend/
│   ├── src/
│   ├── package.json
│   └── src/server.js
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

Quick start

Backend:
```
cd backend
npm install
npm run dev
```

Frontend:
```
cd frontend
npm install
npm run dev
```

Notes
- Keep secrets out of the repo: use `.env` (ignored) and commit `.env.example` instead.
- Use `git add backend/` or `git add frontend/` to create package-scoped commits.

Day 2: start

This commit marks the start of Day 2 work on the project.
