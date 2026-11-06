# Agent guide

Static personal site for Cameron Williams (cameronwillia.ms). Astro 7 (Zod 4 via `astro/zod`, Rust compiler: write strictly valid, fully closed HTML), no UI framework, and
no client-side JavaScript except the tiny theme toggle. Deployed as plain files to Firebase Hosting, so **no SSR, no server
endpoints, no on-demand rendering**: every page must be prerenderable at build time.

## Commands (run in containers; Node is not installed on the host)

- Dev server: `docker compose up dev` → http://localhost:4321
- Verify a change: `docker compose run --rm builder` (runs `astro check`, `astro build` and the
  internal link check, `npm run check:links`). Run it
  before calling work done; it must pass with no errors.
- Run npm: `docker compose run --rm dev npm <args>`
- Deploys happen in GitHub Actions (push to `main` → live; pull requests → preview channel).
  Every pull request also runs `ci.yml` (check, build, link check, no secrets). Dependabot
  (`.github/dependabot.yml`) opens weekly grouped npm PRs and monthly Actions/Docker PRs; they
  skip the preview deploy because Dependabot PRs can't read the repo's secrets.
  Don't deploy manually unless asked.

## Layout

```
src/
  content.config.ts     Zod schemas for the thoughts, projects and now collections
  content/              Markdown content (thoughts/, projects/, now/YYYY-MM-DD.md)
  data/site.ts          Name, intro, links, section list
  data/resume.ts        Resume as typed data
  data/about.mdx        About page copy (bio, albums, map, Elsewhere)
  data/desert-island.ts Desert island albums (artwork and links come from the Apple Music catalog)
  data/places.ts        Places on the About map (name, country, lat, lon, kind: home/lived)
  data/world-dots.ts    Generated 2° land grid for the dotted world map
  lib/content.ts        getThoughts(), getProjects(), readingTime(), formatDate()
  layouts/Base.astro    <html>, <head>, fonts, global CSS
  layouts/Section.astro Inner-page shell: header nav, tinted hero card, footer
  components/           Tile (homepage), SectionArt (line art), Arrow, SiteFooter
  pages/                File-based routes; [slug].astro pages use getStaticPaths
  styles/global.css     Design tokens + base + .prose
  styles/home.css       Homepage tile grid
  styles/page.css       Inner-page shell
```

## Design system (primary colors, Bauhaus / MoMA-poster style)

- Palette: paper `#f2ede4`, ink `#141414`, red `#ea4b35`, blue `#1e4fa6`, yellow `#f4c12b`
  (`--paper`, `--ink`, `--red`, `--blue`, `--yellow` in `src/styles/global.css`). Don't add
  new hues; tints and shades of these are fine.
- Light and dark themes. Theme-dependent color tokens are written as
  `light-dark(<light>, <dark>)`; always give both values. Default follows the OS; the
  `ThemeToggle` component stores an explicit choice as `data-theme` on `<html>` and animates
  the switch with a View Transition (circular reveal).
- Sections are flat color fields: Resume blue, Projects red, Thoughts yellow, Now ink (paper in
  dark mode), About a darker paper with all four colors in its art. The homepage name badge links
  to /about and morphs into its hero. Set `data-section="resume|projects|thoughts|now|about"` on an element to get
  `--surface`, `--surface-hover`, `--on-surface`, `--on-surface-muted`, `--rule`, and
  `--accent` (the section color, darkened/lightened to read on the page background).
  Text on a field must use `--on-surface` (ink on red/yellow, paper on blue).
- Gotcha: a custom property that references another (`--x: var(--surface)`) resolves where
  it's declared, so define derived tokens on the element that has `data-section`, not on `:root`.
- Font: Libre Franklin (a Franklin Gothic revival, the MoMA typeface) via Fontsource, for
  everything. Headings heavy (750–800) with tight tracking; labels small, uppercase, tracked
  (`.eyebrow`). `--font-label` is the same family; `.mono` just means tabular numbers.
- Art lives in `SectionArt.astro`: 200×200 viewBox, flat cut-paper shapes filled with the
  `.f-red/.f-blue/.f-yellow/.f-ink/.f-paper/.f-on` classes (SVG attributes can't read CSS
  variables). Never use a section's own color in its art. `.grain` adds a print-grain overlay.
