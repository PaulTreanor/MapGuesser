import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import Database from "better-sqlite3";

const app = express();

dotenv.config();

const db = new Database("./data/mapguesser.db", { verbose: console.log });
db.pragma('journal_mode = WAL'); // write-aheard logging for better performance apparently

const PORT = process.env.API_PORT || 3000;

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send("OK");
});

app.get("/cities", (_req: Request, res: Response) => {
    const cities = db.prepare("SELECT * FROM cities ORDER BY RANDOM() LIMIT 5").all();
    res.status(200).json(cities);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on("error", (err) => {
    throw new Error(err.message);
});

export default app;
