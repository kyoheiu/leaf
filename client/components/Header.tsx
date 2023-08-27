import { useState } from "react";
import { RiSearch2Line, RiMenuFill } from "react-icons/ri";
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
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClickSearchToggle = () => {
    setSearchOpen((b) => !b);
  };

  const execSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length === 0) {
      return;
    } else {
      const q = query.split(/(\s+)/).filter((x) => x.trim().length > 0)[0];
      setSearchOpen((b) => !b);
      router.push(`/search?q=${q}`);
    }
  };

  const [url, setUrl] = useState<string>("");
  const [query, setQuery] = useState<string>("");

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
          onClick={handleClickSearchToggle}
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
      <div className="mt-3 flex flex-nowrap items-center justify-between">
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
        <div className="relative">
          <button onClick={() => setShowMenu((s) => !s)} className="ml-3">
            <RiMenuFill />
          </button>
          {showMenu && (
            <div className=" absolute right-0 top-8 flex w-32 flex-col items-end space-y-3 rounded border bg-slate-50 p-2 text-sm drop-shadow-2xl">
              <a className="no-underline" href="/api/download">
                Download JSON
              </a>
              <a
                className="no-underline"
                href="https://github.com/kyoheiu/leaf"
                target="_blank"
              >
                Source code
              </a>
            </div>
          )}
        </div>
      </div>
      {searchOpen && (
        <form onSubmit={(e) => execSearch(e)} className="mt-3 flex justify-end">
          <input
            id="search"
            type="text"
            value={query}
            placeholder="search"
            className="mb-2 w-3/5 rounded-md border border-slate-500 p-1 text-sm text-gray-900"
            autoFocus
            onChange={(e) => setQuery(() => e.target.value)}
          />
        </form>
      )}
    </>
  );
};
