DROP TABLE IF EXISTS gardens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE gardens (
  id SERIAL PRIMARY KEY,
  garden_name VARCHAR(255),
  garden_owner VARCHAR(50),
  contents TEXT,
  birthday INTEGER
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) UNIQUE,
  password_digest VARCHAR(255),
  username VARCHAR(50),
  garden_id INTEGER REFERENCES gardens(id)
);

