const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for temporary storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize Pinata client with your API keys
const initPinata = () => {
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

  if (!pinataApiKey || !pinataSecretApiKey) {
    console.error('Pinata API keys are not set in environment variables');
    throw new Error('Pinata API keys are not set in environment variables');
  }

  try {
    return new pinataSDK(pinataApiKey, pinataSecretApiKey);
  } catch (error) {
    console.error('Error initializing Pinata SDK:', error);
    throw new Error('Failed to initialize Pinata SDK');
  }
};

// Middleware to upload image to Pinata
const uploadToPinata = async (req, res, next) => {
  let tempFilePath = null;
  
  try {
    console.log('Processing file upload to Pinata');
    
    if (!req.file) {
      console.error('No file provided in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.accountAddress) {
      console.error('No account address found in request');
      return res.status(400).json({ error: 'No account address provided' });
    }

    // Create a temporary file from buffer
    const fileName = `temp-${Date.now()}.png`;
    tempFilePath = path.join(__dirname, `../${fileName}`);
    console.log(`Creating temporary file: ${tempFilePath}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    // Initialize Pinata
    const pinata = initPinata();
    const { accountAddress } = req;

    // Prepare metadata for Pinata
    const pinataOptions = {
      pinataMetadata: {
        name: `${accountAddress}_image`,
        keyvalues: {
          address: accountAddress,
          timestamp: Date.now().toString()
        }
      },
    };

    console.log(`Uploading image to Pinata for account: ${accountAddress}`);
    // Upload file to IPFS via Pinata
    const result = await pinata.pinFromFS(tempFilePath, pinataOptions);

    if (!result || !result.IpfsHash) {
      console.error('Failed to get valid IPFS hash from Pinata');
      return res.status(500).json({ error: 'Failed to upload image to IPFS' });
    }

    console.log(`Successfully uploaded to IPFS with hash: ${result.IpfsHash}`);
    
    // Add IPFS hash to request for the next middleware
    req.ipfsHash = result.IpfsHash;
    req.ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

    next();
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return res.status(500).json({ error: 'Failed to upload image to IPFS' });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Cleaned up temporary file: ${tempFilePath}`);
      } catch (e) {
        console.error(`Failed to clean up temporary file: ${tempFilePath}`, e);
      }
    }
  }
};

module.exports = {
  uploadVoter: [upload.single('file'), uploadToPinata],
  uploadCandidate: [upload.single('file'), uploadToPinata]
}; 