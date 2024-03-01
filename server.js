const express = require("express");
const app = express();
const pg = require("pg");

const client = new pg.Client(
    process.env.DATABASE_URL || "postgres://localhost/acme_notes_categories_db"
);
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(require("morgan")("dev"));

async function init() {
    try {
        await client.connect();
        console.log("Connected to database! 🤩");

        let SQL = `
        DROP TABLE IF EXISTS notes;
        DROP TABLE IF EXISTS categories;

        CREATE TABLE categories(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100)
        );
        
        CREATE TABLE notes(
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            ranking INTEGER DEFAULT 3 NOT NULL,
            txt VARCHAR(255) NOT NULL,
            category_id INTEGER REFERENCES categories(id) NOT NULL
        );
        `;
        await client.query(SQL);
        console.log("Tables Created 📊!");

        SQL = `
        INSERT INTO categories(name) VALUES
       ('SQL'),
       ('Express'),
       ('Shopping');
       
       INSERT INTO notes(txt, ranking, category_id) VALUES
       ('Learn express', 5, (SELECT id FROM categories WHERE name = 'Express'));
       
       INSERT INTO notes(txt, ranking,category_id) VALUES
       ('learn about foreign keys', 4, (SELECT id FROM categories WHERE name='SQL')),
       ('write SQL queries', 4, (SELECT id FROM categories WHERE name='SQL')),
       ('learn about foreign keys', 4, (SELECT id FROM categories WHERE name='SQL')),
       ('buy a quart of milk', 2, (SELECT id FROM categories WHERE name='Shopping'));
       
        `;
        await client.query(SQL);
        console.log("data seeded ✅🥳");
        app.listen(port, () => console.log(`listening on port ${port}`));
    } catch (error) {
        console.error("Error occurred:", error);
    }
}

init();
