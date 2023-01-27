export const Header = () => {
  return (
    <>
      <div className="header">
        <li>
          <ul>
            <a href="/">acidpaper</a>
          </ul>
          <form action="/api/create" method="POST">
            <input name="url" type="URL" />
            <button type="submit">Add</button>
          </form>
          <ul>
            <form action="/search" method="GET">
              <input type="text" id="query" name="q" />
              <button type="submit">Search</button>
            </form>
          </ul>
          <ul>
            <a href="/archived">archived</a>
          </ul>
          <ul>
            <a href="/liked">liked</a>
          </ul>
        </li>
      </div>
    </>
  );
};
