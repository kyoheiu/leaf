dev:
	cd client && sudo rm -rf .next
	cd server && sudo chown -R ${USER}:${GROUP} databases
	cd client && npm run dev & cd server && RUST_LOG=info cargo run -r && fg

test:
	hurl --test test.hurl

stop:
	killall node && killall leaf-server

build:
	sudo docker build --tag=kyoheiudev/leaf-server:$(VER) server 
	sudo docker build --tag=kyoheiudev/leaf-client:$(VER) client 

push:
	sudo docker push kyoheiudev/leaf-server:$(VER)
	sudo docker push kyoheiudev/leaf-client:$(VER)

run:
	sudo docker compose up -d

down:
	sudo docker compose down --remove-orphans

remove:
	sudo docker compose down --remove-orphans
	sudo docker rm $(sudo docker ps -a -q) -f
	sudo docker rmi $(sudo docker images -a -q) -f
