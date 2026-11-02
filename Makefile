.PHONY: dev build preview now deploy-setup

dev: ; docker compose up dev

build: ; docker compose run --rm builder

preview: ; docker compose run --rm --service-ports preview

now: ; docker compose run --rm --no-deps dev npm run now

deploy-setup:
	docker compose run --rm firebase login --no-localhost
	docker compose run --rm firebase init hosting:github
