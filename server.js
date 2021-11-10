const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());
//Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iy3km.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        console.log('db connected')
        const database = client.db("watch-club");
        const watchCollection = database.collection("watch-item");

        //Get All Watches
        app.get('/watchItems',async(req,res)=>{
            const cursor = await watchCollection.find({});
            const allWatches = await cursor.toArray();
            res.send(allWatches);
        })

      
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Watch-club Server Running');
});

app.listen(port, () => {
    console.log('Watch-club Server Running', port);
})