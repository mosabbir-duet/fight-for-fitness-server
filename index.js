const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 3000
// middlewire 

app.use(cors());
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qqel2bj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // database create
    const instructorCollection = client.db('martialDB').collection('instructor')
    const usersCollection = client.db('martialDB').collection('users')
    const classCollection = client.db('martialDB').collection('selectedClass')

    // sorting 6 data fetch based on numberOfStudents 
    app.get('/info', async(req, res) => {
        const sort = {numberOfStudents:-1}
        const result = await instructorCollection.find().sort(sort).limit(6).toArray()
        res.send(result)
    })

    // data fetch for showing all instructors and classes information 
    app.get('/instructors', async(req, res) => {
      const result = await instructorCollection.find().toArray()
      res.send(result)
  })

  // users api 

  app.post('/users', async(req, res) => {
    const users = req.body;
    const result =await usersCollection.insertOne(users)
    res.send(result)

  })

  app.post('/carts', async(req, res) => {
    const cart = req.body;
    console.log(cart)
    const result =await classCollection.insertOne(cart)
    res.send(result)

  })

  // cart api 



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res) => {
    res.send("Fight for fitness is starting")
})

app.listen(port, () => {
    console.log(`Fight for  fitness is running on port ${port}`)
})