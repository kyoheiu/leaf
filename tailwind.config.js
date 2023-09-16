/** @type {import('tailwindcss').Config} */

/* eslint @typescript-eslint/no-var-requires: "off" */
const colors = require('tailwindcss/colors');

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte-icons/**/*.{html,js,svelte,ts}'
	],
	theme: {
		colors: {
			slate: colors.slate,
			sky: colors.sky,
			bordercolor: '#94a3b8', // slate-400
			heart: '#ef4444' // red-500
		},
		extend: {
			typography: {
				DEFAULT: {
					css: {
						'code::before': {
							content: '""'
						},
						'code::after': {
							content: '""'
						},
						code: {
							fontWeight: 400
						}
					}
				}
			},
			spacing: {
				144: '36rem'
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
