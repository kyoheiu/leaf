import {
  ElementKind,
  ElementProps,
  TagsProps,
  WrappedData,
} from "../types/types";

export default function Tags(data: TagsProps) {
  return (
    <>
      {data.tags.map((e) => {
        <div>{e}</div>;
      })}
    </>
  );
}
