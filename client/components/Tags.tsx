import { useState } from "react";
import { TagsProps } from "../types/types";
import { RiCloseLine, RiAddLine } from "react-icons/ri";
import Link from "next/link";

export default function Tags(data: TagsProps) {
  const [tags, setTags] = useState(data.tags);

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen((b) => !b);
  };

  const submitTag = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(`${id}_add_tag`);
    const tag = (element as HTMLInputElement).value;
    console.log(tag);
    const res = await fetch(`/api/articles/${id}?kind=add`, {
      method: "POST",
      body: tag,
    });
    if (!res.ok) {
      console.error("Cannot add tag.");
      setOpen(false);
    } else {
      setTags((x) => [...x, tag.toLowerCase()]);
      setOpen(false);
    }
  };

  const deleteTag = async (id: string, tag: string) => {
    const res = await fetch(`/api/articles/${id}?kind=delete`, {
      method: "POST",
      body: tag,
    });
    if (!res.ok) {
      console.error("Cannot delete tag.");
    } else {
      const updated = tags.filter((x) => x !== tag);
      setTags(() => updated);
    }
  };

  return (
    <>
      <div className="flex items-center">
        {tags.length !== 0 &&
          tags.map((x, index) => {
            {
              return (
                <>
                  <div className="text-xs text-zinc-900 bg-zinc-200 border border-zinc-200 rounded-full px-2">
                    <Link
                      className="text-xs mr-2 px-2"
                      href={`/tags/${x}`}
                      key={`tag-element${index}`}
                    >
                      {x}
                    </Link>
                    <button
                      id={`${data.id}_delete_tag`}
                      onClick={() => deleteTag(data.id, x)}
                    >
                      <RiCloseLine />
                    </button>
                  </div>
                  &nbsp;
                </>
              );
            }
          })}
      </div>
      &nbsp;
      <button
        className="text-xs border rounded-full px-2"
        onClick={handleClickOpen}
      >
        {tags.length ? <RiAddLine /> : "Add new tag"}
      </button>
      {open && (
        <form
          onSubmit={(e) => submitTag(e, data.id)}
          className="flex justify-start m-2"
        >
          <input
            autoFocus
            id={`${data.id}_add_tag`}
            placeholder="Add new tag"
            className="rounded-md p-1 w-3/4 text-zinc-900 text-sm"
          />
        </form>
      )}
    </>
  );
}
