export enum Category {
	All,
	Liked,
	Archived,
	Tagged,
	Searched
}

export interface Articles {
	data: ArticleData[];
	is_last: boolean;
}

export interface ArticleScraped {
	url: string;
	title: string;
	html: string;
	cover: string;
}

export interface ArticleData {
	id: string;
	url: string;
	title: string | null;
	cover: string | null;
	beginning: string | null;
	progress: number | null;
	archived: number;
	liked: number;
	timestamp: Date | null;
	tags: string[];
}

export interface WrappedData {
	visible: boolean;
	data: ArticleData;
}

export interface ArticleContent {
	id: string;
	url: string;
	title: string;
	html: string;
	position: number;
	progress: number;
	archived: boolean;
	liked: boolean;
	timestamp: string;
	tags: string[];
}

export enum ElementKind {
	Top,
	Archived,
	Liked,
	Searched
}

export enum PaginationKind {
	Top,
	Archived,
	Liked,
	Tags
}

export interface ElementProps {
	element: WrappedData;
	kind: ElementKind;
}
