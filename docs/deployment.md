# Publish Virus Atlas on Vercel

The app builds as a Next.js application, including its server route for the tutor. Keep the Next.js framework preset; do not use a static HTML export.

## First deployment

1. Push the project to your GitHub repository. The completed application is currently on `virus-atlas-v4-wip`; local `main` still points to the initial starter. Choose the completed branch when importing.
2. Sign in at https://vercel.com/new and import that repository.
3. Select **Next.js** as the framework and the repository root (`./`) as the root directory.
4. Use Node.js **24.x** (also declared in `package.json`). Keep the framework's default output directory. The build command is `npm run build` and the install command is `npm ci`.
5. Leave environment variables empty for the first deployment. The tutor returns matching curated passages without an API key.
6. Deploy, then check the returned HTTPS address: atlas, a virus profile, a protein viewer, trait filters, drawing download, and tutor.

For automatic production updates, set Vercel's production branch to the branch containing the completed app. If you later merge the app into `main`, update that setting accordingly. Other branches can have preview deployments.

## Optional AI tutor

The initial public deployment should use the curated-source fallback. AI-assisted responses are optional and require a separately configured server-side `ANTHROPIC_API_KEY`. Do not upload `.env.local` or paste credentials into GitHub. The current rate limiter is per-process, so it does not provide a shared quota across serverless instances; add durable rate limiting before exposing a paid API key to unrestricted public traffic.

## Custom domain

Once the Vercel address works, add an owned domain in the project's Domains settings and use the DNS values Vercel provides. A custom domain is optional.

## References

- https://vercel.com/docs/git
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions
- https://vercel.com/docs/environment-variables
