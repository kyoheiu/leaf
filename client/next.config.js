/** @type {import('next').NextConfig} */

module.exports = {
	reactStrictMode: true,
	experimental: {
		scrollRestoration: true,
	},
	compiler: {
		removeConsole: {
			exclude: ["error"],
		},
	},
};
