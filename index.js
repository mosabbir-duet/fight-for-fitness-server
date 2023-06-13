const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000
// middlewire 

app.use(cors());
app.use(express.json())

app.get('/',(req,res) => {
    res.send("Fight for fitness is starting")
})

app.listen(port, () => {
    console.log(`Fight for  fitness is running on port ${port}`)
})