SHELL := /bin/bash

ENV_DIR := environment
ENV_FILE := .env

.PHONY: help env env-local env-dev env-sit env-uat env-prod env-show dev build start lint dev-mock dev-api build-mock build-api start-mock start-api

help:
	@echo "Available commands:"
	@echo "  make env-local   - Use environment/.env.local"
	@echo "  make env-dev     - Use environment/.env.dev"
	@echo "  make env-sit     - Use environment/.env.sit"
	@echo "  make env-uat     - Use environment/.env.uat"
	@echo "  make env-prod    - Use environment/.env.prod"
	@echo "  make env ENV=dev - Generic switch (local|dev|sit|uat|prod)"
	@echo "  make env-show    - Show active .env summary"
	@echo "  make dev         - Run next dev"
	@echo "  make dev-mock    - Run next dev in mock mode (APP_DATA_MODE=mock)"
	@echo "  make dev-api     - Run next dev in api mode (APP_DATA_MODE=api)"
	@echo "  make build       - Run next build"
	@echo "  make build-mock  - Run next build in mock mode (APP_DATA_MODE=mock)"
	@echo "  make build-api   - Run next build in api mode (APP_DATA_MODE=api)"
	@echo "  make start       - Run next start"
	@echo "  make start-mock  - Run next start in mock mode (APP_DATA_MODE=mock)"
	@echo "  make start-api   - Run next start in api mode (APP_DATA_MODE=api)"
	@echo "  make lint        - Run eslint"

env:
	@if [ -z "$(ENV)" ]; then \
		echo "ENV is required. Example: make env ENV=dev"; \
		exit 1; \
	fi
	@if [ ! -f "$(ENV_DIR)/.env.$(ENV)" ]; then \
		echo "Environment file not found: $(ENV_DIR)/.env.$(ENV)"; \
		exit 1; \
	fi
	@cp "$(ENV_DIR)/.env.$(ENV)" "$(ENV_FILE)"
	@echo "Switched to $(ENV_DIR)/.env.$(ENV) -> $(ENV_FILE)"

env-local:
	@cp "$(ENV_DIR)/.env.local" "$(ENV_FILE)"
	@echo "Switched to $(ENV_DIR)/.env.local -> $(ENV_FILE)"

env-dev:
	@cp "$(ENV_DIR)/.env.dev" "$(ENV_FILE)"
	@echo "Switched to $(ENV_DIR)/.env.dev -> $(ENV_FILE)"

env-sit:
	@cp "$(ENV_DIR)/.env.sit" "$(ENV_FILE)"
	@echo "Switched to $(ENV_DIR)/.env.sit -> $(ENV_FILE)"

env-uat:
	@cp "$(ENV_DIR)/.env.uat" "$(ENV_FILE)"
	@echo "Switched to $(ENV_DIR)/.env.uat -> $(ENV_FILE)"

env-prod:
	@cp "$(ENV_DIR)/.env.prod" "$(ENV_FILE)"
	@echo "Switched to $(ENV_DIR)/.env.prod -> $(ENV_FILE)"

env-show:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo ".env not found. Run: make env-local (or env-dev/env-sit/env-uat/env-prod)"; \
		exit 1; \
	fi
	@echo "Active .env:"
	@grep -E "^(APP_DATA_MODE|AUTH_API_BASE_URL|NEXT_PUBLIC_API_BASE_URL|NODE_ENV|PORT)=" "$(ENV_FILE)" || true

dev:
	@npm run dev

build:
	@npm run build

start:
	@npm run start

lint:
	@npm run lint

dev-mock:
	@APP_DATA_MODE=mock npm run dev

dev-api:
	@APP_DATA_MODE=api npm run dev

build-mock:
	@APP_DATA_MODE=mock npm run build

build-api:
	@APP_DATA_MODE=api npm run build

start-mock:
	@APP_DATA_MODE=mock npm run start

start-api:
	@APP_DATA_MODE=api npm run start
