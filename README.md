# cameronwillia.ms

Source for [cameronwillia.ms](https://cameronwillia.ms), built with [Astro](https://astro.build) and hosted on Firebase Hosting. Requires Docker.

## Develop

```sh
make dev       # dev server at http://localhost:4321
make build     # type-check and build to dist/
make preview   # serve the production build at http://localhost:4322
```

## Deploy

Pushes to `main` deploy automatically via GitHub Actions. Pull requests get a preview URL.

One-time setup, which adds the Firebase deploy secret to the GitHub repo:

```sh
make deploy-setup
```

Decline the workflow files it offers to create; they already exist in `.github/workflows`.
