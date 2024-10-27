import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.API_PORT || 3000;

app.get("/health", (_req: Request, res: Response) => {
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on("error", (err) => {
    throw new Error(err.message);
});

export default app;
