# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV ASTRO_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

FROM deps AS dev
EXPOSE 4321
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]

FROM deps AS build
COPY . .
RUN npm run check && npm run build

FROM base AS firebase
RUN npm install -g firebase-tools
ENTRYPOINT ["firebase"]
