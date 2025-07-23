# Conflict Detection Buffer Backend

This is the backend API for the Resource Booking System. It provides booking management with conflict detection and 10-minute buffer logic, authentication, and optional availability checking.

---

## ⚙️ Features

- ✅ Booking API with validation and 10-minute buffer conflict detection
- 📆 Query bookings by resource and date
- 🔐 JWT-based Authentication
- 🧪 Integrated tests using Jest + Supertest
- 🧼 ESLint + Prettier setup
- 🌐 CORS-enabled with environment config
- 🔄 Prisma for database ORM

---

## 🔌 Setup Instructions

### 1. Clone the repo

```bash
git clone <https://github.com/rubayetseason/conflict-detection-buffer-backend.git>
cd conflict-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root with the following:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_mongodb_database_uri
BCRYPT_SALT_ROUNDS=10
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Prisma Setup

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the server

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 🧪 Running Tests

This project uses **Jest** and **Supertest** for integration tests.

```bash
npm run test
```

---

## 📂 Project Structure

```
app/
├── modules/
│   ├── auth/
│   └── bookings/
├── middlewares/
├── routes/
config/
prisma/
```

---

## 🔗 API Routes

### Bookings

- `POST /api/v1/bookings` – Create booking with buffer conflict check
- `GET /api/v1/bookings` – Fetch bookings with optional filters
- `GET /api/v1/bookings/available-slots` – Check slot availability
- `DELETE /api/v1/bookings/:bookingId` – Delete booking

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`

---

## 📝 Scripts

- `dev` – Run in dev mode
- `start` – Run production build
- `build` – Build with TypeScript
- `test` – Run Jest tests
- `lint:check`, `prettier:check` – Check code style

---

## 🧰 Tech Stack

- **Express.js** with **TypeScript**
- **Prisma ORM**
- **Jest + Supertest** for testing
- **Vercel** for deployment