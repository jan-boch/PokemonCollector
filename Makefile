.PHONY: help run build start lint test db-start db-stop db-mail db-login db-up db-push db-reset db-studio

SUPABASE_PROJECT_REF=gdooocbtquidgvyymash

help:
	@echo Available commands:
	@echo   run          - Start the development server
	@echo   build        - Build for production
	@echo   start        - Start the production server
	@echo   lint         - Run ESLint
	@echo   test         - Run all tests
	@echo   db-start     - Start local Supabase instance
	@echo   db-stop      - Stop local Supabase instance
	@echo   db-mail      - Open local email inbox (Mailpit)
	@echo   db-login     - Log in to Supabase CLI
	@echo   db-up        - Apply pending migrations to local DB (keeps existing data)
	@echo   db-push      - Apply pending migrations to remote DB only
	@echo   db-reset     - Wipe and recreate local DB from scratch (destroys local data)
	@echo   db-studio    - Open local Supabase Studio (table editor, SQL runner)

test:
	npm test

run:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

db-start:
	npx supabase start

db-stop:
	npx supabase stop

db-mail:
	powershell.exe -c "Start-Process 'http://127.0.0.1:54324'"

db-login:
	npx supabase login

db-up:
	npx supabase migration up

db-push:
	npx supabase link --project-ref $(SUPABASE_PROJECT_REF)
	npx supabase db push

db-reset:
	npx supabase db reset

db-studio:
	powershell.exe -c "Start-Process 'http://127.0.0.1:54323'"
