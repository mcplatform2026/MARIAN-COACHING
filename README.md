# Marian Coaching - Client & Practice Management Portal

An integrated client portal and practice operations platform for Marian Coaching. Built with React, TypeScript, Tailwind CSS, Express, and Firebase.

## Key Features

- **Practice Dashboard**: High-level KPI overview, monthly metrics, recent clients, and quick access.
- **Client Management**: Onboarding, profile tracking, contact history, and notes.
- **Session Scheduling**: Appointment management, attendance tracking, and calendar alignment.
- **Agreements & Document Studio**: Contract generator, digital signature capture, and document previews.
- **Invoice Studio**: Customizable branded invoices, multi-currency support, payment terms, and direct PDF downloads.
- **Monthly Practice Reports**: Automatic generation of financial ledger summaries, key metrics snapshots, and single-page A4 PDF reporting.
- **Task Tracker**: Operational action items and milestone monitoring.
- **Server-Side PDF Engine**: Headless Chromium print engine ensuring pixel-perfect A4 invoice and monthly report exports.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, TipTap
- **Backend / API**: Express, Node.js (`server.ts`), Puppeteer Core
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **PDF Generation**: Headless Chromium A4 rendering (`/api/generate-pdf`) with client-side fallback

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application runs on port `3000`.

### Production Build

```bash
npm run build
npm start
```
