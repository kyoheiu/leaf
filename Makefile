fmt:
	npm run format && npm run lint

build:
	npm install --package-lock-only
	podman build --tag=kyoheiudev/leaf:$(VER) .

push:
	podman push kyoheiudev/leaf:$(VER)
