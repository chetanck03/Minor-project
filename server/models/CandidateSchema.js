const mongoose = require('mongoose')

const CandidateSchema= new mongoose.Schema({
     
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
const CandidateModel = mongoose.model("candidates",CandidateSchema)
module.exports= CandidateModel;