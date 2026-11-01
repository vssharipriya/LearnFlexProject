# Hosted demonstration deployment

The repository includes a Docker image and a Render Blueprint as deployment configuration. No LearnFlex hosting account, domain, persistent disk or public deployment has been created by this project package. The judge URL will only exist after the project owner connects this repository to a hosting provider and completes deployment.

## Deploy with Render

1. Push this project to a private or controlled Git repository. Do not commit live student data, a real `.env`, database files or real student credentials.
2. In Render, choose **New → Blueprint**, connect the repository and apply `render.yaml`.
3. Confirm the web service uses the Docker runtime and the persistent disk is mounted at `/var/data`. The blueprint requests a 1 GB disk on a paid Starter service; persistent disks are not available on every free tier.
4. Wait for the `/api/health` health check to pass. Render supplies HTTPS at the service URL and terminates TLS at its edge. Do not expose the local development HTTP server directly to the public internet.
5. Open the generated `https://<your-service>.onrender.com` URL on a laptop and two phones. Use synthetic demo accounts only.
6. Before a judging event, sign in as `TEACH06`, test the three student profiles, export a class backup and reset the shared demo only after preserving any evidence you need.

## Environment

- `PORT` is supplied by the host. Locally it defaults to `3100`.
- `HOST` defaults to `0.0.0.0`.
- `LEARNFLEX_DATA_DIR` points at persistent storage. The Render Blueprint uses `/var/data`.
- `LEARNFLEX_RETENTION_DAYS` defaults to `365`. Set `0` to disable automated retention deletion (not recommended for a real pilot).
- `LEARNFLEX_TLS_KEY` and `LEARNFLEX_TLS_CERT` are only for direct Node TLS deployments; on Render, use the platform HTTPS endpoint instead.

## Before publishing the URL

- Replace public demo credentials and seed identities with controlled judge-only accounts or keep the URL access-restricted.
- Confirm the school has approved the content, privacy notice, parent/guardian consent process, retention period, and data controller/contact information.
- Keep the service's persistent disk and class backup under access control. Test restoring data to a separate staging service.
- Do not use real student data in the public hackathon demo. A deployed HTTPS URL is not the same as school or legal approval.
