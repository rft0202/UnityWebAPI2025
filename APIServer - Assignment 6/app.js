const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const { nanoid } = require("nanoid");
const Player = require("./models/Player");

const app = express();
app.use(express.json());
app.use(cors()); //Allows us to make requiests from our game.
app.use(bodyParser.json());

const FILE_PATH = "player.json";

//Connection for MongoDB
mongoose.connect("mongodb+srv://rtester:rfayetester@cluster0.kraow.mongodb.net/Assign6?retryWrites=true&w=majority&appName=Cluster0");
//mongoose.connect("mongodb://localhost:27017/gamedb");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error"));
db.once("open", ()=>{
    console.log("Connected to MongoDB Database");
});


//API endpoint for player.json;

// app.get("/player", (req,res)=>{
//     fs.readFile(FILE_PATH, "utf-8",(err, data)=>{
//         if(err){
//             return res.status(500).json({error:"Unable to fetch data"});
//         }
//         res.json(JSON.parse(data));
//         console.log(`Responded with: ${data}`);
//     })
// });

//NEW - 2/24/25 (Week 8 Day 1)
//Using Cloud DB (Atlas)
app.get("/player", async (req, res)=>{
    try{
        const players = await Player.find();
        if(!players){
            return res.status(404).json({error:"Players not found"})
        }
        players.sort((a,b)=>b.screenName - a.screenName);
        res.json(players);
        console.log(players);
    }
    catch(error){
        res.status(500).json({error:"Failed to retrieve player"})
    }
});

app.get("/player/:playerid", async(req,res)=>{
    try{

        const player = await Player.findOne({playerid:req.params.playerid});

        if(!player){
            return res.status(404).json({error:"Player not found"})
        }
        res.json(player);
        console.log(player);
    }
    catch(error)
    {
        res.status(500).json({error:"Failed to retrieve player"})
    }
});

app.post("/sentdata", (req,res)=>{
    const newPlayerData = req.body;

    console.log(JSON.stringify(newPlayerData,null,2));

    res.json({message:"Player Data recieved"});
});

app.post("/sentdatatodb", async (req,res)=>{
    try{
        const newPlayerData = req.body;

        console.log(JSON.stringify(newPlayerData,null,2));

        const newPlayer = new Player({
            playerid:nanoid(8),
            screenName:newPlayerData.screenName,
            firstName:newPlayerData.firstName,
            lastName:newPlayerData.lastName,
            dateStarted:newPlayerData.dateStarted,
            score:newPlayerData.score

        });
        //save to database
        await newPlayer.save();
        res.json({message:"Player Added Successfully",playerid:newPlayer.playerid, name:newPlayer.screenName});
    }
    catch(error){
        res.status(500).json({error:"Failed to add player"})
    }
    
    
});

//NEW - Update Player
app.post("/updatePlayer", async(req,res)=>{
    const playerData = req.body;

    const player = await Player.findOne({screenName:playerData.screenName});

    if(!player){
        return res.status(404).json({message:"Player not found"});
    }

    //cannot update screen name
    player.firstName = playerData.firstName;
    player.lastName = playerData.lastName;
    //Cannot update date Started
    player.score = playerData.score;

    await player.save();

    res.json({message:"Player updated ", player})
});

//NEW - Delete Player
//Delete Route (DELETE)
app.delete("/delete/screenName", async (req,res)=>{
    try{
        const screenName = req.query; //query request
        const player = await Player.find(screenName); //find using the query

        if(player.length === 0){ //=== means exactly equal to (the data type matches)
            return res.status(404).json({error:"Failed to find the player."}); 
        } 
        
        const deletedPlayer = await Player.findOneAndDelete(screenName);
        res.json({message: "Player deleted successfully."});

    }catch(err){
        console.log(err);
        res.status(404).json({error:"Player not found."}); 
    }
}); 

app.listen(3000, ()=>{
    console.log("Running on port 3000");
})