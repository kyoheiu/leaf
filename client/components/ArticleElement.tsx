import { ElementProps, ElementKind } from "../types/types";
import { useState } from "react";
import Tags from "./Tags";
import Link from "next/link";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";
import { Button, Chip, Grid, LinearProgress } from "@mui/material";
import { Avatar } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

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

  const submitAndClose = async () => {
    const element = document.getElementById(article.data.id + "_add_tag");
    const tag = (element as HTMLInputElement).value;
    console.log(tag);
    const target =
      "http://localhost:8000/articles/" + article.data.id + "?kind=add";
    const res = await fetch(target, {
      method: "POST",
      body: tag,
    });
    if (!res.ok) {
      console.log("Cannot add tag.");
    }
    setArticle((x) => ({
      ...x,
      data: {
        ...x.data,
        tags: [...x.data.tags, tag.toLowerCase()],
      },
    }));
    setOpen(false);
  };

  const toggle_like = async () => {
    const target =
      "http://localhost:8000/articles/" + article.data.id + "?toggle=liked";
    const res = await fetch(target, { method: "POST" });
    if (!res.ok) {
      console.log("Cannot toggle like.");
    }

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
  };

  const toggle_archive = async () => {
    const target =
      "http://localhost:8000/articles/" + article.data.id + "?toggle=archived";
    const res = await fetch(target, { method: "POST" });
    if (!res.ok) {
      console.log("Cannot archive article.");
    }

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
  };

  const delete_article = async () => {
    const target = "http://localhost:8000/articles/" + article.data.id;
    const res = await fetch(target, { method: "DELETE" });
    if (!res.ok) {
      console.log("Cannot delete article.");
    }
    setArticle((x) => ({
      ...x,
      visible: false,
    }));
  };

  const delete_tag = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string,
    tag: string
  ) => {
    e.preventDefault();
    console.log(tag);
    const target = "http://localhost:8000/articles/" + id + "?kind=delete";
    const res = await fetch(target, {
      method: "POST",
      body: tag,
    });
    if (!res.ok) {
      console.log("Cannot delete tag.");
    }
    const updated = article.data.tags.filter((x) => x !== tag);
    setArticle((x) => ({
      ...x,
      data: {
        ...x.data,
        tags: updated,
      },
    }));
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
            href={"/articles/" + article.data.id}
            scroll={false}
          >
            {article.data.title}
          </MuiLink>
        </Grid>
      </Grid>
      <div className="element-url">
        <MuiLink color="primary" underline="hover" href={article.data.url}>
          {article.data.url.slice(0, 30) + ".."}
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
              sx={{ width: 100, height: 100 }}
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
                <>
                  <Link href={"/tags/" + x}>
                    <Chip label={x} id={article.data.id + "_delete_tag"} />
                  </Link>
                  <Button onClick={(e) => delete_tag(e, article.data.id, x)}>
                    <RemoveCircleOutlineIcon sx={{ fontSize: 20 }} />
                  </Button>
                  &nbsp; &nbsp;
                </>
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
                id={article.data.id + "_add_tag"}
                label="New tag name"
                type="text"
                fullWidth
                variant="standard"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={submitAndClose}>Add</Button>
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
        <Button id={article.data.id} onClick={toggle_like}>
          {article.data.liked ? (
            <FavoriteIcon sx={{ fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 20 }} />
          )}
        </Button>
        <Button id={article.data.id} onClick={toggle_archive}>
          {article.data.archived ? (
            <UnarchiveIcon sx={{ fontSize: 20 }} />
          ) : (
            <ArchiveIcon sx={{ fontSize: 20 }} />
          )}
        </Button>
        <Button id={article.data.id} onClick={delete_article}>
          <DeleteForeverIcon sx={{ fontSize: 20 }} />
        </Button>
        <Tags tags={article.data.tags} />
      </div>
    </div>
  );
}
