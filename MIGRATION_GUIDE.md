# Walkthrough: Database Migrations & Schema Implementation

I have successfully set up the Migration system and implemented your **Doctor Prescription Digitization System** schema.

## What I've Done

### 1. Migrations Setup

- **Dependencies**: Installed `dotenv` to manage database credentials locally.
- **Configuration**: Created `src/db/data-source.ts` for TypeORM CLI.
- **Scripts**: Added easy-to-use commands in `package.json`.

### 2. Schema Implementation (from DBML)

I created 5 TypeORM entities representing your database design:

- `src/doctor/doctor.entity.ts`
- `src/patient/patient.entity.ts`
- `src/prescription/prescription.entity.ts`
- `src/medicine/medicine.entity.ts`
- `src/prescription-email/prescription-email.entity.ts`

### 3. Execution

- **Generated Migration**: Created the initial migration file in `src/db/migrations/`.
- **Applied Migration**: Successfully executed the migration inside your Docker container. Your database now has all the tables and relationships!

---

## How to use Migrations in the Future

Since you are using Docker, you should run migration commands inside the container to avoid connection issues.

> [!NOTE]
> Use these commands from your main project folder:

### To generate a new migration (after changing entities):

```bash
docker exec nest_backend_dev npm run migration:generate -- src/db/migrations/MyNewChange
```

### To apply pending migrations:

```bash
docker exec nest_backend_dev npm run migration:run
```

### To undo the last migration:

```bash
docker exec nest_backend_dev npm run migration:revert
```

---

## Verification Results

The migration ran successfully and the database tables are now created exactly as per your DBML design.
