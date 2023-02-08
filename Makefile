init:
	cd server && cargo run -- init

dev:
	cd client && yarn run dev & cd server && cargo run -r && fg

stop:
	killall node && killall acidpaper

build:
	sudo docker-compose build

run:
	sudo docker-compose up

down:
	sudo docker-compose down --remove-orphans

remove:
	docker rmi $(docker images -q) -f