- Homepage: 2×2 full-viewport grid at ≥900px. On hover only the active tile scales up slightly
  in place (`--hover-scale`, ~1.2%, staying inside the 10px gutter) with a long ease-out
  (`--dur`, `--ease-soft`); the grid, other tiles and name badge never move. Below 900px the
  tiles stack and the page scrolls.
- Pages with section art pass `art` to Base (homepage, Section layout); only those get the
  art-state and transition scripts. Base preloads the Latin Libre Franklin file. Remote images are
  requested at about 2x display size (Goodreads `_SY180_`, Apple Music 300px).
- Transition names are set by one inline script in Base.astro's `<head>`: on the homepage it names
  the tile for the section being navigated to/from; on section pages it names the hero only when
  the other page is the homepage. The art-state script in Base.astro owns `sessionStorage` and
  exposes `window.siteArt.saveDrag()` for the homepage drag script.
- Homepage tiles fill the grid in source order: Now (top-left), Projects, Thoughts, Resume
  (bottom-right). The name badge shows a live New York clock.
- Each browser session reshuffles every tile's art colors (only among colors that composition
  already uses) and nudges/tilts/scales it via `--art-x/-y/-r/-s`. The inline script in Base.astro
  stores this per section in `sessionStorage['art-state']` (with any dragged shape offsets) and
  applies it to both `.tile-art` and `.hero-art`, so the art keeps its arrangement across pages
  and back navigation. Keep new art compatible: fill with `.f-*` classes, never use the section's
  own color, and keep the shape order identical wherever the art renders.
- Page transitions use native cross-document View Transitions (`@view-transition` in global.css).
  Between the homepage and a section, `field-<section>`, `art-<section>` and `title-<section>`
  morph the clicked tile into its section hero: the `field-*` group renders as one solid,
  rounded block in the section color that grows or shrinks (its snapshots are hidden), like an
  Android shared-element transition; titles and art scale a single snapshot (`vt-title`/`vt-art`);
  tile text fades out fast and `hero-text` fades in late, so nothing stretches. Names are set
  only on the tile (index.astro) and hero (Section.astro) being navigated to or from the
  homepage, by `pageswap`/`pagereveal` scripts with click/referrer fallbacks for Safari; static
  names would leave other tiles hanging around and make same-section navigation awkward.
  The navigated tile gets `.vt-active`, which drops its hover state before the snapshot so the
  morph starts from the plain block. Navigation between pages within a section is a plain quick
  crossfade. Names must stay unique
  per page. Prefetch-on-hover is enabled in astro.config.mjs.
- Easter egg: with a mouse, art shapes are draggable; a drag doesn't trigger the tile link.
- 404 is a museum piece: "404" built from shapes plus a gallery wall label. Keep the joke going
  if you edit it.
- Respect `prefers-reduced-motion`: keyframe animations are disabled globally; anything that
  moves on hover (scale, translate, rotate) needs its own reduced-motion override, while color and
  opacity fades may stay.
- Keep text contrast at 4.5:1 or above.

## Accessibility

- Target WCAG 2.2 AA. Pages with navigation before the content start with a "Skip to content"
  link to `#main` (the homepage opts out with `skipLink={false}`, since its content comes first);
  give each page's `<main>` `id="main" tabindex="-1"`.
- Font sizes in `rem` (never `px`) so the reader's text-size setting applies. Containers use
  `min-height`, not fixed heights, so larger text never gets clipped.
- Homepage tiles are labelled by their title (`aria-labelledby`) and described by their body
  (`aria-describedby`); keep those ids unique.
- Focus rings must reach 3:1 against what's behind them: inside color fields use `--on-surface`.
- Interactive targets are at least 24×24px (44px on touch for the theme toggle).
- Decorative SVGs get `aria-hidden="true"`; meaningful ones get `role="img"` and `aria-label`.
- Support Windows High Contrast via the `forced-colors` block in global.css: anything that
  relies on a background color to show its shape needs a border there.

## Conventions

