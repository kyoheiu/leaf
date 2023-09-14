export interface ArticleData {
	id: string;
	url: string;
	title: string | null;
	cover: string | null;
	beginning: string | null;
	position: number | null;
	progress: number | null;
	archived: number;
	liked: number;
	timestamp: Date;
}

export interface ArticleDataWithTag {
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
export enum Action {
	ToggleLiked,
	ToggleArchived,
	UpdatePosition,
	Delete
}
