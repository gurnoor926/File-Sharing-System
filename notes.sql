CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  filepath TEXT NOT NULL,
  description TEXT,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
truncate table files,users restart identity;