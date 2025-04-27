const express = require('express')
const router = express.Router()
const {authentication} = require("../middlewares/authentication")
const pinataMiddleware = require("../middlewares/pinata")

const VoterModel = require("../models/VoterSchema")

router.post('/postVoterImage', authentication, pinataMiddleware.uploadVoter, async(req, res) => {
    try{
        const {accountAddress} = req;
        const {ipfsHash, ipfsUrl} = req;
        
        await VoterModel.create({
            accountAddress,
            ipfsHash,
            ipfsUrl
        })
        res.status(200).json({
            message: "successful",
            ipfsUrl: ipfsUrl
        })

    }catch(error){
        console.log(error)
        res.status(500).json({error: "Failed to save voter image"})
    }
})

// Get voter image URL by address
router.get('/getVoterImage/:address', async(req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({ error: 'Address parameter is required' });
        }
        
        console.log(`Getting image for voter address: ${address}`);
        const voter = await VoterModel.findOne({ accountAddress: address });
        
        if (!voter) {
            console.log(`No voter image found for address: ${address}`);
            return res.status(404).json({ 
                error: 'Voter image not found',
                message: 'No image has been uploaded for this voter'
            });
        }
        
        if (!voter.ipfsUrl) {
            console.log(`Voter found but no IPFS URL for address: ${address}`);
            return res.status(404).json({ 
                error: 'Voter image URL not found',
                message: 'Voter exists but no image URL is available'
            });
        }
        
        console.log(`Returning voter image URL for ${address}: ${voter.ipfsUrl}`);
        return res.status(200).json({ 
            ipfsUrl: voter.ipfsUrl,
            ipfsHash: voter.ipfsHash
        });
    } catch (error) {
        console.error(`Error fetching voter image for address ${req.params.address}:`, error);
        return res.status(500).json({ error: 'Failed to fetch voter image' });
    }
})

module.exports = router;