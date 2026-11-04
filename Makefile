.PHONY: dev build preview now spanish music-token deploy-setup

dev: ; docker compose up dev

build: ; docker compose run --rm builder

preview: ; docker compose run --rm --service-ports preview

now: ; docker compose run --rm --no-deps dev npm run now

spanish: ; docker compose run --rm --no-deps dev node scripts/spanish-hours.mjs $(hours)

music-token: ; docker compose run --rm --no-deps -p 127.0.0.1:4323:4323 dev node scripts/apple-music-token.mjs

deploy-setup:
	docker compose run --rm firebase login --no-localhost
	docker compose run --rm firebase init hosting:github
