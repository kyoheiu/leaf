CREATE TABLE 'temp' ('ulid', 'tag');
INSERT INTO 'temp'
SELECT "ulid",
    "tag"
FROM 'tags';
DROP TABLE 'tags';
CREATE TABLE 'tags' (
    'id' INTEGER primary key,
    'ulid' TEXT NOT NULL,
    'tag' TEXT NOT NULL
);
INSERT INTO 'tags'("ulid", "tag")
SELECT "ulid",
    "tag"
FROM 'temp';
DROP TABLE 'temp';