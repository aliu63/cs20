const http = require("http");
const fs = require("fs");
const url = require("url");
const { MongoClient } = require("mongodb");

const connectionString = "mongodb://User:cs20password@ac-j9kpigt-shard-00-00.qkslo9b.mongodb.net:27017,ac-j9kpigt-shard-00-01.qkslo9b.mongodb.net:27017,ac-j9kpigt-shard-00-02.qkslo9b.mongodb.net:27017/?ssl=true&replicaSet=atlas-spussk-shard-0&authSource=admin&appName=CS20Spring";

http.createServer(async function (req, res) {
    const qobj = url.parse(req.url, true);
    const pathname = qobj.pathname;

    if (pathname === "/") {
        fs.readFile("home.html", function(err, data) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
        });
    }
    else if (pathname === "/process") {
        const searchTerm = qobj.query.searchTerm;
        const searchType = qobj.query.searchType;

        console.log("Search Term: " + searchTerm);
        console.log("Search Type: " + searchType);

        let client;

        try {
            client = new MongoClient(connectionString);
            await client.connect();

            const db = client.db("Stock");
            const collection = db.collection("PublicCompanies");

            let query;

            if (searchType === "company") {
            query = { companyName: new RegExp(searchTerm, "i") };
            } else {
            query = { stockTicker: searchTerm.toUpperCase() };
            }

            const results = await collection.find(query).toArray();

            res.writeHead(200, { "Content-Type": "text/html" });
            res.write("<h1>Search Results</h1>");
            res.write('<hr><a href="/">Back to Search</a>');

            if (results.length === 0) {
            res.write("<p>No results found.</p>");
            } else {
            for (let i = 0; i < results.length; i++) {
                const item = results[i];

                console.log(item);

                res.write("<p>");
                res.write("Company: " + item.companyName + "<br>");
                res.write("Ticker: " + item.stockTicker + "<br>");
                res.write("Price: $" + item.stockPrice + "<br>");
                res.write("</p><hr>");
            }
            }

            res.end();
        } catch (err) {
            console.log("Error: " + err);
            res.write("Error occurred.");
            res.end();
        } finally {
            if (client) {
            await client.close();
            }
        }
    }
    else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.write("<h1>Page not found</h1>");
        res.end();
    }
const port = process.env.PORT || 3000;
}).listen(port);

console.log("Server running at http://localhost:3000/");