# 💊 PillReminder – Smart Medication Management Platform

**PillReminder** is a smart healthcare and medication management platform designed to help patients manage their prescriptions, medication schedules, reminders, and pharmacy needs in one place.

The platform aims to connect patients, doctors, pharmacies, and family caregivers through an integrated digital healthcare ecosystem.

Our goal is to make medication management simpler, smarter, and more accessible through modern web technologies and AI-powered assistance.

---

## 🚀 Project Overview

Managing multiple medicines, remembering medication schedules, tracking prescriptions, and finding available medicines can be challenging.

PillReminder aims to solve these problems through a centralized platform that provides:

- Smart medication reminders.
- Digital prescriptions.
- Doctor and patient connectivity.
- Pharmacy marketplace.
- Medicine inventory management.
- Family caregiver support.
- AI-powered conversational assistance.

---

## ✨ Key Features

### 👨‍⚕️ Doctor Portal
- Doctor registration and authentication.
- Patient management.
- Digital prescription creation.
- Medication dosage and schedule configuration.
- Prescription management.
- Secure prescription sharing.
- Patient adherence insights, subject to authorization.

### 🧑‍💻 Patient Portal
- Patient registration and login.
- Digital prescription management.
- Medication schedule tracking.
- Smart medication reminders.
- Taken, Snooze and Skip actions.
- Medication history.
- Upcoming reminders.
- Prescription information management.

### 🏥 Pharmacy Marketplace
- Pharmacy registration and management.
- Medicine catalogue.
- Medicine inventory management.
- Medicine availability tracking.
- Pharmacy order management.
- Prescription verification workflow.
- Medicine price and stock information.

### 👨‍👩‍👧 Family Guardian Portal
- Family member linking.
- Consent-based medication monitoring.
- Pending reminder notifications.
- Authorized medication activity.
- Refill information.

### 🤖 PillReminder AI – Gemini-Powered Assistant
- Natural-language conversations.
- AI-powered question answering using Google Gemini.
- General knowledge assistance.
- Application-aware assistance.
- Medication schedule information retrieval.
- Prescription-related explanations.
- Context-aware conversations.

*AI features and integrations are being developed progressively. Clinical decisions remain with qualified healthcare professionals.*

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Frontend framework |
| React.js | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | UI styling |
| NestJS | Backend framework |
| Node.js | Backend runtime |
| PostgreSQL | Database |
| Prisma ORM | Database management |
| Google Gemini API | AI assistant |
| Flutter | Planned mobile application |
| Docker | Development infrastructure |

---

## 🏗️ Project Architecture

```text
PillReminder/
│
├── web/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── modules/
│   │   └── services/
│   └── public/
│
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── prescriptions/
│   │   ├── medications/
│   │   ├── reminders/
│   │   ├── pharmacies/
│   │   ├── inventory/
│   │   ├── orders/
│   │   └── prisma/
│   └── prisma/
│
├── mobile/
│   └── lib/
│
├── infrastructure/
│   └── docker-compose.yml
│
├── .gitignore
└── README.md
```

*The architecture may evolve as additional modules are implemented.*

---

## ⚙️ Installation and Setup

### Prerequisites

Install the following tools:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- PostgreSQL (or PostgreSQL through Docker)

### 1. Clone the repository

```bash
git clone https://github.com/samarthgule-wq/PillReminder.git
```

### 2. Navigate to the project

```bash
cd PillReminder
```

### 3. Start the database

Navigate to the infrastructure directory:

```bash
cd infrastructure
```

Start PostgreSQL using Docker Compose:

```bash
docker compose up -d
```

### 4. Configure the backend

Open another terminal:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Configure the backend `.env` file with your database connection and required secrets.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/pillreminder?schema=public"

PORT=4000

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model
```

Use your own credentials. Never commit real API keys or passwords.

Run Prisma migrations using the existing project migration setup:

```bash
npx prisma migrate deploy
```

Start the backend development server:

```bash
npm run start:dev
```

Backend URL:

`http://localhost:4000`

Health check:

`http://localhost:4000/health`

### 5. Configure the frontend

Open another terminal:

```bash
cd web
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm run dev
```

Frontend URL:

`http://localhost:3000`

---

## 🔐 Security and Privacy

PillReminder is designed with healthcare data privacy and security in mind.

Important security principles include:

- Secure authentication.
- Role-based access control.
- Patient data ownership.
- Consent-based caregiver access.
- Secure prescription handling.
- Protected API credentials.
- Controlled access to sensitive information.
- Pharmacy verification workflows.

Use fictional test data during development. Production deployment requires additional security, privacy, clinical and regulatory validation.

---

## 🗺️ Future Roadmap

- [ ] Complete patient portal.
- [ ] Complete doctor portal.
- [ ] Complete pharmacy marketplace.
- [ ] Implement family guardian features.
- [ ] Integrate Google Gemini AI assistant.
- [ ] Implement secure AI access to application data.
- [ ] Add prescription QR functionality.
- [ ] Add prescription OCR scanning.
- [ ] Add multilingual AI voice assistant.
- [ ] Develop Flutter mobile application.
- [ ] Implement mobile push notifications.
- [ ] Add pharmacy delivery and payment integration.
- [ ] Improve analytics and reporting.

---

## 🎯 Project Vision

Our vision is to build an intelligent healthcare ecosystem that connects patients, doctors, pharmacies, and caregivers.

By combining digital prescriptions, medication reminders, pharmacy services, and AI-powered assistance, PillReminder aims to improve medication management and create a more connected healthcare experience.

---

## 👨‍💻 Developer

**Samarth Guledgudd**

GitHub: [@samarthgule-wq](https://github.com/samarthgule-wq)

Project: [PillReminder](https://github.com/samarthgule-wq/PillReminder)

---

## 📄 License

This project is currently under development. A license will be added when the project's distribution and usage terms are finalized.

---

**PillReminder – Never Miss Your Medication. Manage Your Health Smarter.** 💊
