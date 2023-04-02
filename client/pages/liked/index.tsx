import {
	PaginationKind,
	Articles,
	ElementKind,
	WrappedData,
} from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import Stack from "@mui/material/Stack";
import { getLikedArticles, reloadLikedArticles } from "../api/articles/liked";
import { PageInfo } from "../../components/PageInfo";
import { useRouter } from "next/router";
import { Pagination } from "../../components/Pagination";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	if (context.query.page) {
		const data = await reloadLikedArticles(context.query.page as string)
		return { props: { data } };
	} else {
		const data = await getLikedArticles();
		return { props: { data } };
	}
};

export default function Liked({
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
			<Stack className="articles-list" spacing={5}>
				{PageInfo("/liked")}
				{wrapped.map((e, index) => {
					return (
						<ArticleElement
							key={`liked-element${index}`}
							element={e}
							kind={ElementKind.Liked}
						/>
					);
				})}
				{Pagination(page, isLast, PaginationKind.Liked)}
			</Stack>
		</>
	);
}
