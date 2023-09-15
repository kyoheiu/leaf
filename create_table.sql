CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    url TEXT,
    title TEXT,
    html TEXT,
    cover TEXT,
    beginning TEXT,
    position INTEGER,
    progress INTEGER,
    archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
    liked INTEGER NOT NULL DEFAULT 0 CHECK (liked IN (0, 1)),
    timestamp DATETIME
);
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY,
    ulid TEXT,
    tag TEXT NOT NULL
);