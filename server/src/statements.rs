const PAGINATION: usize = 20;
const CHUNK: &str = "21";

pub fn state_create_articles_table() -> String {
    "
     CREATE TABLE IF NOT EXISTS articles (
     id TEXT PRIMARY KEY,
     url TEXT,
     title TEXT,
     html TEXT,
     cover TEXT,
     beginning TEXT,
     position INTEGER,
     progress INTEGER,
     archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0,1)),
     liked INTEGER NOT NULL DEFAULT 0 CHECK (liked IN (0,1)),
     timestamp DATETIME
     )
    "
    .to_owned()
}

pub fn state_create_tags_table() -> String {
    "
     CREATE TABLE IF NOT EXISTS tags (
     ulid TEXT,
     tag TEXT NOT NULL
     )
    "
    .to_owned()
}

pub fn state_list_all() -> String {
    "
     SELECT *
     FROM articles
     ORDER BY id DESC
     "
    .to_string()
}

pub fn state_list_up() -> String {
    format!(
        "
     SELECT *
     FROM articles
     WHERE archived = 0
     ORDER BY id DESC
     LIMIT {}
     ",
        CHUNK
    )
}

pub fn state_list_up_archived() -> String {
    format!(
        "
     SELECT *
     FROM articles
     WHERE archived = 1
     ORDER BY id DESC
     LIMIT {}
     ",
        CHUNK
    )
}

pub fn state_list_up_liked() -> String {
    format!(
        "
     SELECT *
     FROM articles
     WHERE liked = 1
     ORDER BY id DESC
     LIMIT {}
     ",
        CHUNK
    )
}

pub fn state_list_tags(id: &str) -> String {
    format!(
        "
         SELECT *
         FROM tags
         WHERE ulid = '{}'
        ",
        id
    )
}

pub fn state_list_tag(name: &str) -> String {
    format!(
        "
         SELECT *
         FROM articles
         INNER JOIN tags ON articles.id = tags.ulid
         WHERE tags.tag = '{}'
         ORDER BY id DESC
         LIMIT {}
        ",
        name, CHUNK
    )
}

pub fn state_reload(page: usize) -> String {
    let skip = (page - 1) * PAGINATION;
    format!(
        "
         SELECT *
         FROM articles
         WHERE archived = 0
         ORDER BY id DESC
         LIMIT {} OFFSET {}
        ",
        CHUNK, skip
    )
}

pub fn state_reload_archived(page: usize) -> String {
    let skip = (page - 1) * PAGINATION;
    format!(
        "
         SELECT *
         FROM articles
         WHERE archived = 1
         ORDER BY id DESC
         LIMIT {} OFFSET {}
        ",
        CHUNK, skip
    )
}

pub fn state_reload_liked(page: usize) -> String {
    let skip = (page - 1) * PAGINATION;
    format!(
        "
         SELECT *
         FROM articles
         WHERE liked = 1
         ORDER BY id DESC
         LIMIT {} OFFSET {}
        ",
        CHUNK, skip
    )
}

pub fn state_reload_list_tag(name: &str, page: usize) -> String {
    let skip = (page - 1) * PAGINATION;
    format!(
        "
         SELECT *
         FROM articles
         INNER JOIN tags ON articles.id = tags.ulid
         WHERE tags.tag = '{}'
         ORDER BY id DESC
         LIMIT {} OFFSET {}
        ",
        name, CHUNK, skip
    )
}

pub fn state_add(
    ulid: &str,
    url: &str,
    title: &str,
    html: &str,
    cover: &str,
    beginning: &str,
) -> String {
    format!(
        "
         INSERT INTO articles (id, url, title, html, cover, beginning, position, progress, archived, liked, timestamp)
         VALUES (
             '{}',
             '{}',
             '{}',
             '{}',
             '{}',
             '{}',
             0,
             0,
             0,
             0,
             datetime('now', 'localtime')
         );
        ",
        ulid, url, title, html, cover, beginning)
}

pub fn state_delete(id: &str) -> String {
    format!(
        "
         DELETE FROM articles
         WHERE id = '{}';
        ",
        id
    )
}

pub fn state_read(id: &str) -> String {
    format!(
        "
         SELECT *
         FROM articles
         WHERE id = '{}';
        ",
        id
    )
}

pub fn state_upgrade_progress(pos: u16, prog: u16, id: &str) -> String {
    format!(
        "
         UPDATE articles
         SET position = '{}',
         progress = '{}'
         WHERE id = '{}'
        ",
        pos, prog, id
    )
}

pub fn state_toggle(toggle: &str, id: &str) -> String {
    format!(
        "
         UPDATE articles
         SET {} = CASE {} WHEN 0 THEN 1 ELSE 0 END
         WHERE id = '{}'
        ",
        toggle, toggle, id
    )
}

pub fn state_add_tag(id: &str, tag: &str) -> String {
    format!(
        "
         INSERT INTO tags (ulid, tag)
         VALUES (
             '{}',
             '{}'
         );
        ",
        id, tag
    )
}

pub fn state_delete_tag(id: &str, tag: &str) -> String {
    format!(
        "
         DELETE FROM tags
         WHERE ulid = '{}' and tag = '{}';
        ",
        id, tag
    )
}
