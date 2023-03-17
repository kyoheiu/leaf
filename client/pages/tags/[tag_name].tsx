import {
	WrappedData,
	ElementKind,
	ArticleData,
	Articles,
} from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { getTagList } from "../api/tags/[tag_name]";
import Stack from "@mui/material/Stack";
import { Footer } from "../../components/Footer";
import { useState } from "react";
import { useRouter } from "next/router";
import { PageInfo } from "../../components/PageInfo";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	if (context.params) {
		const data = await getTagList(context.params.tag_name as string);
		return { props: { data } };
	} else {
		return { props: { data: [] } };
	}
};

export default function Tagged({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const router = useRouter();
	const { tag_name } = router.query;
	const [list, setList] = useState<ArticleData[]>(data.data);
	const [isLast, setIsLast] = useState(data.is_last);

	const reload = async () => {
		if (list.length !== 0) {
			const res = await fetch(
				`/api/tags/${tag_name}?reload=${list.slice(-1)[0].id}`,
			);
			const j = await res.json();
			if (j.is_last) {
				setIsLast(true);
			}
			setList((arr) => arr.concat(j.data));
		}
	};

	const wrapped: WrappedData[] = list.map((x) => ({
		visible: true,
		data: x,
	}))!;

	return (
		<>
			<Header />
			<Stack className="articles-list" spacing={5}>
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
				{Footer(isLast, reload)}
			</Stack>
		</>
	);
}
