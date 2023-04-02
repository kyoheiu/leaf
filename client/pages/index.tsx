import {
	Articles,
	ElementKind,
	WrappedData,
	PaginationKind
} from "../types/types";
import ArticleElement from "../components/ArticleElement";
import { Header } from "../components/Header";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Stack from "@mui/material/Stack";
import { getArticles, reloadArticles } from "./api/articles";
import { footerImage } from "../components/Footer";
import { useRouter } from "next/router";
import { Pagination } from "../components/Pagination";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	if (context.query.page) {
		const data = await reloadArticles(context.query.page as string)
		return { props: { data } };
	} else {
		const data = await getArticles();
		return { props: { data } };
	}
};

export default function Home({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const page = router.query.page;

	const list = data.data;
	const isLast = data.is_last;

	if (list.length === 0) {
		return (
			<>
				<Header />
				<Stack className="articles-list" spacing={6}>
					<div>Add new article from the top form!</div>
					{footerImage()}
				</Stack>
			</>
		);
	}

	const wrapped: WrappedData[] = list.map((x) => ({
		visible: true,
		data: x,
	}));

	return (
		<>
			<Header />
			<Stack className="articles-list" spacing={6}>
				{wrapped.map((e, index) => {
					return (
						<ArticleElement
							key={`index-element${index.toString()}`}
							element={e}
							kind={ElementKind.Top}
						/>
					);
				})}
				{Pagination(page, isLast, PaginationKind.Top)}
			</Stack>
		</>
	);
}
