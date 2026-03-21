.PHONY: help run build start lint db-start db-stop db-mail db-login db-migrate

SUPABASE_PROJECT_REF=gdooocbtquidgvyymash

help:
	@echo Available commands:
	@echo   run          - Start the development server
	@echo   build        - Build for production
	@echo   start        - Start the production server
	@echo   lint         - Run ESLint
	@echo   db-start     - Start local Supabase instance
	@echo   db-stop      - Stop local Supabase instance
	@echo   db-mail      - Open local email inbox (Mailpit)
	@echo   db-login     - Log in to Supabase CLI
	@echo   db-migrate   - Pull remote schema and apply to local DB

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

db-migrate:
	npx supabase link --project-ref $(SUPABASE_PROJECT_REF)
	npx supabase db pull
	npx supabase db reset
