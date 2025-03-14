const mongoose = require("mongoose");
const Player = require("./models/Player");
const { nanoid } = require("nanoid");

mongoose.connect("mongodb+srv://rtester:rfayetester@cluster0.kraow.mongodb.net/GamesDB?retryWrites=true&w=majority&appName=Cluster0"); //Put in specified database (create if doesn't exist)
//mongoose.connect("mongodb+srv://rtester:rfayetester@cluster0.kraow.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

async function addPlayer(){
    await Player.create({
        playerid:nanoid(8),
        name:"Jack",
        level:12,
        score:30000
    });

    console.log("Player Added");
    mongoose.connection.close();
}

addPlayer();