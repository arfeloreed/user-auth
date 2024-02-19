import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import jwt from "jsonwebtoken";
import "dotenv/config";

// variables
const app = express();
const port = process.env.PORT_SERVER;
const saltRounds = parseInt(process.env.SALTROUNDS);

// middlewares
app.use(cors());
app.use(express.json());

// db setup
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

// routes
// get a user by email
app.get("/users/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const data = result.rows[0];

    return res.json(data);
  } catch (err) {
    console.error("Internal server error.", err.message);
    res.status(500).json("error");
  }
});

// register a user
app.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (hash) {
        await db.query("INSERT INTO users (email, password, name) VALUES ($1, $2, $3)", [
          email,
          hash,
          name,
        ]);
        return res.sendStatus(201);
      }

      if (err) {
        console.error("Can't save password", err);
        return res.json("error");
      }
    });
  } catch (err) {
    console.error("Internal server error.", err.message);
    return res.status(500).json("error");
  }

  // try {
  //   const { email, password, name } = req.body;
  //   await db.query("INSERT INTO users (email, password, name) VALUES ($1, $2, $3)", [
  //     email,
  //     password,
  //     name,
  //   ]);

  //   res.sendStatus(201);
  // } catch (err) {
  //   console.error("Internal server error.", err.message);
  //   // console.error("Internal server error.", err);
  //   // res.sendStatus(500);
  //   res.status(500).json("Error");
  // }
});

// logging in a user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const data = result.rows[0];

    bcrypt.compare(password, data.password, (err, isMatched) => {
      if (err) {
        console.error(err);
        return res.json({ message: "error" });
      }

      if (isMatched) {
        const jwtToken = jwt.sign(
          {
            id: data.id,
            email: data.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.json({ message: "success", token: jwtToken });
      } else return res.json({ message: "error" });
    });
  } catch (err) {
    console.error("Internal server error.", err);
    res.json({ message: "error" });
  }

  // try {
  //   const { email, password } = req.body;
  //   const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  //   const data = result.rows[0];

  //   if (data.password !== password) return res.json({ message: "error" });

  //   const jwtToken = jwt.sign(
  //     {
  //       id: data.id,
  //       email: data.email,
  //     },
  //     process.env.JWT_SECRET,
  //     { expiresIn: "1h" }
  //   );

  //   res.json({ message: "success", token: jwtToken });
  // } catch (err) {
  //   console.error("Internal server error.", err.message);
  //   res.status(500).json("Error");
  // }
});

// google register
app.post("/google/register", async (req, res) => {
  const { email, google_id, name } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO users (email, google_id, name) VALUES ($1, $2, $3) RETURNING *",
      [email, google_id, name]
    );
    const data = result.rows[0];

    if (data) {
      const jwtToken = jwt.sign(
        {
          id: data.id,
          email: data.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      return res.json({
        message: "success",
        token: jwtToken,
        id: data.id,
        email: data.email,
      });
    }
  } catch (err) {
    console.error("Internal server error.", err.message);
    return res.status(500).json("Error");
  }
});

// google login
app.post("/google/login", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const data = result.rows[0];

    if (data) {
      const jwtToken = jwt.sign(
        {
          id: data.id,
          email: data.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      return res.json({ message: "success", token: jwtToken });
    }
  } catch (err) {
    console.error("Internal server error.", err.message);
    return res.json("error");
  }
});

app.listen(port, () => {
  console.log(`Server running in port: ${port}`);
});
