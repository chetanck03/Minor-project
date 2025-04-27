import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useWeb3Context } from "../../context/useWeb3Context";
import { FaWallet } from "react-icons/fa";

const TokenBalance = ({ erc20ContractInstance }) => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const [userTokenBalance, setUserTokenBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        setLoading(true);
        if (!selectedAccount) return; // Guard clause to ensure selectedAccount is available
        
        const tokenBalanceWei = await erc20ContractInstance.balanceOf(selectedAccount);
        const tokenBalanceEth = ethers.formatEther(tokenBalanceWei); // Use utils to format
        setUserTokenBalance(tokenBalanceEth);
      } catch (error) {
        toast.error("Error: Getting Token Balance");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (erc20ContractInstance && selectedAccount) {
      fetchTokenBalance(); // Fetch the balance immediately
      const intervalId = setInterval(fetchTokenBalance, 3000); // Fetch every 3 seconds

      // Cleanup the interval when the component is unmounted or dependencies change
      return () => clearInterval(intervalId);
    }
  }, [erc20ContractInstance, selectedAccount]);

  return (
    <div className="card-elevated p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-center mb-4">
        <FaWallet className="text-2xl text-accent-300 mr-2" />
        <h2 className="text-xl font-semibold">Your Token Balance</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-2">
          <div className="w-6 h-6 border-4 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <p className="text-2xl font-bold text-center text-accent-300">
          {userTokenBalance} CK Tokens
        </p>
      )}
    </div>
  );
};

export default TokenBalance;
