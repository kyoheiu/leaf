import { useState } from "react";
import { RiSearch2Line, RiCodeSSlashFill } from "react-icons/ri";
import { ImSpinner } from "react-icons/im";
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
  const [loading, setLoading] = useState(false);

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

  const createNew = async (e: React.FormEvent): Promise<void | string> => {
    setLoading(() => true);
    setUrl(() => "");
    e.preventDefault();
    const res = await fetch("/api/articles", {
      method: "POST",
      body: url,
    });
    if (!res.ok) {
      const message = await res.text();
      toast(`Error: ${message}`);
      setLoading((b) => !b);
    } else {
      router.reload();
    }
  };

  const SearchButton = () => {
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
        <title>leaf</title>
      </Head>
      <div className="mb-6 mt-3 flex flex-nowrap items-center justify-between">
        <Link className="pr-1" href="/">
          <Image
            src="/logo.png"
            alt="leaf"
            height={MINI_LOGO_SIZE}
            width={MINI_LOGO_SIZE}
          />
        </Link>
        &nbsp;
        {loading ? (
          <div className="animate-spin text-sm">
            <ImSpinner />
          </div>
        ) : (
          <form onSubmit={createNew}>
            <input
              className="w-5/6 flex-auto rounded-md border border-slate-500 p-1 text-sm text-gray-900"
              id={"add_new"}
              type="url"
              value={url}
              onChange={(e) => setUrl(() => e.target.value)}
              placeholder="+"
            />
          </form>
        )}
        <SearchButton />
        <div className="ml-3">
          <a href="https://git.sr.ht/~kyoheiu/leaf" target="_blank">
            <RiCodeSSlashFill />
          </a>
        </div>
      </div>
      {searchOpen && (
        <form onSubmit={execSearch} className="flex justify-end">
          <input
            id="search"
            type="text"
            placeholder="search"
            className="mb-2 w-3/5 rounded-md border border-slate-500 p-1 text-sm text-gray-900"
            autoFocus
          />
        </form>
      )}
    </>
  );
};
