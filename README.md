<!-- This README explains how to run the backend and frontend and where to set credentials -->
# PetCarePlus — Phase 1 (User Registration & Login)

Student: Justin Alain B. Monreal  
Backend: Spring Boot (Java 17)  
Frontend: React + Vite  
Database: Supabase (PostgreSQL)

## How to run the backend
- Open a terminal in the backend folder:
  - Folder: backend
  - Command: mvn spring-boot:run
- Set your environment variables first (see backend/.env.example).

## How to run the frontend
- Open a terminal in the frontend folder:
  - Folder: frontend
  - Command: npm run dev
- The app will open at http://localhost:5173

## Where to paste Supabase credentials
- Copy backend/.env.example to backend/.env and fill:
  - SUPABASE_DB_URL=jdbc:postgresql://<host>:5432/postgres
  - SUPABASE_DB_USER=postgres
  - SUPABASE_DB_PASSWORD=your-supabase-password
  - JWT_SECRET=replace-this-with-a-long-random-secret-string (base64-encoded, long and random)
- Ensure your environment loads these variables when starting the backend.

## API Endpoints
- POST /api/auth/register — name, email, password
- POST /api/auth/login — email, password

## Swagger UI
- Visit http://localhost:8080/swagger-ui.html to explore the API (when backend is running).

---
