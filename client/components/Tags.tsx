import {
  Chip,
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { TagsProps } from "../types/types";
import { RiCloseLine, RiAddLine } from "react-icons/ri";

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
      setTags((x) => [...x, tag.toLowerCase()]);
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
      const updated = tags.filter((x) => x !== tag);
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
        label={tags.length ? "+" : "Add new tag"}
        onClick={handleClickOpen}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id={`${data.id}_add_tag`}
            type="text"
            fullWidth
            placeholder="Add new tag"
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            <RiCloseLine />
          </Button>
          <Button onClick={() => submitAndClose(data.id)}>
            <RiAddLine />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
