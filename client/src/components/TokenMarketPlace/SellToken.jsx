import { useRef, useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { FaExchangeAlt, FaUnlock } from "react-icons/fa";
import CONTRACTS from "../../constant/contractAddresses";

const SellToken = ({ contractInstance, erc20ContractInstance }) => {
  const sellTokenAmountRef = useRef();
  const approveTokenAmountRef = useRef();
  const [isSelling, setIsSelling] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const sellToken = async (e) => {
    e.preventDefault();
    setIsSelling(true);
    
    try {
      const tokenValueEth = sellTokenAmountRef.current.value;
      const tokenValueWei = ethers.parseEther(tokenValueEth); // Convert ETH to Wei

      // Ensure the contract instance has a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the signer
      const contractWithSigner = contractInstance.connect(signer); // Connect the contract to the signer

      // Call the sellCkToken function
      const tx = await contractWithSigner.sellCkToken(tokenValueWei);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction Receipt:", receipt);
      toast.success("Tokens Sold Successfully");
      sellTokenAmountRef.current.value = "";
    } catch (error) {
      toast.error("Error: Selling Token");
      console.error("Selling Token Error:", error);
    } finally {
      setIsSelling(false);
    }
  };

  const approveToken = async (e) => {
    e.preventDefault();
    setIsApproving(true);
    
    try {
      const tokenValueEth = approveTokenAmountRef.current.value;
      const tokenValueWei = ethers.parseEther(tokenValueEth); // Convert ETH to Wei
      const tokenMarketplace = CONTRACTS.TOKEN_MARKETPLACE_CONTRACT; // Use contract address from constants
      
      console.log("Approve Token Amount in Wei:", tokenValueWei);

      // Ensure the erc20 contract instance has a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the signer
      const erc20ContractWithSigner = erc20ContractInstance.connect(signer); // Connect the contract to the signer

      // Approve token transfer
      const tx = await erc20ContractWithSigner.approve(tokenMarketplace, tokenValueWei);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Approval Receipt:", receipt);
      toast.success("Tokens Approved Successfully");
      approveTokenAmountRef.current.value = "";
    } catch (error) {
      toast.error("Error: Approving Token");
      console.error("Approving Token Error:", error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card-light p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4">
          <FaExchangeAlt className="text-2xl text-accent-300 mr-2" />
          <h2 className="text-xl font-semibold">Sell Tokens</h2>
        </div>
        
        <form onSubmit={sellToken} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount to Sell (ETH)</label>
            <input
              type="text"
              ref={sellTokenAmountRef}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isSelling}
            className={`w-full bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center ${isSelling ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSelling ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Sell Tokens"
            )}
          </button>
        </form>
      </div>

      <div className="card-light p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center mb-4">
          <FaUnlock className="text-2xl text-accent-300 mr-2" />
          <h2 className="text-xl font-semibold">Approve Tokens</h2>
        </div>
        
        <form onSubmit={approveToken} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount to Approve (ETH)</label>
            <input
              type="text"
              ref={approveTokenAmountRef}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isApproving}
            className={`w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center ${isApproving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isApproving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Approve Tokens"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellToken;
