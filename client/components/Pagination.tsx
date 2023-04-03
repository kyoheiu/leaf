import { footerImage } from "../components/Footer";
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import { Typography } from "@mui/material";
import Link from "next/link";
import { PaginationKind } from "../types/types";

const secondPage = (kind: PaginationKind, tag_name?: string | undefined): string => {
    switch (kind) {
        case PaginationKind.Top: {
            return "/?page=2"
        }
        case PaginationKind.Archived: {
            return "/archived?page=2"
        }
        case PaginationKind.Liked: {
            return "/liked?page=2"
        }
        case PaginationKind.Tags: {
            return "/tags/" + tag_name + "?page=2"
        }
    }
}

const pageDown = (page: string, kind: PaginationKind, tag_name?: string | undefined): string => {
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
}

const pageUp = (page: string, kind: PaginationKind, tag_name?: string | undefined): string => {
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
}

export const Pagination = (page: string | string[] | undefined, isLast: boolean, kind: PaginationKind, tag_name?: string | undefined) => {
    if (!page && isLast) {
        return <>
            <Typography className="pagination">
                {(!page && isLast) &&
                    footerImage()
                }
            </Typography>
        </>;
    } else if (!page && !isLast || page === "1") {
        return <>
            <Typography className="pagination">
                <a href={secondPage(kind, tag_name)}>
                    <KeyboardArrowRightIcon fontSize="large" />
                </a>
            </Typography>
        </>;
    } else if (page && !isLast) {
        return <>
            <Typography className="pagination">
                <a href={pageDown(page as string, kind, tag_name)}>
                    <KeyboardArrowLeftIcon fontSize="large" />
                </a>
                <Link href={pageUp(page as string, kind, tag_name)}>
                    <KeyboardArrowRightIcon fontSize="large" />
                </Link>
            </Typography>
        </>;
    } else {
        return <>
            <Typography className="pagination">
                <a href={pageDown(page as string, kind, tag_name)}>
                    <KeyboardArrowLeftIcon fontSize="large" />
                </a>
            </Typography>
        </>
    }
}