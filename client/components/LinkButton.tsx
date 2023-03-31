import Button from "@mui/material/Button";
import toast from "react-simple-toasts";
import LinkIcon from '@mui/icons-material/Link';

type urlProp = {
    url: string
}

const copyToClipboard = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast("URL copied to clipboard.");
}

export default function Login(data: urlProp) {
    return (
        <>
            <Button onClick={() => copyToClipboard(data.url)}>
                <LinkIcon sx={{ fontSize: 20 }} />
            </Button>
        </>);
}