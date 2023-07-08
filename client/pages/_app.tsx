import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import React from "react";
import { ColorMode } from "../context/ColorMode";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { JetBrains_Mono, Lora, Open_Sans } from "next/font/google";
import "../styles/globals.css";

const jetBrains = JetBrains_Mono({ subsets: ["latin"] });
const lora = Lora({ subsets: ["latin"] });
const openSans = Open_Sans({ subsets: ["latin"] });

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  const [isLight, setIsLight] = useState<boolean>(true);

  useEffect(() => {
    const session = globalThis.sessionStorage.getItem("leafTheme");
    if (!session || session === "light") {
      setIsLight(() => true);
    } else {
      setIsLight(() => false);
    }
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          --jetbrains-font: ${jetBrains.style.fontFamily};
          --lora-font: ${lora.style.fontFamily};
          --opensans-font: ${openSans.style.fontFamily};
        }
      `}</style>
      <ColorMode.Provider value={{ isLight, setIsLight }}>
          <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
          </SessionProvider>
      </ColorMode.Provider>
    </>
  );
}

export default MyApp;
