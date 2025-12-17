# CodeSync

**A Real-Time Technical Interview Platform**

CodeSync is a collaborative environment designed to streamline remote technical interviews. It combines real-time video communication, instant messaging, and a synchronized code editor into a single, cohesive interface, allowing interviewers and candidates to interact seamlessly without switching tools.

**Live Demo:** [https://code-sync-0xoi.onrender.com](https://code-sync-0xoi.onrender.com)
*(Note: Please allow a moment for the backend to spin up on the free tier)*

---

## Table of Contents
- [CodeSync](#codesync)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Key Features](#key-features)
  - [Tech Stack](#tech-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [DevOps \& Deployment](#devops--deployment)
  - [System Architecture](#system-architecture)
  - [Project Structure](#project-structure)

---

## Project Overview
CodeSync solves the fragmentation of remote technical interviews by unifying communication and collaboration tools. Unlike generic video conferencing apps, it provides a dedicated coding environment where changes are reflected instantly across all participants' screens, ensuring a smooth technical assessment process.

---

## Key Features

* **Secure Authentication:** Integrated with Clerk for secure, seamless sign-ups, session management, and route protection.
* **HD Video & Audio:** Crystal clear video calls powered by the Stream Video SDK with low-latency performance.
* **Real-Time Chat:** Built-in messaging system using Stream Chat for text communication alongside coding.
* **Collaborative Code Editor:** Real-time bi-directional code synchronization using Socket.io. Type in one window, see it instantly in the other.
* **Smart Invite System:** Direct deep-link access (e.g., `/session/:id`) with role-based entry mechanisms.
* **Permissions & Privacy:** Logic to restrict room access to the specific host and candidate, preventing unauthorized joins.
* **Session Management:** Capabilities to create named sessions, view past interview history, and select coding problems.

---

## Tech Stack

### Frontend
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS + DaisyUI
* **State Management:** React Hooks
* **Real-Time Media:** GetStream.io (Video & Chat SDKs)
* **Editor:** Monaco Editor / CodeMirror
* **Icons:** Lucide React

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Real-Time Engine:** Socket.io (WebSockets)
* **Auth Middleware:** Clerk SDK

### DevOps & Deployment
* **Hosting:** Render (Web Service for Backend, Static Site for Frontend)
* **Version Control:** Git & GitHub

---

## System Architecture

CodeSync utilizes a hybrid real-time architecture to ensure performance and scalability:

1.  **Authentication Flow:** Requests are validated via Clerk middleware before reaching the API, ensuring only authenticated users can access protected routes.
2.  **REST API:** Handles standard CRUD operations such as session creation, retrieval (`GET /active`, `GET /my-recent`), and user invites.
3.  **WebSocket Layer (Socket.io):** Establishes a persistent, bi-directional connection for the **Code Editor**. Events like `code-change` are broadcast to the specific room ID to sync state between clients.
4.  **WebRTC Layer (Stream):** Handles heavy media traffic (Video/Audio) offloading it from the main server to ensure low latency and high quality.

---

## Project Structure

```bash
code-sync/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Logic for sessions & chat
│   │   ├── models/        # Mongoose Schemas (Session, User)
│   │   ├── routes/        # API endpoints
│   │   ├── lib/           # DB connection & Env config
│   │   └── server.js      # Entry point (Express + Socket.io)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (CodeEditor, VideoCall)
│   │   ├── pages/         # Dashboard, SessionPage
│   │   ├── hooks/         # Custom hooks (useStreamClient)
│   │   └── api/           # Axios setup
│   └── vite.config.js
└── README.md