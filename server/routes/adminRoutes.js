const express = require('express');
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const VoterModel = require("../models/VoterSchema");
const CandidateModel = require("../models/CandidateSchema");

// Reset the MongoDB database - delete all voter and candidate images
router.post('/reset-database', authentication, async (req, res) => {
    try {
        const { accountAddress } = req;
        console.log(`Reset database request from address: ${accountAddress}`);

        // Delete all voter records
        const voterResult = await VoterModel.deleteMany({});
        
        // Delete all candidate records
        const candidateResult = await CandidateModel.deleteMany({});
        
        console.log(`Deleted ${voterResult.deletedCount} voter records and ${candidateResult.deletedCount} candidate records`);
        
        res.status(200).json({
            success: true,
            message: "Database reset successful",
            deleted: {
                voters: voterResult.deletedCount,
                candidates: candidateResult.deletedCount
            }
        });
    } catch (error) {
        console.error("Database reset error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset database",
            error: error.message
        });
    }
});

// Get database stats
router.get('/database-stats', authentication, async (req, res) => {
    try {
        // Count documents in collections
        const voterCount = await VoterModel.countDocuments();
        const candidateCount = await CandidateModel.countDocuments();
        
        res.status(200).json({
            success: true,
            stats: {
                voters: voterCount,
                candidates: candidateCount
            }
        });
    } catch (error) {
        console.error("Failed to get database stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get database statistics",
            error: error.message
        });
    }
});

module.exports = router; 