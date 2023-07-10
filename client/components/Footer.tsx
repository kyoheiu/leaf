import Image from "next/image";
import { LOGO_SIZE } from "./Header";

export const footerImage = () => {
  return (
    <Image
      src="/logo_dark.png"
      alt="leaf"
      height={LOGO_SIZE}
      width={LOGO_SIZE}
    />
  );
};
