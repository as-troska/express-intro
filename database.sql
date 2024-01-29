CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY,
    fornavn TEXT,
    etternavn TEXT,
    fdato TEXT,
    epost TEXT,
    brukernavn TEXT NOT NULL,
    passord TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT,
    user_id INTEGER REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES user(id) ON DELETE CASCADE,
    photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES user(id) ON DELETE CASCADE,
    photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
    comment TEXT NOT NULL
);

-- Sletter alle brukere og setter inn to testbrukere. Begge har passordet 123.
DELETE FROM user;
INSERT INTO user (fornavn, etternavn, fdato, epost, brukernavn, passord) VALUES ('Store', 'Bror', '1990-01-01', 'store@bror.no', 'admin', '$2b$10$b/vVQlQnFgapuWWA4.OJz.GTnxtTDY5YsgT9wh1KSMEaaAJl1l716');
INSERT INTO user (fornavn, etternavn, fdato, epost, brukernavn, passord) VALUES ('Test', 'Bruker', '2000-01-01', 'test@bruker.no', 'test', '$2b$10$b/vVQlQnFgapuWWA4.OJz.GTnxtTDY5YsgT9wh1KSMEaaAJl1l716');