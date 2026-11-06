all: up

up:
	@test -f .env || cp .env.example .env
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

fclean:
	docker compose down -v --rmi local

re: fclean up

.PHONY: all up down logs fclean re
