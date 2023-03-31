import Image from "next/image";
import SyncIcon from "@mui/icons-material/Sync";
import Button from "@mui/material/Button";
import { LOGO_SIZE } from "./Header";

export const footerImage = () => {
	return (
		<Image src="/icon.png" alt="leaf" height={LOGO_SIZE} width={LOGO_SIZE} />
	);
};

const syncButton = (reload: () => Promise<void>) => {
	return (
		<Button variant="outlined" fullWidth={true} onClick={reload}>
			<SyncIcon />
		</Button>
	);
};

export const Footer = (isLast: boolean, reload: () => Promise<void>) => {
	return <footer>{isLast ? footerImage() : syncButton(reload)}</footer>;
};
