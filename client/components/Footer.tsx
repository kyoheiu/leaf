import Image from "next/image";
import { LOGO_SIZE } from "./Header";
import { useContext } from "react";
import { ColorMode } from "../context/ColorMode";

export const footerImage = () => {
  const { isLight } = useContext(ColorMode);
  return (
    <Image
      src="/logo_dark.png"
      alt="leaf"
      height={LOGO_SIZE}
      width={LOGO_SIZE}
    />
  );
};
