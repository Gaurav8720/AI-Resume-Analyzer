# AI Resume Analyzer 📄🚀

An advanced, full-stack web application powered by **AI** to analyze resumes against modern recruiter criteria and Applicant Tracking System (ATS) guidelines. Built using **Next.js 15**, **React 19**, **Prisma ORM**, and the **Gemini 2.5 Flash Lite** model.

---

## 🌟 Key Features

*   **🔒 Secure JWT-Based Auth & Email OTP:** Sign-up is protected by a 6-digit OTP verification system powered by **Nodemailer** (with a fallback to terminal console logs in development).
*   **📂 PDF Resume Upload & Parse:** Uploads PDF files locally, processes raw binary buffers, and parses text dynamically on the fly using `pdf-parse`.
*   **🤖 Gemini AI Core Engine:** Evaluates resume text through a structured parser utilizing **Gemini 2.5 Flash Lite** with JSON Mode to compute scores and provide lists of strengths, weaknesses, and actionable tips.
*   **📊 Interactive Dashboards & Result Cards:** Visual overall and ATS compatibility score meters with responsive progress gauges.
*   **📜 Analysis History Timeline:** View all past reviews on a dedicated timeline display showing aggregate average scores.
*   **🗑️ Secure Cascade Delete:** Allows deleting a resume to instantly remove its local PDF file from the disk and clean up all associated database report logs.

---

## 🛠️ Technology Stack

*   **Frontend & UI:** React 19, Next.js 15 (App Router), Vanilla CSS (Custom Glassmorphism and harmonious palettes).
*   **Backend & APIs:** Serverless Next.js API Routes (using Edge Middleware session locks).
*   **Database & ORM:** PostgreSQL Database connected via Prisma ORM 5.22.
*   **Authentication:** Hashed passwords using `bcryptjs` and stateless JWT-signed cookies.
*   **Email Engine:** SMTP sending using Nodemailer.

---

## 📂 Project Structure

```text
ai-resume-analyzer/
├── prisma/
│   ├── schema.prisma               # Database models (User, Resume, Analysis)
│   └── migrations/                 # Local migration SQL logs
├── public/
│   └── uploads/                    # Local storage directory for uploaded PDF files
├── src/
│   ├── app/
│   │   ├── api/                    # Serverless API routes
│   │   │   ├── analyze/            # Triggers Gemini resume analysis
│   │   │   ├── history/            # Fetches past reviews
│   │   │   ├── login/              # Verifies credentials & sets JWT cookie
│   │   │   ├── logout/             # Clears cookie session
│   │   │   ├── register/           # Handles signup, generates OTP & mails it
│   │   │   ├── resend-otp/         # Re-mails verification codes
│   │   │   ├── resume/[id]/        # Deletes resume, reviews, and disk files
│   │   │   ├── upload/             # Handles file upload & pdf parsing
│   │   │   └── user/me/            # Fetches user details for dashboard
│   │   ├── dashboard/              # User dashboard UI page
│   │   ├── history/                # History panel UI page
│   │   ├── login/                  # Log in UI page
│   │   ├── register/               # Sign up UI page
│   │   ├── result/[id]/            # Report display UI page
│   │   ├── verify-email/           # 6-Digit OTP verification panel UI page
│   │   ├── globals.css             # Unified styling system
│   │   ├── layout.tsx              # Root HTML wrapper and Toast context
│   │   └── page.tsx                # Redirection guard page
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton instantiator
│   │   ├── email.ts                # Nodemailer helper with dev mode fallback
│   │   └── gemini.ts               # Gemini client setup & JSON-mode prompt
│   └── middleware.ts               # Authentication router edge guard
```

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
*   Node.js (v18+)
*   PostgreSQL running locally (Default port `5432`)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root of the project:
```env
# Database connection
DATABASE_URL="postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/resume_ai?schema=public"

# Session JWT secret key
JWT_SECRET="YOUR_JWT_SECRET_KEY"

# Google AI Studio API Key (Gemini)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# SMTP Configuration for real OTP emails (Optional for dev)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-16-digit-gmail-app-password"
```

### 5. Synchronize the Database
Generate Prisma Client and apply migrations to sync with your PostgreSQL:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## ⚡ API Endpoints Map

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| **POST** | `/api/register` | Registers a new user, generates a code, and sends OTP. | No |
| **POST** | `/api/verify-otp` | Verifies the registration code and activates the account. | No |
| **POST** | `/api/resend-otp` | Re-sends a fresh 6-digit OTP code to the email. | No |
| **POST** | `/api/login` | Authenticates user credentials and sets session cookie. | No |
| **POST** | `/api/logout` | Clears the JWT session cookie to log out the user. | Yes |
| **GET** | `/api/user/me` | Fetches name, email, and latest reviews for the dashboard. | Yes |
| **POST** | `/api/upload` | Uploads PDF resume and extracts raw text. | Yes |
| **POST** | `/api/analyze` | Queries Gemini model and generates structural analysis. | Yes |
| **GET** | `/api/history` | Gathers all past analyses and overall scores. | Yes |
| **DELETE** | `/api/resume/[id]` | Deletes local file, database entries, and reviews. | Yes |

---

## 📄 License

This project is licensed under the MIT License. Feel free to clone, modify, and distribute!
