all: up

up:
	@test -f .env || cp .env.example .env
	@python3 -c "import pathlib,base64,secrets; p=pathlib.Path('.env'); s=p.read_text(); p.write_text(s+'\nAI_SESSION_ENCRYPTION_KEY='+base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()+'\n') if not any(x.startswith('AI_SESSION_ENCRYPTION_KEY=') and x.split('=',1)[1].strip() for x in s.splitlines()) else None"
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

fclean:
	docker compose down -v --rmi local

re: fclean up

.PHONY: all up down logs fclean re
