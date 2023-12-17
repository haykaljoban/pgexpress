import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Pool } from "pg";
import jwt from "jsonwebtoken";

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

const pool = new Pool({
  connectionString: process.env.ELEPHANTSQL_URL,
});

app.use(express.json());

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    const user = result.rows[0];

    if (user) {
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, {
        expiresIn: "5h",
      });

      res.status(200).json({ message: "Login successful", token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", async (req: Request, res: Response) => {
  res.status(201).json({message: "Welcome to Example BE :)"})
})

app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Insert new user into the database
    await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [
      email,
      password,
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(port as number, "0.0.0.0",() => {
  console.log(`⚡️[server]: Server is running at PORT:${port}`);
});
