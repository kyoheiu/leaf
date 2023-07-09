import ArticleElement from "./ArticleElement";
import { Category, ElementKind, WrappedData } from "../types/types";
import { footerImage } from "@/components/Footer";
import Link from "next/link";

export const Main = (
  c: Category,
  wrapped: WrappedData[],
  children?: JSX.Element,
  tagName?: string,
  query?: string | string[]
) => {
  switch (c) {
    case Category.All:
      return (
        <>
          <div className="flex justify-center">
            <div className="border-b px-2">All</div>
            <Link className="px-2" href="/liked">
              Liked
            </Link>
            <Link className="px-2" href="/archived">
              Archived
            </Link>
          </div>
          <div className="mt-3">
            {wrapped.map((e, index) => {
              return (
                <ArticleElement
                  key={`index-element${index}`}
                  element={e}
                  kind={ElementKind.Top}
                />
              );
            })}
            {children}
          </div>
        </>
      );
    case Category.Liked:
      return (
        <>
          <div className="flex justify-center">
            <Link className="px-2" href="/">
              All
            </Link>
            <div className="border-b px-2">Liked</div>
            <Link className="px-2" href="/archived">
              Archived
            </Link>
          </div>
          <div className="mt-3">
            {wrapped.map((e, index) => {
              return (
                <ArticleElement
                  key={`liked-element${index}`}
                  element={e}
                  kind={ElementKind.Liked}
                />
              );
            })}
            {children}
          </div>
        </>
      );
    case Category.Archived:
      return (
        <>
          <div className="flex justify-center">
            <Link className="px-2" href="/">
              All
            </Link>
            <Link className="px-2" href="/liked">
              liked
            </Link>
            <div className="border-b px-2">Archived</div>
          </div>
          <div className="mt-3">
            {wrapped.map((e, index) => {
              return (
                <ArticleElement
                  key={`archived-element${index}`}
                  element={e}
                  kind={ElementKind.Archived}
                />
              );
            })}
            {children}
          </div>
        </>
      );
    case Category.Tagged:
      return (
        <>
          <div className="flex justify-center">
            <Link className="px-2" href="/">
              All
            </Link>
            <Link className="px-2" href="/liked">Liked</Link>
            <Link className="px-2" href="/archived">
              Archived
            </Link>
            <div className="border-b px-2">Tag: {tagName}</div>
          </div>
          <div className="mt-3">
            {wrapped.map((e, index) => {
              return (
                <ArticleElement
                  key={`tagged-element${index}`}
                  element={e}
                  kind={ElementKind.Searched}
                />
              );
            })}
            {children}
          </div>
        </>
      );
    case Category.Searched:
      return (
        <>
          <div className="flex justify-center">
            <Link className="px-2" href="/">
              All
            </Link>
            <Link className="px-2" href="/liked">Liked</Link>
            <Link className="px-2" href="/archived">
              Archived
            </Link>
            <div className="border-b px-2">Query: {query}</div>
          </div>
          <div className="mt-3">
            {wrapped.map((e, index) => {
              return (
                <ArticleElement
                  key={`searched-element${{ index }}`}
                  element={e}
                  kind={ElementKind.Searched}
                />
              );
            })}
            <footer>{footerImage()}</footer>
          </div>
        </>
      );
  }
};
