all: up

up:
	@test -f .env || (echo "Error: .env file not found. Please create a .env file with the necessary environment variables." && exit 1)
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

fclean:
	docker compose down -v --rmi local

re: fclean up

.PHONY: all up down logs fclean re
