import {
	PaginationKind,
	WrappedData,
	ElementKind,
	Articles,
} from "../../types/types";
import { Header } from "@/components/Header";
import ArticleElement from "@/components/ArticleElement";
import { PageInfo } from "@/components/PageInfo";
import { Pagination } from "@/components/Pagination";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { getTagList, reloadTagList } from "../api/tags/[tag_name]";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/router";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	if (context.params) {
		if (context.query.page) {
			const data = await reloadTagList(context.params.tag_name as string, context.query.page as string);
			return { props: { data } };
		}
		const data = await getTagList(context.params.tag_name as string);
		return { props: { data } };
	} else {
		return { props: { data: null } };
	}
};

export default function Tagged({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const page = router.query.page;
	const { tag_name } = router.query;

	const list = data.data;
	const isLast = data.is_last;

	const wrapped: WrappedData[] =
		list.map((x) => ({
			visible: true,
			data: x,
		}))
		;

	return (
		<>
			<Header />
			<Stack className="articles-list" spacing={6}>
				{PageInfo(`TAG: ${tag_name}`)}
				{wrapped.map((e, index) => {
					return (
						<ArticleElement
							key={`tagged-element${index}`}
							element={e}
							kind={ElementKind.Searched}
						/>
					);
				})}
				{Pagination(page, isLast, PaginationKind.Tags, tag_name as string)}
			</Stack>
		</>
	);
}
