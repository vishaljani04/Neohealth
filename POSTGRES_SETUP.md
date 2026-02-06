# PostgreSQL Migration Guide for NeoHealth

This guide explains how to switch the local NeoHealth development environment from SQLite to PostgreSQL.

## 1. Install PostgreSQL

If you haven't already, download and install PostgreSQL for Windows.
- **Download:** [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
- **Installation:** Follow the installer steps. Remember the **password** you set for the `postgres` user.

## 2. Create Database

Open **pgAdmin** or a terminal (Powershell) and run the following command to create the database:

```powershell
# If using terminal (you might need to add psql to PATH)
psql -U postgres
```

Inside the SQL shell:
```sql
CREATE DATABASE neohealth;
\q
```

## 3. Update Configuration

1. Open `e:\NeoHealth\backend\.env` key.
2. Comment out the SQLite line.
3. Add the PostgreSQL connection string.

**Example `.env`:**

```ini
SECRET_KEY=neohealth-super-secret-123
JWT_SECRET_KEY=neohealth-jwt-secret-456
# DATABASE_URL=sqlite:///neohealth.db
# Replace 'password' with your actual PostgreSQL password
DATABASE_URL=postgresql://postgres:password@localhost:5432/neohealth
PORT=5000
```

## 4. Run Migration Script

This script will read your existing data from SQLite and push it to the new PostgreSQL database.

**Important:** Make sure you are in the `backend` folder and your virtual environment is activated.

```powershell
cd backend
# Activate venv if not active
..\venv\Scripts\activate
# OR if venv is inside backend
venv\Scripts\activate

# Install PostgreSQL adapter if missing (it should be there)
pip install psycopg2-binary archive

# Run Migration
python migrate_to_postgres.py
```

## 5. Verify

Start the application again:
```powershell
cd ..
npm start
```

The application should now be connected to PostgreSQL. You can verify this by checking if new data persists in the Postgres table using `pgAdmin`.
