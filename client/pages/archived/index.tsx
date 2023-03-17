import {
	ArticleData,
	Articles,
	ElementKind,
	WrappedData,
} from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import Stack from "@mui/material/Stack";
import { getArchivedArticles } from "../api/articles/archived";
import { PageInfo } from "../../components/PageInfo";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	const data = await getArchivedArticles();
	return { props: { data } };
};

export default function Archived({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const [list, setList] = useState<ArticleData[]>(data.data);
	const [isLast, setIsLast] = useState(data.is_last);

	const reload = async () => {
		if (list.length !== 0) {
			const res = await fetch(
				`/api/articles/archived?reload=${list.slice(-1)[0].id}`,
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
				{Footer(isLast, reload)}
			</Stack>
		</>
	);
}
