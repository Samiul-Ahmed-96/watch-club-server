const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
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
        const ordersCollection =database.collection("orders");
        const usersCollection =database.collection("users");

        //Get All Watches
        app.get('/watchItems',async(req,res)=>{
            const cursor = await watchCollection.find({});
            const allWatches = await cursor.toArray();
            res.send(allWatches);
        })
        //Get Single Watch
        app.get('/watchItems/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const singleWatch = await watchCollection.findOne(query);
            res.json(singleWatch);
        })
         //Add orders Api
         app.post('/orders',async(req,res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })
         //Add Product Api
         app.post('/watchItems',async(req,res)=>{
            console.log('hiitssss')
            const newProduct = req.body;
            console.log(newProduct);
            const product = await watchCollection.insertOne(newProduct);
            res.json(product);
        })
        //Get Orders specific orders using email
        app.get('/orders', async(req,res)=>{
            const email = req.query.email;
            const query = {email : email}
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);

        })
        //Delete single item from orders Api
        app.delete('/orders/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            console.log(result)
            res.json(result)
        })
        //Delete single item from Products Api
        app.delete('/watchItems/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const result = await watchCollection.deleteOne(query);
            console.log(result)
            res.json(result)
        })
        //Added user to Db 
        app.post('/users', async (req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })
        //Added user to db using upsert
        app.put('/users', async(req,res)=>{
            const user = req.body;
            const filter = {email: user.email};
            const options = { upsert : true};
            const update = {$set : user}
            const result =await usersCollection.updateOne(filter,update,options);
            res.json(result)
        })
        //Added Admin
        app.put('/users/admin',async(req,res) =>{
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //Check Admin
        app.get('/users/:email' , async (req,res)=>{
            const email = req.params.email; 
            const query = {email : email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin : isAdmin})
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