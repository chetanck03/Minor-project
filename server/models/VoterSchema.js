const mongoose = require('mongoose')

const VoterScheme = new mongoose.Schema({
    accountAddress:{
        type:String,
        required:true
    },
    ipfsHash:{
        type:String,
        required:true
    },
    ipfsUrl:{
        type:String,
        required:true
    }
})

const VoterModel = mongoose.model("voters",VoterScheme)
module.exports = VoterModel