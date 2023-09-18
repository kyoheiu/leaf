import toast from 'svelte-french-toast';

const style = `
	color: #f8fafc;
	background: #334155;
	box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
	border-radius: 0.25rem;
`;

export const toastSuccess = (message: string) => {
	toast.success(message, {
		position: 'bottom-center',
		iconTheme: {
			primary: '#0ea5e9', // sky-500
			secondary: '#fff'
		},
		style: style
	});
};

export const toastError = (message: string) => {
	toast.error(message, {
		position: 'bottom-center',
		style: style
	});
};
