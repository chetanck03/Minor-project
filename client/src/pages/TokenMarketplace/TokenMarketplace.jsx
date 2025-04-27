import { useWeb3Context } from "../../context/useWeb3Context";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import BuyToken from "../../components/TokenMarketPlace/BuyToken";
import SellToken from "../../components/TokenMarketPlace/SellToken";
import TokenBalance from "../../components/TokenMarketPlace/TokenBalance";
import TokenPrice from "../../components/TokenMarketPlace/TokenPrice";
import { toast } from "react-hot-toast";
import tokenMarketplaceAbi from "../../constant/tokenMarketplaceAbi.json";
import erc20abi from "../../constant/erc20Abi.json";
import CONTRACTS from "../../constant/contractAddresses";

const TokenMarketplace = () => {
  const [tokenMarketplaceInstance, setTokenMarketplaceInstance] = useState(null);
  const [erc20ContractInstance, setErc20ContractInstance] = useState(null);
  const { web3State } = useWeb3Context();
  const { signer, provider } = web3State;

  useEffect(() => {
    const erc20TokenInit = () => {
      try {
        const erc20ContractInstance = new ethers.Contract(CONTRACTS.CK_TOKEN_CONTRACT, erc20abi, provider);
        setErc20ContractInstance(erc20ContractInstance);
      } catch (error) {
        toast.error("Error initializing ERC20 contract.");
      }
    };
    provider && erc20TokenInit();
  }, [provider]);

  useEffect(() => {
    const tokenMarketplaceInit = () => {
      try {
        const tokenMarketplaceInstance = new ethers.Contract(CONTRACTS.TOKEN_MARKETPLACE_CONTRACT, tokenMarketplaceAbi, signer);
        setTokenMarketplaceInstance(tokenMarketplaceInstance);
      } catch (error) {
        toast.error("Error initializing Token Marketplace.");
        console.error(error);
      }
    };
    signer && tokenMarketplaceInit();
  }, [signer]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white p-6 transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-accent-300">Token Marketplace</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Interactive Components */}
          <div className="card-light p-6 space-y-6 h-full">
            <h2 className="text-2xl font-semibold text-accent-300 mb-4">Trade Tokens</h2>
            <TokenBalance erc20ContractInstance={erc20ContractInstance} />
            <TokenPrice contractInstance={tokenMarketplaceInstance} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <BuyToken contractInstance={tokenMarketplaceInstance} />
              <SellToken erc20ContractInstance={erc20ContractInstance} contractInstance={tokenMarketplaceInstance} />
            </div>
          </div>

          {/* How It Works Section */}
          <div className="card-light p-6 h-full">
            <h2 className="text-2xl font-semibold text-accent-300 mb-4">How It Works</h2>
            <ol className="space-y-3">
              <li className="card-elevated p-4 flex">
                <span className="text-accent-300 text-xl font-bold mr-3 flex-shrink-0">1.</span>
                <span>Connect your wallet to the dApp.</span>
              </li>
              <li className="card-elevated p-4 flex">
                <span className="text-accent-300 text-xl font-bold mr-3 flex-shrink-0">2.</span>
                <span>Check your CkToken balance before making any transactions.</span>
              </li>
              <li className="card-elevated p-4 flex">
                <span className="text-accent-300 text-xl font-bold mr-3 flex-shrink-0">3.</span>
                <span>Buy CkTokens from the marketplace if you don't have any.</span>
              </li>
              <li className="card-elevated p-4 flex">
                <span className="text-accent-300 text-xl font-bold mr-3 flex-shrink-0">4.</span>
                <span>Sell your CkTokens back to the marketplace if needed.</span>
              </li>
              <li className="card-elevated p-4 flex">
                <span className="text-accent-300 text-xl font-bold mr-3 flex-shrink-0">5.</span>
                <span>Track your transactions, including purchases and sales.</span>
              </li>
              <li className="card-elevated p-4 flex">
                <span className="text-accent-300 text-xl font-bold mr-3 flex-shrink-0">6.</span>
                <span>Withdraw excess tokens or Ether if you are the owner of the contract.</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Security Information */}
        <div className="card-light p-6 mb-8 w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-accent-300 mb-4 text-center">Security Information</h2>
          <div className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">All transactions on the Token Marketplace are securely processed on the Ethereum blockchain, providing complete transparency and security.</p>
            <div className="flex items-start mt-2">
              <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p>The token price adjusts automatically based on market demand, ensuring fair value for all users.</p>
            </div>
            <div className="flex items-start mt-2">
              <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p>Our smart contracts have been thoroughly audited to ensure they're secure and function as expected.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenMarketplace;
