const express = require('express');
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 3000
// middlewire 

app.use(cors());
app.use(express.json())


// verify jwt token 
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    // await client.connect();

    // database create
    const instructorCollection = client.db('martialDB').collection('instructor')
    const usersCollection = client.db('martialDB').collection('users')
    const classCollection = client.db('martialDB').collection('selectedClass')


    // jwt token 
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

      res.send({ token })
    })

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    }

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

  app.get('/users', verifyJWT, async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
  });


  app.post('/users', async(req, res) => {
    const users = req.body;
    const result =await usersCollection.insertOne(users)
    res.send(result)

  })

  app.patch('/users/admin/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: 'admin'
      },
    };                                                                                  
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);

  })

  app.get('/users/admin/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;

    if (req.decoded.email !== email) {
      res.send({ admin: false })
    }

    const query = { email: email }
    const user = await usersCollection.findOne(query);
    const result = { admin: user?.role === 'admin' }
    res.send(result);
  })

  app.patch('/users/instructors/:id', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: 'instructor'
      },
    };                                                                                  
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.send(result);

  })


  // carts api 

  app.get('/carts', verifyJWT, async (req, res) => {
    const email = req.query.email;

    if (!email) {
      res.send([]);
    }

    const decodedEmail = req.decoded.email;
    if (email !== decodedEmail) {
      return res.status(403).send({ error: true, message: 'forbidden access' })
    }

    const query = { email: email };
    const result = await classCollection.find(query).toArray();
    res.send(result);
  });

  app.post('/carts', async (req, res) => {
    const item = req.body;
    const result = await classCollection.insertOne(item);
    res.send(result);
  })

  

  app.delete('/carts/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await classCollection.deleteOne(query);
    res.send(result);
  })




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