// Test script to verify Pinata API keys and connection
require('dotenv').config();
const pinataSDK = require('@pinata/sdk');

async function testPinataConnection() {
  console.log('Testing Pinata API connection...');
  
  // Check if API keys are set
  const pinataApiKey = process.env.PINATA_API_KEY;
  const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  
  if (!pinataApiKey || !pinataSecretApiKey) {
    console.error('ERROR: Pinata API keys are not set in environment variables');
    console.log('Make sure you have defined PINATA_API_KEY and PINATA_SECRET_API_KEY in your .env file');
    process.exit(1);
  }
  
  console.log('API keys found in environment variables');
  
  try {
    // Initialize Pinata client
    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    
    // Test authentication
    console.log('Testing authentication with Pinata...');
    const response = await pinata.testAuthentication();
    
    if (response.authenticated) {
      console.log('SUCCESS: Successfully authenticated with Pinata!');
      
      // Get pin list to verify account access
      const pinList = await pinata.pinList({
        status: 'pinned',
        pageLimit: 1
      });
      
      console.log(`Account has ${pinList.count} total pins`);
      console.log('Pinata API connection test successful');
    } else {
      console.error('ERROR: Authentication failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('ERROR: Failed to connect to Pinata API');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testPinataConnection(); 