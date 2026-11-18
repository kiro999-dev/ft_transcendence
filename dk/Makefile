all: up

setup:
	python3 scripts/setup_env.py
	docker volume create ai_service_data >/dev/null

up: setup
	docker compose up --build -d

whatsapp-link:
	docker compose exec ai-service python -m scripts.link_whatsapp

status:
	docker compose ps

down:
	docker compose down

logs:
	docker compose logs -f

# Destructive: removes the database and the WhatsApp device session.
fclean:
	docker compose down -v --rmi local

re: fclean up

.PHONY: all setup up whatsapp-link status down logs fclean re