- Content changes go in Markdown or `src/data/*`, never hard-coded into pages.
- The Now page's Reading list comes from the `reading` collection, loaded at build time from the
  public Goodreads shelf widget (`/review/custom_widget/<id>`, parsed in `src/loaders/goodreads.ts`;
  Goodreads retired shelf RSS feeds in October 2026). If the feed is empty or
  unreachable it falls back to the Now update's `reading` frontmatter; archived Now pages always
  show their own frontmatter. `make now` freezes the live Goodreads list into the outgoing update
  (and the new one) so the archive shows what `/now` displayed at the time. The widget parser is
  shared in `src/lib/goodreads.mjs`. The Deploy workflow also runs weekly (Mondays) so the list stays
  current; run it from the Actions tab for an immediate refresh.
- The Now page's Heavy rotation comes from the `listening` collection: the Apple Music API's
  heavy-rotation endpoint (top 5 albums/singles/EPs; playlists and stations skipped), fetched at build
  time by `src/loaders/apple-music.ts` using `src/lib/apple-music.mjs`, which signs a short-lived
  MusicKit developer token. Heavy rotation often returns library items (ids like `l.…`)
  with no public URL, so they're swapped for their catalog versions (`include=catalog`) for links
  and stable artwork; signed blobstore artwork expires within a day and is dropped in favor of a
  placeholder tile. Credentials come from env vars (`.env` locally via compose, GitHub
  secrets in CI; see `.env.example`); never commit them. Without them, or if the user token has
  expired (refresh with `make music-token`), it falls back to the Now update's `listening`
  frontmatter. `make now` freezes it into archived updates alongside the reading list.
- The Now page's Studying section has a Spanish subsection rendered from the `spanish` frontmatter (`hours`, optional
  `note`) on each Now update: level and progress come from Dreaming Spanish's thresholds in
  `src/lib/dreaming-spanish.ts` (0/50/150/300/600/1000/1500 h). There's no Dreaming Spanish API,
  so hours are entered by hand with `make spanish hours=N`, which edits the latest update.
- Now updates are dated files in `src/content/now/`. Never edit an older one to change the
  present: create a new file (`make now` copies the latest to today's date). The newest file is
  `/now`; older ones are listed at `/now/archive` and served at `/now/<date>`.
- `/resume.json` (JSON Resume v1.0.0, `src/pages/resume.json.ts`) is generated from
  `src/data/site.ts` and `src/data/resume.ts` and mirrors the resume page (no projects). Keep resume dates in
  the `Mon YYYY` / `YYYY` / `Fall YYYY` forms so they convert to ISO dates.
- Skill and tech chips render through `Chips.astro`; a chip links to docs when its exact label
  is in `src/data/tech-links.ts`. Add an entry there when introducing a new skill or tech.
  Don't use linked chips inside an element that's already a link (e.g. project cards).
- Keep pages static and JS-free unless a feature genuinely needs a script; prefer CSS.
- Check new UI in both themes.
- Icons live in `src/assets/icons/` and are imported with `?url` in Base.astro / site.webmanifest.ts
  so their URLs are content-hashed (cache busting). Only `/favicon.ico` stays in `public/` as
  the fallback browsers request by default; keep it in sync with the copy in src/assets/icons.
- Link-preview images (1200×630 JPEG) live in `src/assets/og/`: one for the homepage and one per
  section, chosen in Base.astro via the `section` prop. Same poster style as the site.
- Caching (firebase.json): pages (`/`, `*.html`, extensionless clean URLs) are `no-cache` so a
  deploy shows up immediately; hashed files under `/_astro/` are cached forever.
- External links open in a new tab automatically: `src/integrations/external-links.mjs` rewrites
  the built HTML (build/preview only, not the dev server), adding `target="_blank"`,
  `rel="noopener noreferrer"` and `aria-describedby="new-tab-note"` (the hidden note in
  Base.astro). Don't add `target` by hand; a link that already has one is left alone.
- URLs have no trailing slash (`trailingSlash: 'never'`, `build.format: 'file'`).
- Use Astro scoped `<style>` for page-specific CSS; use `:global()` to style child components.
