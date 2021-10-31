const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xhxaw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("tourism");
    const tripsCollection = database.collection("trips");
    const bookingCollection = database.collection("booking");
    app.get('/trips',async(req,res)=>{
      const cursor = tripsCollection.find({});
      const trips = await cursor.toArray();
      res.send(trips);
    })
    // POST API
    app.post("/trips", async (req, res) => {
      const trips = req.body;

      const result = await tripsCollection.insertOne(trips);
      res.json(result);
    });
    //post api for booking
    app.post("/booking", async (req, res) => {
      const book = req.body;
      const result = await bookingCollection.insertOne(book);
      res.json(result);
    });

    // GET API
    app.get("/getExternal", async (req, res) => {
      const query = { type: "external" };
      const cursor = tripsCollection.find(query);
      const trips = await cursor.toArray();
      res.send(trips);
    });
    // GET API
    app.get("/getInternal", async (req, res) => {
      const query = { type: "internal" };
      const cursor = tripsCollection.find(query);
      const trips = await cursor.toArray();
      res.send(trips);
    });
    // GET User order
    app.get("/order/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = bookingCollection.find(query);
      const trips = await cursor.toArray();
      res.send(trips);
    });
    //get single trips
    // GET Single Service
    app.get("/trips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await tripsCollection.findOne(query);
      res.json(service);
    });
    ///delete booking
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
    app.put("/order/:id",async(req,res)=>{
      const id=req.params.id;
      const filter={ _id: ObjectId(id) }
      const updateDoc = {
        $set: {
            status: "delivary",
        },
    };
    const result=await bookingCollection.updateOne(filter,updateDoc)
    res.json(result)
    })
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
