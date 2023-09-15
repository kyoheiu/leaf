import toast from 'svelte-french-toast';

export const toastSuccess = (message: string) => {
	toast.success(message, {
		position: 'bottom-center',
		iconTheme: {
			primary: '#0ea5e9', // sky-500
			secondary: '#fff'
		}
	});
};

export const toastError = (message: string) => {
	toast.error(message, {
		position: 'bottom-center'
	});
};
