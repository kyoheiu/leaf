fmt:
	npm run format && npm run lint

build:
	cd client && npm install --package-lock-only 
	sudo docker build --tag=kyoheiudev/leaf:$(VER) .

push:
	sudo docker push kyoheiudev/leaf:$(VER)

run:
	sudo docker compose up -d
