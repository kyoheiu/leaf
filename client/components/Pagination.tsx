import { FooterImage } from "@/components/Footer";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { PaginationKind } from "../types/types";
import { ReactNode } from "react";

const secondPage = (
  kind: PaginationKind,
  tag_name?: string | undefined
): string => {
  switch (kind) {
    case PaginationKind.Top: {
      return "/?page=2";
    }
    case PaginationKind.Archived: {
      return "/archived?page=2";
    }
    case PaginationKind.Liked: {
      return "/liked?page=2";
    }
    case PaginationKind.Tags: {
      return "/tags/" + tag_name + "?page=2";
    }
  }
};

const pageDown = (
  page: string,
  kind: PaginationKind,
  tag_name?: string | undefined
): string => {
  switch (kind) {
    case PaginationKind.Top: {
      return "/?page=" + (parseInt(page) - 1);
    }
    case PaginationKind.Archived: {
      return "/archived?page=" + (parseInt(page) - 1);
    }
    case PaginationKind.Liked: {
      return "/liked?page=" + (parseInt(page) - 1);
    }
    case PaginationKind.Tags: {
      return "/tags/" + tag_name + "?page=" + (parseInt(page) - 1);
    }
  }
};

const pageUp = (
  page: string,
  kind: PaginationKind,
  tag_name?: string | undefined
): string => {
  switch (kind) {
    case PaginationKind.Top: {
      return "/?page=" + (parseInt(page) + 1);
    }
    case PaginationKind.Archived: {
      return "/archived?page=" + (parseInt(page) + 1);
    }
    case PaginationKind.Liked: {
      return "/liked?page=" + (parseInt(page) + 1);
    }
    case PaginationKind.Tags: {
      return "/tags/" + tag_name + "?page=" + (parseInt(page) + 1);
    }
  }
};

const Paginate = ({ children }: { children: ReactNode }) => {
  return <div className="flex justify-center mb-6">{children}</div>;
};

export const Pagination = (
  page: string | string[] | undefined,
  isLast: boolean,
  kind: PaginationKind,
  tag_name?: string | undefined
) => {
  if (!page && isLast) {
    return <Paginate children={FooterImage()} />;
  } else if ((!page && !isLast) || page === "1") {
    return (
      <Paginate
        children={
          <a href={secondPage(kind, tag_name)}>
            <SlArrowRight />
          </a>
        }
      />
    );
  } else if (page && !isLast) {
    return (
      <Paginate
        children={
          <>
            <a href={pageDown(page as string, kind, tag_name)}>
              <SlArrowLeft />
            </a>
            &nbsp; &nbsp; &nbsp;
            <a href={pageUp(page as string, kind, tag_name)}>
              <SlArrowRight />
            </a>
          </>
        }
      />
    );
  } else {
    return (
      <Paginate
        children={
          <a href={pageDown(page as string, kind, tag_name)}>
            <SlArrowLeft />
          </a>
        }
      />
    );
  }
};
