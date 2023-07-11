import type { AppProps } from "next/app";
import React from "react";
import { JetBrains_Mono, Lora, Open_Sans } from "next/font/google";
import "../styles/globals.css";

const jetBrains = JetBrains_Mono({ subsets: ["latin"] });
const lora = Lora({ subsets: ["latin"] });
const openSans = Open_Sans({ subsets: ["latin"] });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --jetbrains-font: ${jetBrains.style.fontFamily};
          --lora-font: ${lora.style.fontFamily};
          --opensans-font: ${openSans.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
