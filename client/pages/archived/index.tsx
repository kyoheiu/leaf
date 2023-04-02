import {
	Articles,
	ElementKind,
	WrappedData,
	PaginationKind
} from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Stack from "@mui/material/Stack";
import { getArchivedArticles, reloadArchivedArticles } from "../api/articles/archived";
import { PageInfo } from "../../components/PageInfo";
import { useRouter } from "next/router";
import { Pagination } from "../../components/Pagination";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	if (context.query.page) {
		const data = await reloadArchivedArticles(context.query.page as string)
		return { props: { data } };
	} else {
		const data = await getArchivedArticles();
		return { props: { data } };
	}
};

export default function Archived({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const page = router.query.page;

	const list = data.data;
	const isLast = data.is_last;

	const wrapped: WrappedData[] = list.map((x) => ({
		visible: true,
		data: x,
	}));

	return (
		<>
			<Header />
			<Stack className="articles-list" spacing={6}>
				{PageInfo("/archived")}
				{wrapped.map((e, index) => {
					return (
						<ArticleElement
							key={`archived-element${index}`}
							element={e}
							kind={ElementKind.Archived}
						/>
					);
				})}
				{Pagination(page, isLast, PaginationKind.Archived)}
			</Stack>
		</>
	);
}
