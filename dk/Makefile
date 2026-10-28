# Run from the dk/ folder:  cd dk && make
# (or from the project root:  make -C dk)

COMPOSE = docker compose

all: up

env:
	@test -f .env || (cp .env.example .env && echo "Created dk/.env from dk/.env.example")

up: env
	$(COMPOSE) up --build -d
	@echo ""
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"
	@echo "Logs:     make logs"

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f backend frontend

ps:
	$(COMPOSE) ps

# reinstall packages (after someone changes package.json)
reinstall:
	$(COMPOSE) down
	docker volume rm -f ft_transcendence_backend_node_modules ft_transcendence_frontend_node_modules
	$(COMPOSE) up --build -d

# wipe everything, including the database
fclean:
	$(COMPOSE) down -v --rmi local

re: fclean up

.PHONY: all env up down logs ps reinstall fclean re
