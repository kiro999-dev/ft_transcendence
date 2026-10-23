IMAGE_NAME=ai-service
CONTAINER_NAME=ai-service
PORT=8000
BACKEND_URL?=http://host.docker.internal:3000

build:
	docker build -t $(IMAGE_NAME) .

run:
	docker run --rm \
		--name $(CONTAINER_NAME) \
		--env-file ../.env \
		--add-host=host.docker.internal:host-gateway \
		-e BACKEND_URL=$(BACKEND_URL) \
		-p $(PORT):8000 \
		$(IMAGE_NAME)

stop:
	docker stop $(CONTAINER_NAME) || true

restart: stop build run

rebuild: build

logs:
	docker logs -f $(CONTAINER_NAME)

clean:
	docker rm -f $(CONTAINER_NAME) || true
	docker rmi $(IMAGE_NAME) || true

fclean: clean
	docker builder prune -f

re: fclean build run
