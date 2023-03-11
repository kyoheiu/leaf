import {
	ArticleData,
	Articles,
	ElementKind,
	WrappedData,
} from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import { Footer, footerImage } from "../../components/Footer";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Login from "../../components/Login";
import Stack from "@mui/material/Stack";
import { getArchivedArticles } from "../api/articles/archived";
import Button from "@mui/material/Button";

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
	const { data: session, status } = useSession();

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

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	if (!data) {
		return <h1>No article found.</h1>;
	}

	const wrapped: WrappedData[] = list.map((x) => ({
		visible: true,
		data: x,
	}))!;

	return session ? (
		<>
			<Header />
			<Stack className="articles-list" spacing={5}>
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
	) : (
		<Login />
	);
}
