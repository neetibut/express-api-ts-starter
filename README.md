# Express API Starter

A production-minded Express 5 API starter using TypeScript, strict compiler settings, structured logging, runtime configuration validation, secure HTTP defaults, rate limiting, graceful shutdown, and automated tests.

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Get started

```bash
npm install
cp .env.example .env
npm run dev
```

The API listens on `http://localhost:3000` by default.

```bash
curl http://localhost:3000/api/v1/health/live
curl http://localhost:3000/api/v1/health/ready
```

## Commands

| Command                 | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start the API with automatic reload           |
| `npm run build`         | Compile production JavaScript into `dist/`    |
| `npm start`             | Run the compiled production server            |
| `npm test`              | Run the test suite once                       |
| `npm run test:coverage` | Run tests and create a coverage report        |
| `npm run lint`          | Run ESLint with type-aware rules              |
| `npm run typecheck`     | Check TypeScript without emitting files       |
| `npm run check`         | Run all quality checks and a production build |

## Project structure

```text
src/
├── config/       # Validated environment and logger configuration
├── lib/          # Framework-independent shared primitives
├── middleware/   # Express middleware and error normalization
├── routes/       # Versioned API routers
├── types/        # Type augmentations
├── app.ts        # Side-effect-free Express app composition
└── server.ts     # Process lifecycle and graceful shutdown
test/             # Integration tests
```

Keep business logic out of route handlers: add domain modules under `src/modules/<feature>` with their controller, service, schema, and data access code colocated. Validate external input at the HTTP boundary, and convert expected failures to `AppError` instances so every response keeps the same error shape.

## Environment

Configuration is validated at startup. See [`.env.example`](./.env.example) for every supported value. `CORS_ORIGINS` accepts a comma-separated allowlist; use `*` only for public APIs that do not rely on credentials.

## Docker

```bash
docker compose up --build
```

The multi-stage image runs as an unprivileged user and contains production dependencies only.
