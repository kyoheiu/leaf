import { Chip, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { TagsProps } from "../types/types";

export default function Tags(data: TagsProps) {
	const [tags, setTags] = useState(data.tags);
	const router = useRouter();

	const [open, setOpen] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const submitAndClose = async (id: string) => {
		const element = document.getElementById(`${id}_add_tag`);
		const tag = (element as HTMLInputElement).value;
		const res = await fetch(`/api/articles/${id}?kind=add`, {
			method: "POST",
			body: tag,
		});
		if (!res.ok) {
			console.log("Cannot add tag.");
			setOpen(false);
		} else {
			setTags((x) => [...x, tag.toLowerCase()])
			setOpen(false);
		}
	};

	const navigateToTag = (tag: string) => {
		router.push(`/tags/${tag}`);
	};

	const deleteTag = async (id: string, tag: string) => {
		const res = await fetch(`/api/articles/${id}?kind=delete`, {
			method: "POST",
			body: tag,
		});
		if (!res.ok) {
			console.log("Cannot delete tag.");
		} else {
			const updated = data.tags.filter((x) => x !== tag);
			setTags(() => updated);
		}
	};

	return (
		<>
			{tags.length !== 0 &&
				tags.map((x, index) => {
					{
						return (
							<span key={`tag-element${index.toString()}`}>
								<Chip
									label={x}
									id={`${data.id}_delete_tag`}
									onClick={() => navigateToTag(x)}
									onDelete={() => deleteTag(data.id, x)}
								/>
								&nbsp;
							</span>
						);
					}
				})}
			&nbsp;
			<Chip
				label={data.tags.length ? "+" : "Add new tag"}
				onClick={handleClickOpen}
			/>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Add new tag.</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin="dense"
						id={`${data.id}_add_tag`}
						label="New tag name"
						type="text"
						fullWidth
						variant="standard"
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={() => submitAndClose(data.id)}>
						Add
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
