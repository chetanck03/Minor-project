import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCoins } from "react-icons/fa";

const TokenPrice = ({ contractInstance }) => {
  const [tokenPrice, setTokenPrice] = useState(null); // Initial state set to null for loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        if (!contractInstance) return; // Guard clause to ensure contractInstance is available

        // Fetch the token price directly from the contract
        const price = await contractInstance.tokenPrice();
        const priceEth = ethers.formatEther(price); // Format the price from Wei to Ether
        setTokenPrice(priceEth);
      } catch (error) {
        toast.error("Error: Fetching Token Price");
        console.error(error);
      } finally {
        setLoading(false); // Stop loading once done
      }
    };

    if (contractInstance) {
      fetchTokenPrice(); // Initial fetch of token price
      const intervalId = setInterval(fetchTokenPrice, 3000); // Fetch every 3 seconds

      // Cleanup the interval when the component is unmounted or dependencies change
      return () => clearInterval(intervalId);
    }
  }, [contractInstance]);

  return (
    <div className="card-elevated p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <FaCoins className="text-2xl text-accent-300 mr-2" />
        <h2 className="text-xl font-semibold">Current Token Price</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-2">
          <div className="w-6 h-6 border-4 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <p className="text-2xl font-bold text-center text-accent-300">
          {tokenPrice} ETH
        </p>
      )}
    </div>
  );
};

export default TokenPrice;
