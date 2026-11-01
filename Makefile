.PHONY: dev build preview deploy-setup

dev: ; docker compose up dev

build: ; docker compose run --rm builder

preview: ; docker compose run --rm --service-ports preview

deploy-setup:
	docker compose run --rm firebase login --no-localhost
	docker compose run --rm firebase init hosting:github
