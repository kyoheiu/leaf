dev:
	cd client && yarn run dev & cd server && cargo run -r && fg

kill:
	killall node; killall acidpaper
