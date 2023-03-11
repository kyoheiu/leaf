import { WrappedData, ElementKind, ArticleData } from "../../types/types";
import { Header } from "../../components/Header";
import ArticleElement from "../../components/ArticleElement";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { searchArticles } from "../api/search";
import Stack from "@mui/material/Stack";
import { footerImage } from "../../components/Footer";

type Data = ArticleData[];

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	const data = await searchArticles(context.query.q!);
	return { props: { data } };
};

export default function Searched({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const wrapped: WrappedData[] = data!.map((x) => ({
		visible: true,
		data: x,
	}))!;

	return (
		<>
			<Header />
			<Stack className="articles-list" spacing={5}>
				<div className="count">RESULTS: {data.length}</div>
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
			</Stack>
		</>
	);
}
