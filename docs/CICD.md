# CI/CD

## CI

.github/workflows/ci.yml runs on every push, pull request, and manual
dispatch. It performs:

- npm ci
- Oxlint
- production frontend build
- high-severity dependency audit
- backend tests against PostgreSQL 16
- production Docker image build without pushing

## CD

.github/workflows/deploy.yml runs only after the reusable CI workflow passes.
It publishes an image to GHCR with a commit SHA tag. Pushes to main also get
the latest tag; release tags such as v1.2.3 get a semver tag.

The server deploy is optional until the deployment secrets are configured. It
uploads docker-compose.prod.yml, writes the production env file, pulls the
exact commit image, starts the app, and fails unless the app becomes healthy.

## GitHub secrets

Configure these in the target GitHub Environment (production or staging):

| Secret | Required | Purpose |
| --- | --- | --- |
| DEPLOY_HOST | yes | VPS hostname or IP |
| DEPLOY_USER | yes | SSH user |
| DEPLOY_KEY | yes | SSH private key |
| DEPLOY_PORT | no | SSH port, defaults to 22 |
| DEPLOY_PATH | yes | Existing directory on the VPS |
| ENV_PRODUCTION | yes | Complete production .env content |

ENV_PRODUCTION must contain real production values and must not use
.env.example defaults. At minimum it should include:

    NODE_ENV=production
    DATABASE_URL=postgresql://USER:PASSWORD@postgres:5432/quehomnay
    POSTGRES_USER=USER
    POSTGRES_PASSWORD=PASSWORD
    POSTGRES_DB=quehomnay
    REDIS_URL=redis://redis:6379
    EXPERIENTIAL_API_KEY=your-real-key
    EXPERIENTIAL_API_BASE=https://api.experientiallabs.ai/v1
    EXPERIENTIAL_MODEL=gpt-5.6-luna
    AUTH_SESSION_DAYS=30
    ADMIN_EMAIL=admin@example.com
    ADMIN_PASSWORD=use-a-long-random-secret
    ADMIN_NAME=Quản trị viên

The VPS needs Docker, Docker Compose, and an existing writable DEPLOY_PATH. If
the GHCR package is private, the workflow's GitHub token must have package
read access for the repository.

## First deployment checklist

1. Rotate any API key that was previously committed to Git history.
2. Create the GitHub Environment and add the secrets above.
3. Add a required reviewer to the production Environment if approval is needed.
4. Put the reverse proxy (Nginx, Caddy, or a load balancer) in front of
   127.0.0.1:5001.
5. Configure database backups before using the production volume.
Contact messages are stored in PostgreSQL and managed from the admin inbox.
No SMTP configuration is required. The optional Google variables are only
needed when Google Sign-In is enabled.