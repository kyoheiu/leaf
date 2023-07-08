import toast from "react-simple-toasts";
import { RiLink } from "react-icons/ri";

type urlProp = {
  url: string;
};

const copyToClipboard = async (url: string) => {
  await navigator.clipboard.writeText(url);
  toast("URL copied to clipboard.");
};

export default function Login(data: urlProp) {
  return (
    <>
      <button onClick={() => copyToClipboard(data.url)} title="copy URL">
        <RiLink />
      </button>
    </>
  );
}
