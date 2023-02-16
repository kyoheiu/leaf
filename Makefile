init:
	cd server && cargo run -- init

dev:
	cd client && sudo rm -rf .next
	cd server && sudo chown -R ${USER}:${GROUP} databases
	cd client && yarn run dev & cd server && RUST_LOG=info cargo run -r && fg

stop:
	killall node && killall acidpaper

build:
	sudo docker-compose build

run:
	sudo docker-compose up

down:
	sudo docker-compose down --remove-orphans

remove:
	sudo docker rmi $(sudo docker images -q) -f
