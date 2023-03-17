import {
	ArticleData,
	Articles,
	ElementKind,
	WrappedData,
} from "../../types/types";
import ArticleElement from "../../components/ArticleElement";
import { Header } from "../../components/Header";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import { useState } from "react";
import Login from "../../components/Login";
import { useSession } from "next-auth/react";
import Stack from "@mui/material/Stack";
import { getLikedArticles } from "../api/articles/liked";
import { Footer } from "../../components/Footer";

type Data = Articles;

export const getServerSideProps: GetServerSideProps<{
	data: Data;
}> = async (context) => {
	const data = await getLikedArticles();
	return { props: { data } };
};

export default function Liked({
	data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	const { data: session, status } = useSession();

	const [list, setList] = useState<ArticleData[]>(data.data);
	const [isBottom, setIsBottom] = useState(false);
	const [isLast, setIsLast] = useState(data.is_last);

	const reload = async () => {
		if (list.length !== 0) {
			const res = await fetch(
				`/api/articles/liked?reload=${list.slice(-1)[0].id}`,
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
				<h3>/liked</h3>
				{wrapped.map((e, index) => {
					return (
						<ArticleElement
							key={`liked-element${index}`}
							element={e}
							kind={ElementKind.Liked}
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
