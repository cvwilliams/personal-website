# cameronwillia.ms

Personal site: resume, projects, thoughts and a "now" page. Built with [Astro](https://astro.build)
as a fully static site and hosted on Firebase Hosting. Everything runs in Docker containers
(OrbStack on macOS), so you don't need Node installed locally.

## Run it

```sh
make dev        # or: docker compose up
```

Then open http://localhost:4321 (OrbStack also serves https://dev.personal-website.orb.local).
Edits to files under `src/` hot-reload.

The first run installs dependencies inside the container and writes `package-lock.json` to the
repo; commit it.

| Command        | What it does                                                      |
| -------------- | ----------------------------------------------------------------- |
| `make dev`     | Dev server with hot reload on :4321                               |
| `make build`   | Type-check (`astro check`) and build static files into `dist/`    |
| `make preview` | Build, then serve `dist/` on :4322 to check the production output |
| `make login`   | Log in to Firebase (one time; stored in a Docker volume)          |
| `make deploy`  | Build, then deploy `dist/` to Firebase Hosting                    |
| `make shell`   | Shell inside the dev container (run `npm` commands here)          |
| `make clean`   | Remove containers, volumes, `dist/` and `.astro/`                 |

Adding a package: `make shell`, then `npm install <pkg>`.

## Edit content

| What             | Where                                     |
| ---------------- | ----------------------------------------- |
| Name, intro, links | `src/data/site.ts`                      |
| Resume           | `src/data/resume.ts`                      |
| Thoughts           | `src/content/thoughts/*.md` (one per post) |
| Projects         | `src/content/projects/*.md`               |
| Now page         | `src/content/now/now.md` (overwrite it)   |

Frontmatter fields are defined (and validated) in `src/content.config.ts`. A missing or
mistyped field fails the build with a clear message. `draft: true` hides a post or project
from production builds but keeps it visible in the dev server.

## Deploy

Deploys run on GitHub Actions:

- **Push or merge to `master`** → builds, type-checks and deploys to the live site
  (`.github/workflows/deploy.yml`).
- **Open a pull request** → deploys a temporary preview and comments the URL on the PR
  (`.github/workflows/preview.yml`). Previews expire after 7 days.

Both need a repo secret named `FIREBASE_SERVICE_ACCOUNT_PERSONAL_WEBSITE_2D952`. One-time setup:

```sh
make login          # log in to Firebase
make github-setup   # creates the service account and uploads the secret to GitHub
```

`make github-setup` asks for the repo (`cvwilliams/personal-website`) and offers to write its
own workflow files. Answer **No** to both workflow questions (or delete any
`.github/workflows/firebase-hosting-*.yml` it creates): the workflows above already exist.

Manual deploy from your machine, if ever needed: `make deploy`.
