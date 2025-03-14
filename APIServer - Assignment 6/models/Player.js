const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    playerid:{ type: String, unique:true},
    screenName:String,
    firstName:String,
    lastName:String,
    dateStarted:String,
    score:Number
})

const Player = mongoose.model("Player", playerSchema);

module.exports = Player