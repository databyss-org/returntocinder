# Return to Cinder

A searchable, browseable index of the works of Jacques Derrida and other authors. Part of the [Databyss](https://databyss.org) project.

## Local Development

### Prerequisites

#### Node.js v18
v18+ not supported due to native dependency constraints.

Recommended installation:
- if needed, [install NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)
- if needed, run `nvm install lts/hydrogen`
- run `nvm use lts/hydrogen`

#### MongoDB >=6

- [Installation on Linux](https://www.mongodb.com/docs/v7.0/administration/install-on-linux/)
- [Installation on MacOS using Homebrew](https://www.mongodb.com/docs/v7.0/tutorial/install-mongodb-on-os-x/#installing-mongodb-7.0-edition-edition)

### 1. Install dependencies

```sh
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
DATABASE_URL=mongodb://localhost:27017
DB_NAME=databyss
PORT=3030
API_URL=http://localhost:3030/api
DEFAULT_AUTHOR=DD
ADMIN_PASSWORD_HASH=<sha256-hex-of-admin-password>
ADMIN_TOKEN_SECRET=<long-random-secret>
```

For a remote MongoDB connection, set `DATABASE_URL` to a full connection string (e.g. `mongodb+srv://...`).

Generate `ADMIN_PASSWORD_HASH` with:

```sh
npm run admin:hash-password -- "your-admin-password"
```

This command updates (or adds) `ADMIN_PASSWORD_HASH` in `.env`.

### 3. Start MongoDB locally

If you want MongoDB started for you during local development, use `npm run dev:server`. This command will create and use a project-local data directory automatically when `DATABASE_URL` points at a local MongoDB instance.

If you want to run MongoDB yourself, or if you're on MacOS and installed via Homebrew:

```sh
brew services start mongodb-community
```

### 4. Restore a database dump (first time)

```sh
mongorestore --uri "mongodb://localhost:27017" --db databyss /path/to/dump
```

### 5. Run the development server

First start Express API and MongoDB servers:

```sh
npm run dev:server
```

Then starts the Webpack dev server with hot reload (frontend):

```sh
npm run dev
```

The app will be available at `http://localhost:8080` (webpack dev server) and the API at `http://localhost:3030/api`.

## Production Build & Deployment

### Build

Compiles the server with Babel and bundles the frontend with Webpack:

```sh
npm run build
```

### Start

```sh
npm start
```

The server listens on `PORT` (default `8080`) and `0.0.0.0` (localhost).

### Environment variables (production)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full MongoDB connection string |
| `DB_NAME` | Database name to select after connecting |
| `PORT` | HTTP port (default `8080`) |
| `ADMIN_PASSWORD_HASH` | SHA-256 hash of the admin login password |
| `ADMIN_TOKEN_SECRET` | Secret used to sign 24-hour admin tokens |

### DigitalOcean App Platform

Use the standard build command on App Platform. The server generates a fresh cache-busting token when it starts, so each deploy gets a new value even if App Platform reuses the build output.

Example app spec entry:

```yaml
services:
  - name: web
    build_command: npm run build
```

Do not use `${_self.COMMIT_HASH}` for this case. That only changes when the commit changes, while the server-start token changes on every deploy.

## Data Management Scripts

All scripts are run with `npm run <script>` and require the env vars above.

| Script | Description |
|---|---|
| `dump` | Dump the database to a local file |
| `supplement` | Import supplemental entries |

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/config` | App configuration |
| `GET /api/authors` | List all authors |
| `GET /api/sources` | List all sources |
| `GET /api/motifs` | List all motifs |
| `GET /api/motifs/:mid` | Motif detail with sources |
| `GET /api/motifs/:mid/_all` | All entries for a motif |
| `GET /api/motifs/:mid/:sid` | Entries for a motif within a specific source |
| `GET /api/sources/:sid` | Source detail with entries |
| `GET /api/pages/:path` | Page content by path |
| `GET /api/menus/:path` | Menu content by path |
| `GET /api/search?query=&author=` | Full-text entry search |

## Admin

The admin interface is available at `/admin`.

- Visit `http://localhost:8080/admin`
- Sign in with the admin password (validated by `POST /api/admin/login`)
- The backend returns a signed token that expires after 24 hours

Build with:

```sh
npm run build:admin
```

