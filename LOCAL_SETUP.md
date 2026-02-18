# Running Naltos Locally

## Prerequisites

1. **Node.js** v20 or higher — [Download here](https://nodejs.org/)
2. **PostgreSQL** v14 or higher — [Download here](https://www.postgresql.org/download/)
3. **npm** (comes with Node.js)

## Step 1: Clone the Project

Download or copy the project files to a folder on your machine.

## Step 2: Install Dependencies

Open a terminal in the project folder and run:

```bash
npm install
```

## Step 3: Set Up PostgreSQL

Create a new database for the project. You can do this through the PostgreSQL command line or a GUI tool like pgAdmin:

```bash
# Open the PostgreSQL shell
psql -U postgres

# Create the database
CREATE DATABASE naltos;

# Exit
\q
```

## Step 4: Create Environment Variables

Create a file called `.env` in the project root with the following contents. Replace the placeholder values with your actual PostgreSQL credentials:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/naltos
SESSION_SECRET=any-random-string-for-local-dev
```

- **DATABASE_URL**: Your PostgreSQL connection string. Replace `your_password` with your actual PostgreSQL password. If you used a different username, database name, or port, update those as well.
- **SESSION_SECRET**: Any random string. Used to secure user sessions. For local development, any value works.

### Optional: AI Features

The AI-powered lease generation and analytics agent use OpenAI. If you want those features to work locally, add these to your `.env` file:

```
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-openai-api-key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

Without these, the app will still run — AI features will just return errors when used.

## Step 5: Set Up the Database Tables

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

This creates all the required tables. The app will auto-populate demo data (properties, tenants, users) on first launch.

## Step 6: Start the App

```bash
npm run dev
```

The app will start and be available at **http://localhost:5000**

## Step 7: Log In

Open http://localhost:5000 in your browser. You'll see a demo login screen:

1. Click **"Use Demo Organization"** to set up the demo org
2. Select a role (Admin gives full access)
3. Click the user card to log in

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `DATABASE_URL must be set` | Make sure your `.env` file exists in the project root and has the correct `DATABASE_URL` |
| `Connection refused` on database | Make sure PostgreSQL is running. On Mac: `brew services start postgresql`. On Windows: check Services panel. On Linux: `sudo systemctl start postgresql` |
| `npm run db:push` fails | Double-check your `DATABASE_URL` credentials. Make sure the database exists (`CREATE DATABASE naltos;`) |
| Port 5000 already in use | Another app is using port 5000. Close it, or on Mac, disable AirPlay Receiver in System Settings > General > AirDrop & Handoff |
| AI features return errors | Add `AI_INTEGRATIONS_OPENAI_API_KEY` to your `.env` file with a valid OpenAI key |

## Building for Production

To create a production build:

```bash
npm run build
npm start
```

This compiles the frontend and backend, then runs the optimized version.
