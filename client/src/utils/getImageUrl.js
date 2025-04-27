import axios from 'axios';

/**
 * Validates if a URL is a valid image by checking if it returns an image content type
 * @param {string} url - The URL to validate
 * @returns {Promise<boolean>} - Whether the URL is a valid image
 */
const isValidImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType && contentType.startsWith('image/');
  } catch (error) {
    console.error('Error validating image URL:', error.message);
    return false;
  }
};

/**
 * Fetches the IPFS image URL for a voter or candidate
 * @param {string} address - The wallet address of the voter or candidate
 * @param {string} type - Either 'voter' or 'candidate'
 * @returns {Promise<string|null>} - The IPFS URL or null if not found
 */
export const getImageUrl = async (address, type) => {
  if (!address) return null;
  
  try {
    const endpoint = type === 'voter' ? 'getVoterImage' : 'getCandidateImage';
    
    console.log(`Fetching ${type} image for address: ${address}`);
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/${endpoint}/${address}`
    );
    
    if (response.data && response.data.ipfsUrl) {
      const ipfsUrl = response.data.ipfsUrl;
      console.log(`Found ${type} image: ${ipfsUrl}`);
      
      // Validate if the IPFS URL is accessible and an image
      const isValid = await isValidImageUrl(ipfsUrl);
      if (isValid) {
        return ipfsUrl;
      } else {
        console.log(`${type} image URL is not valid or accessible: ${ipfsUrl}`);
        return null;
      }
    }
    
    console.log(`No ${type} image found for address: ${address}`);
    return null;
  } catch (error) {
    console.error(`Error fetching ${type} image:`, error.message);
    return null;
  }
}; 