import Divider from "@mui/material/Divider";

export const PageInfo = (message: string) => {
	return (
		<>
			<div className="page-info">{message}</div>
			<Divider />
		</>
	);
};
