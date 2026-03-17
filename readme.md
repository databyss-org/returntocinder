# Return to Cinder

A searchable, browseable index of the works of Jacques Derrida and other authors. Part of the [Databyss](https://databyss.org) project.

## Tech Stack

- **Frontend**: React 16, Redux, React Router, JSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Build**: Webpack 4, Babel 6, Dart Sass

## Prerequisites

- Node.js v16 (v18+ not supported due to native dependency constraints)
- MongoDB (local) or a MongoDB Atlas / DigitalOcean managed database
- nvm recommended: `nvm use 16`

## Local Development

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
```

For a remote MongoDB connection, set `DATABASE_URL` to a full connection string (e.g. `mongodb+srv://...`).

### 3. Start MongoDB locally

```sh
npm run mongo-local
```

Or start MongoDB via Homebrew: `brew services start mongodb-community`

### 4. Restore a database dump (first time)

```sh
mongorestore --uri "mongodb://localhost:27017" --db databyss /path/to/dump
```

### 5. Run the development server

First start Express API server:

```sh
npm run dev-server
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
| `API_ADMIN_TOKEN` | If set, serves the admin UI instead of the public app |

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

The admin interface is available when `API_ADMIN_TOKEN` is set. Build with:

```sh
npm run build:admin
```

