fmt:
	npm run format && npm run lint

dev:
	cd server && sudo chown -R ${USER}:${GROUP} databases
	npm run dev & cd server && RUST_LOG=info cargo run -r && fg

stop:
	killall node && killall leaf-server

build:
	cd client && npm install --package-lock-only 
	cd server && cargo generate-lockfile
	sudo docker build --tag=kyoheiudev/leaf-server:$(VER) server 
	sudo docker build --tag=kyoheiudev/leaf-client:$(VER) client 

push:
	sudo docker push kyoheiudev/leaf-server:$(VER)
	sudo docker push kyoheiudev/leaf-client:$(VER)

run:
	sudo docker compose up -d

down:
	sudo docker compose down --remove-orphans
