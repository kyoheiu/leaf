const CHUNK: &str = "11";

pub fn state_create_articles_table() -> String {
    "
     CREATE TABLE IF NOT EXISTS articles (
     id TEXT PRIMARY KEY,
     url TEXT,
     title TEXT,
     html TEXT,
     cover TEXT,
     plain TEXT,
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
    .to_owned()
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
    .to_owned()
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
    .to_owned()
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

pub fn state_reload(id: &str) -> String {
    format!(
        "
         SELECT *
         FROM articles
         WHERE id < '{}' AND archived = 0
         ORDER BY id DESC
         LIMIT {}
        ",
        id, CHUNK
    )
}

pub fn state_reload_archived(id: &str) -> String {
    format!(
        "
         SELECT *
         FROM articles
         WHERE id < '{}' AND archived = 1
         ORDER BY id DESC
         LIMIT {}
        ",
        id, CHUNK
    )
}

pub fn state_reload_liked(id: &str) -> String {
    format!(
        "
         SELECT *
         FROM articles
         WHERE id < '{}' AND liked = 1
         ORDER BY id DESC
         LIMIT {}
        ",
        id, CHUNK
    )
}

pub fn state_reload_list_tag(id: &str, name: &str) -> String {
    format!(
        "
         SELECT *
         FROM articles
         INNER JOIN tags ON articles.id = tags.ulid
         WHERE id < '{}' AND tags.tag = '{}'
         ORDER BY id DESC
         LIMIT {}
        ",
        id, name, CHUNK
    )
}

pub fn state_add(
    ulid: &str,
    url: &str,
    title: &str,
    html: &str,
    cover: &str,
    plain: &str,
    beginning: &str,
) -> String {
    format!(
        "
         INSERT INTO articles (id, url, title, html, cover, plain, beginning, position, progress, archived, liked, timestamp)
         VALUES (
             '{}',
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
        ulid, url, title, html, cover, plain, beginning)
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
