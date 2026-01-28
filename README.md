# Pastebin Lite

A lightweight, high-performance Pastebin clone built with **Next.js 15**, **Tailwind CSS**, and **Prisma**. It allows users to quickly share snippets of code or text with customizable expiration times and view limits.

## ✨ Features

- **Quick Share**: Instant paste creation and shareable links.
- **Auto-Expiration**: Set a Time-to-Live (TTL) for your pastes (up to 7 days).
- **View Limits**: Limit the number of times a paste can be viewed.
- **Responsive Design**: Modern, dark-themed UI that works on all devices.
- **Type-Safe**: Built with TypeScript for robustness.

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

- **Node.js**: v18.x or later.
- **PostgreSQL**: A running instance (local or hosted like Supabase/Neon).
- **pnpm**: Recommended package manager.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/pastebin-lite.git
   cd pastebin-lite
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your database connection strings:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/pastebin_db"
   DIRECT_URL="postgresql://user:password@localhost:5432/pastebin_db"
   ```

4. **Database Migration:**
   Apply the Prisma schema to your database:
   ```bash
   pnpm prisma migrate dev
   ```

5. **Run the development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💾 Persistence Layer

This project uses **Prisma ORM** as the persistence layer, interfacing with a **PostgreSQL** database. 

- **Schema**: Defined in `prisma/schema.prisma`.
- **Primary Model**: `Paste` (stores content, timestamps, TTL, and view counts).
- **Efficiency**: Database operations are handled server-side via Next.js API routes and server components.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **Database Architecture**: PostgreSQL + Prisma
- **Icons**: Lucide React
- **Language**: TypeScript

---
Made with ❤️ by Razeema