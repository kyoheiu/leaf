import { ElementProps, ElementKind } from "../types/types";
import { useState } from "react";
import Tags from "./Tags";
import Link from "next/link";
import { Link as MuiLink } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {
  deleteArticle,
  manageTag,
  toggleStatus,
} from "../pages/api/articles/[id]";

export default function ArticleElement(props: ElementProps) {
  const [article, setArticle] = useState(props.element);
  const kind = props.kind;
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
    const res = await manageTag(id, "add", tag);
    if (!res.ok) {
      console.log("Cannot add tag.");
      setOpen(false);
    } else {
      setArticle((x) => ({
        ...x,
        data: {
          ...x.data,
          tags: [...x.data.tags, tag.toLowerCase()],
        },
      }));
      setOpen(false);
    }
  };

  const toggleLiked = async (id: string) => {
    console.log(id);
    const res = await toggleStatus(id, "liked");
    if (!res.ok) {
      console.log("Cannot toggle like.");
    } else {
      if (kind === ElementKind.Liked) {
        setArticle((x) => ({
          visible: false,
          data: {
            ...x.data,
            liked: !x.data.liked,
          },
        }));
      } else {
        setArticle((x) => ({
          visible: x.visible,
          data: {
            ...x.data,
            liked: !x.data.liked,
          },
        }));
      }
    }
  };

  const toggleArchived = async (id: string) => {
    const res = await toggleStatus(id, "archived");
    if (!res.ok) {
      console.log("Cannot archive article.");
    } else {
      if (kind === ElementKind.Archived) {
        setArticle((x) => ({
          visible: false,
          data: {
            ...x.data,
            archived: !x.data.archived,
          },
        }));
      } else {
        setArticle((x) => ({
          visible: x.visible,
          data: {
            ...x.data,
            archived: !x.data.archived,
          },
        }));
      }
    }
  };

  const deleteArticleContent = async (id: string) => {
    const res = await deleteArticle(id);
    if (!res.ok) {
      console.log("Cannot delete article.");
    } else {
      setArticle((x) => ({
        ...x,
        visible: false,
      }));
    }
  };

  const deleteTag = async (id: string, tag: string) => {
    console.log(tag);
    const res = await manageTag(id, "delete", tag);
    if (!res.ok) {
      console.log("Cannot delete tag.");
    } else {
      const updated = article.data.tags.filter((x) => x !== tag);
      setArticle((x) => ({
        ...x,
        data: {
          ...x.data,
          tags: updated,
        },
      }));
    }
  };

  if ((kind === ElementKind.Top && article.data.archived) || !article.visible) {
    return <></>;
  }

  if (
    (kind === ElementKind.Archived ||
      kind === ElementKind.Liked ||
      kind === ElementKind.Searched) &&
    !article.visible
  ) {
    return <></>;
  }

  return (
    <div key={article.data.id} id={article.data.id}>
      <div className="element-timestamp">{article.data.timestamp}</div>
      <Grid container>
        <Grid item xs={9} className="element-title">
          <MuiLink
            component={Link}
            color="primary"
            underline="hover"
            href={`/articles/${article.data.id}`}
            scroll={false}
          >
            {article.data.title}
          </MuiLink>
        </Grid>
      </Grid>
      <div className="element-url">
        <MuiLink color="primary" underline="hover" href={article.data.url}>
          {`${article.data.url.slice(0, 27)}...`}
        </MuiLink>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={9} className="beginning">
          <Typography>{article.data.beginning}</Typography>
        </Grid>
        <Grid item xs={3}>
          {article.data.og !== "" && (
            <Avatar
              className="og"
              sx={{ width: 1, height: 100 }}
              variant="rounded"
              src={article.data.og}
            />
          )}
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={9}>
          {article.data.tags.map((x, index) => {
            {
              return (
                <span key={`tag-element${index.toString()}`}>
                  <Link href={`/tags/${x}`}>
                    <Chip
                      label={x}
                      id={`${article.data.id}_delete_tag`}
                      onDelete={() => deleteTag(article.data.id, x)}
                    />
                  </Link>
                  &nbsp;
                </span>
              );
            }
          })}
          &nbsp;
          <Chip
            label={article.data.tags.length ? "+" : "Add new tag"}
            onClick={handleClickOpen}
          />
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add new tag.</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id={`${article.data.id}_add_tag`}
                label="New tag name"
                type="text"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={() => submitAndClose(article.data.id)}>
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
      <LinearProgress
        variant="determinate"
        sx={{ width: 3 / 4 }}
        value={article.data.progress}
      />
      <div>
        <Button onClick={() => toggleLiked(article.data.id)}>
          {article.data.liked ? (
            <FavoriteIcon sx={{ fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
          )}
        </Button>
        <Button onClick={() => toggleArchived(article.data.id)}>
          {article.data.archived ? (
            <UnarchiveIcon sx={{ fontSize: 20 }} />
          ) : (
            <ArchiveIcon sx={{ fontSize: 20 }} />
          )}
        </Button>
        <Button onClick={() => deleteArticleContent(article.data.id)}>
          <DeleteForeverIcon sx={{ fontSize: 20 }} />
        </Button>
        <Tags tags={article.data.tags} />
      </div>
    </div>
  );
}
