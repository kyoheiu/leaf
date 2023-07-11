import { useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import Image from "next/image";
import { useRouter } from "next/router";
import Head from "next/head";
import toast from "react-simple-toasts";
import Link from "next/link";

// h-10
export const LOGO_SIZE = 40;
// h-8
export const MINI_LOGO_SIZE = 32;

export const Header = () => {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);

  const handleClickSearchOpen = () => {
    setSearchOpen((b) => !b);
  };

  const execSearch = async () => {
    const queries = (document.getElementById("search") as HTMLInputElement)
      .value;
    const split = queries
      .split(/(\s+)/)
      .filter((x) => x.trim().length > 0)
      .join("+");
    router.push(`/search?q=${split}`);
  };

  const [url, setUrl] = useState<string>("");

  const createNew = async (e: React.FormEvent) => {
    e.preventDefault();
    console.debug(url);
    const res = await fetch("/api/articles", {
      method: "POST",
      body: url,
    });
    if (!res.ok) {
      toast(res.statusText);
    } else {
      router.reload();
    }
  };

  const BarSearch = () => {
    return (
      <>
        <button
          className="ml-auto"
          onClick={handleClickSearchOpen}
          title="search"
        >
          <RiSearch2Line />
        </button>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_TITLE}</title>
      </Head>
      <div className="flex flex-nowrap items-center justify-between">
        <Link className="pr-1" href="/">
          <Image
            src="/logo_dark.png"
            alt="leaf"
            height={LOGO_SIZE}
            width={LOGO_SIZE}
          />
        </Link>
        <form onSubmit={createNew}>
          &nbsp;
          <div>
            <input
              className="flex-auto text-sm text-gray-900 rounded-md p-1 w-5/6 mb-5"
              id={"add_new"}
              type="url"
              value={url}
              onChange={(e) => setUrl(() => e.target.value)}
              placeholder="+"
            />
          </div>
        </form>
        <BarSearch />
      </div>
      {searchOpen && (
        <form onSubmit={execSearch} className="flex justify-end">
          <input
            id="search"
            type="text"
            placeholder="search"
            className="text-sm text-gray-900 rounded-md p-1 w-3/5 mb-2"
            autoFocus
          />
        </form>
      )}
    </>
  );
};
