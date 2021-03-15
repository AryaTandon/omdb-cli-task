
const prompt = require("readline-sync").question;
const { Client } = require('pg');

console.log("Hello user!");

const CLIQuery = async () => {
    const connectionString =
    "postgresql://localhost:5432/omdb";

    const client = new Client({
        connectionString,
    });

    await client.connect();

    console.log("Welcome! \n\n [1] Search \n [2] See favourites \n [3] Quit")

    let choice = prompt("Choose an action [1, 2, 3]: ")
    let searchString = String;
    
    while (searchString !== 'q') {
        if (choice === '1') {
            searchString = prompt("What's your search string? (type 'q' to exit): ");

                const text = 'SELECT id, name, date, runtime, budget, revenue, vote_average, votes_count FROM movies ' + 
                'WHERE name ILIKE $1 ' +
                'AND kind = $2 ' +
                'AND date IS NOT null ' +
                'ORDER BY date DESC ' +
                'LIMIT 10';
                const values = [`%${searchString}%`, 'movie'];
                const namesQuery = {
                    text: `SELECT name FROM (${text}) AS text;`,
                    values,
                    rowMode: 'array',
                }

                try {
                    const res = await client.query(text, values);
                    console.table(res.rows);
                    const names = await client.query(namesQuery)
                    console.table(names.rows);
                    let faveValue = prompt("Choose a movie number to favourite: ")
                    console.log("Saving favourite movie: " + String(names.rows[faveValue]))
                    client.query(`INSERT INTO favourites (movie_id)
                    SELECT id
                    FROM movies mv 
                    WHERE mv.name = '${String(names.rows[faveValue])}';`)
                    console.log("\n [1] Search \n [2] See favourites \n [3] Quit")
                    choice = prompt("Choose an action [1, 2, 3]: ")
                } catch (err) {
                    console.log(err.stack);
                } 
        } else if (choice === '2') {
            try {
                const res = await client.query('SELECT * FROM movies mv, favourites fv WHERE mv.id = fv.movie_id;');
                console.table(res.rows);
                choice = prompt("Choose an action [1, 2, 3]: ")
            } catch (err) {
                console.log(err.stack);
            } 
        } else {
            await client.end();
        }
    }
    
    await client.end();
}

CLIQuery();

