const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.onnu8qm.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });

        const usersDB = client.db("usersDB");
        const usersCollection = usersDB.collection("users");

        // API for getting user form client side and saving it to database
        app.post("/users", async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);

            res.send(result);
        });

        // API for getting all users data
        app.get("/users", async (req, res) => {
            const cursor = usersCollection.find();
            const users = await cursor.toArray();

            res.send(users);
        });

        // API for getting a specific user
        app.get("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await usersCollection.findOne(query);

            res.send(user);
        });

        // API for updating user
        app.patch("/users/:id", async (req, res) => {
            const { id } = req.params;
            const { name, email } = req.body;
            const query = { _id: new ObjectId(id) };
            const update = { $set: { name, email } };
            const result = await usersCollection.updateOne(query, update);

            res.send(result);
        });

        // API for deleting user
        app.delete("/users", async (req, res) => {
            const { userId } = req.body;
            const query = { _id: new ObjectId(userId) };
            const result = await usersCollection.deleteOne(query);

            res.send(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Simple crud server in running on port: ${port}`);
});
