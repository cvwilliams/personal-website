.PHONY: dev build preview login github-setup deploy shell clean

dev: ; docker compose up dev

build: ; docker compose run --rm builder

preview: ; docker compose run --rm --service-ports preview

login: ; docker compose run --rm firebase login --no-localhost

github-setup: ; docker compose run --rm firebase init hosting:github

deploy: build ; docker compose run --rm firebase deploy --only hosting

shell: ; docker compose run --rm dev bash

clean: ; docker compose down -v --remove-orphans && rm -rf dist .astro
