const express = require('express')
const router = express.Router()
const {authentication} = require("../middlewares/authentication")
const CandidateModel = require("../models/CandidateSchema")
const pinataMiddleware = require("../middlewares/pinata")

router.post('/postCandidateImage', authentication, pinataMiddleware.uploadCandidate, async(req, res) => {
    try{
        const {accountAddress} = req;
        const {ipfsHash, ipfsUrl} = req;
        
        await CandidateModel.create({
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
        res.status(500).json({error: "Failed to save candidate image"})
    }
})

// Get candidate image URL by address
router.get('/getCandidateImage/:address', async(req, res) => {
    try {
        const { address } = req.params;
        
        if (!address) {
            return res.status(400).json({ error: 'Address parameter is required' });
        }
        
        console.log(`Getting image for candidate address: ${address}`);
        const candidate = await CandidateModel.findOne({ accountAddress: address });
        
        if (!candidate) {
            console.log(`No candidate image found for address: ${address}`);
            return res.status(404).json({ 
                error: 'Candidate image not found',
                message: 'No image has been uploaded for this candidate'
            });
        }
        
        if (!candidate.ipfsUrl) {
            console.log(`Candidate found but no IPFS URL for address: ${address}`);
            return res.status(404).json({ 
                error: 'Candidate image URL not found',
                message: 'Candidate exists but no image URL is available'
            });
        }
        
        console.log(`Returning candidate image URL for ${address}: ${candidate.ipfsUrl}`);
        return res.status(200).json({ 
            ipfsUrl: candidate.ipfsUrl,
            ipfsHash: candidate.ipfsHash
        });
    } catch (error) {
        console.error(`Error fetching candidate image for address ${req.params.address}:`, error);
        return res.status(500).json({ error: 'Failed to fetch candidate image' });
    }
})

module.exports=router;