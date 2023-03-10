import Divider from "@mui/material/Divider";
import Image from "next/image";

interface FooterProps {
  isLast: boolean;
}

export default function Footer({ isLast }: FooterProps) {
  const logo_size = 28;

  return (
    <>
      <footer>
        {isLast ? (
          <Image
            src="/logo.png"
            alt="hmstr"
            height={logo_size}
            width={logo_size}
          />
        ) : (
          <>
            <div id="reload">&nbsp;</div>
          </>
        )}
      </footer>
    </>
  );
}
