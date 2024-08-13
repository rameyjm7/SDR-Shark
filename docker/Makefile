NAME = sdr_plot

.PHONY: build run stop interactive

build:
	@cd ../; zip -r code.zip frontend/ backend/; mv code.zip docker/
	docker build -t ${NAME} .

start:
	docker run -d -p 5000:5000 -p 3000:3000 --name ${NAME}_container ${NAME}

stop:
	docker stop ${NAME}_container || true
	docker rm ${NAME}_container || true

rebuild:
	make stop
	make build
	make start

interactive:
	docker run -it -p 5000:5000 -p 3000:3000 --name ${NAME}_container ${NAME} /bin/bash

super-clean:
	docker system prune -a
