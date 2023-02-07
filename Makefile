build:
	sudo docker-compose build

run:
	sudo docker-compose up

down:
	sudo docker-compose down --remove-orphans

remove:
	docker rmi $(docker images -q) -f
