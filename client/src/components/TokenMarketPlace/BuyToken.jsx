import { useRef, useState } from "react";
import { ethers } from "ethers"; // Use ethers for handling Ethereum transactions
import { toast } from "react-hot-toast";
import { FaShoppingCart } from "react-icons/fa";

const BuyToken = ({ contractInstance }) => {
  const buyTokenAmountRef = useRef();
  const [isProcessing, setIsProcessing] = useState(false);

  const buyToken = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const tokenValueEth = buyTokenAmountRef.current.value;

      // Input validation
      if (isNaN(tokenValueEth) || parseFloat(tokenValueEth) <= 0) {
        toast.error("Please enter a valid amount.");
        setIsProcessing(false);
        return;
      }

      const tokenValueWei = ethers.parseEther(tokenValueEth); // Ensure correct conversion
      console.log("Token Value in Wei:", tokenValueWei.toString());

      // Ensure the contract instance has a signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Get the signer
      const contractWithSigner = contractInstance.connect(signer); // Connect the contract to the signer

      // Prepare transaction options
      const tx = await contractWithSigner.buyCkToken(tokenValueWei, {
        value: tokenValueWei, // Set the Ether value sent with the transaction
        gasLimit: 500000, // Try increasing gas limit if needed
      });
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction Receipt:", receipt);

      toast.success("Tokens Purchased Successfully");
      buyTokenAmountRef.current.value = "";
    } catch (error) {
      if (error.reason) {
        toast.error(`Error: ${error.reason}`);
      } else {
        toast.error("Error: Buying Token");
      }
      console.error("Transaction Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card-light p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-6">
        <FaShoppingCart className="text-2xl text-accent-300 mr-2" />
        <h2 className="text-xl font-semibold">Buy Tokens</h2>
      </div>
      
      <form onSubmit={buyToken} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount to Buy (ETH)</label>
          <input
            type="text"
            ref={buyTokenAmountRef}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
            placeholder="Enter amount"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full bg-accent-300 hover:bg-accent-100 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Buy Tokens"
          )}
        </button>
      </form>
    </div>
  );
};

export default BuyToken;
