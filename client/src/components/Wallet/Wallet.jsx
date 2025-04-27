import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import erc20abi from "../../constant/erc20Abi.json";
import { FaExternalLinkAlt } from "react-icons/fa";
import CONTRACTS from "../../constant/contractAddresses";

const HomePage = () => {
  const { handleWallet, disconnectWallet, web3State } = useWeb3Context();
  const { selectedAccount, networkName, provider } = web3State;
  const [userTokenBalance, setUserTokenBalance] = useState(null);
  const [erc20ContractInstance, setErc20ContractInstance] = useState(null);
  const navigateTo = useNavigate();
  
  // Contract addresses from constants
  const votingContractAddress = CONTRACTS.VOTING_CONTRACT;
  const ckTokenContractAddress = CONTRACTS.CK_TOKEN_CONTRACT;
  
  // Etherscan base URL from constants
  const etherscanBaseUrl = CONTRACTS.ETHERSCAN_BASE_URL;

  // Redirect to home after connecting wallet
  useEffect(() => {
    if (selectedAccount) navigateTo('/');
  }, [selectedAccount, navigateTo]);

  // Check for wallet on component mount
  useEffect(() => {
    // Check if ethereum is available in the browser
    if (typeof window.ethereum === 'undefined') {
      console.log("No Ethereum wallet detected");
    }
  }, []);

  // Connect wallet with error handling
  const connectWallet = async () => {
    try {
      // Check if ethereum is available in the browser
      if (typeof window.ethereum === 'undefined') {
        toast.error("No crypto wallet detected. Please install MetaMask or another wallet.", {
          duration: 5000,
        });
        return;
      }
      
      await handleWallet();
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Error connecting wallet. Please try again.");
    }
  };

  // Initialize ERC20 contract when provider is available
  useEffect(() => {
    if (!provider) return;

    const initializeErc20Contract = () => {
      try {
        const contract = new ethers.Contract(ckTokenContractAddress, erc20abi, provider);
        setErc20ContractInstance(contract);
      } catch (error) {
        toast.error("Error initializing ERC20 contract.");
      }
    };

    initializeErc20Contract();
  }, [provider, ckTokenContractAddress]);

  // Fetch token balance when contract instance and account are available
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!erc20ContractInstance || !selectedAccount) return;

      try {
        const tokenBalanceWei = await erc20ContractInstance.balanceOf(selectedAccount);
        const tokenBalanceEth = ethers.formatEther(tokenBalanceWei); 
        setUserTokenBalance(tokenBalanceEth);
      } catch (error) {
        toast.error("Error: Getting Token Balance");
        console.error(error);
      }
    };

    fetchTokenBalance();
  }, [erc20ContractInstance, selectedAccount]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="text-center mb-8 px-4">
        <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
          <span className="text-accent-300">Voting</span> DApp
        </h1>
        <p className="text-md md:text-lg mb-6 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Participate in a transparent and secure voting process powered by blockchain technology. Connect your wallet to get started!
        </p>
        
        {/* Show Connect or Disconnect button based on wallet connection state */}
        <button
          onClick={selectedAccount ? disconnectWallet : connectWallet}
          className={`${
            selectedAccount ? "bg-red-600 hover:bg-red-700" : "bg-accent-300 hover:bg-accent-100"
          } text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-lg transform hover:scale-105`}
        >
          {selectedAccount ? "Disconnect Wallet" : "Connect Wallet"}
        </button>
      </div>

      {/* Display connected wallet information if an account is connected */}
      {selectedAccount && (
        <div className="card-light p-6 text-center transition transform hover:scale-105 max-w-md w-full mx-4">
          <p className="mt-2 text-xl font-semibold text-accent-300">Account Address:</p>
          <p className="mt-1 text-lg font-mono break-all">{selectedAccount}</p>
          <p className="mt-4 text-xl font-semibold text-accent-300">Blockchain:</p>
          <p className="mt-1 text-lg font-mono">{networkName}</p>

          {/* Display CKToken Balance */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-accent-300">Token Balance:</h3>
            <p className="mt-2 text-lg font-mono">
              {userTokenBalance !== null ? `${userTokenBalance} Ck Token` : "Loading..."}
            </p>
          </div>
        </div>
      )}

      {/* Contract Transparency Section */}
      <div className="max-w-4xl mx-auto px-4 mt-8 mb-8 w-full">
        <div className="card-light p-6 md:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-dark-100">
          <div className="flex items-center justify-center mb-6">
            <svg className="w-6 h-6 mr-2 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-3xl font-semibold text-accent-300">Contract Transparency</h2>
          </div>
          
          <div className="space-y-6">
            {/* Voting Contract Address Card */}
            <div className="bg-white dark:bg-dark-200 p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              <p className="text-xl font-semibold text-accent-300 mb-3">Voting Contract Address:</p>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mt-2 bg-gray-50 dark:bg-dark-100 p-3 rounded-lg border border-gray-100 dark:border-dark-300">
                <p className="text-sm md:text-md font-mono break-all mb-2 sm:mb-0">{votingContractAddress}</p>
                <a 
                  href={`${etherscanBaseUrl}/address/${votingContractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-accent-300 text-white px-3 py-1 rounded-md hover:bg-accent-100 transition-colors duration-200 ml-0 sm:ml-2"
                  title="View on Etherscan"
                >
                  <span className="mr-1">View</span>
                  <FaExternalLinkAlt size={12} />
                </a>
              </div>
            </div>
            
            {/* CK Token Contract Address Card */}
            <div className="bg-white dark:bg-dark-200 p-4 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
              <p className="text-xl font-semibold text-accent-300 mb-3">CK Token Contract Address:</p>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mt-2 bg-gray-50 dark:bg-dark-100 p-3 rounded-lg border border-gray-100 dark:border-dark-300">
                <p className="text-sm md:text-md font-mono break-all mb-2 sm:mb-0">{ckTokenContractAddress}</p>
                <a 
                  href={`${etherscanBaseUrl}/address/${ckTokenContractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-accent-300 text-white px-3 py-1 rounded-md hover:bg-accent-100 transition-colors duration-200 ml-0 sm:ml-2"
                  title="View on Etherscan"
                >
                  <span className="mr-1">View</span>
                  <FaExternalLinkAlt size={12} />
                </a>
              </div>
            </div>
            
            {/* Contract Action Links Section */}
            <div className="mt-6">
              <p className="text-xl font-semibold text-accent-300 mb-4 text-center">Voting Contract Actions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a 
                  href={`${etherscanBaseUrl}/address/${votingContractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-dark p-4 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:bg-accent-300 hover:text-white hover:scale-102 border border-transparent hover:border-accent-100"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View Contract</span>
                  <FaExternalLinkAlt className="ml-2" size={12} />
                </a>
                <a 
                  href={`${etherscanBaseUrl}/address/${votingContractAddress}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-dark p-4 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:bg-accent-300 hover:text-white hover:scale-102 border border-transparent hover:border-accent-100"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>View Contract Code</span>
                  <FaExternalLinkAlt className="ml-2" size={12} />
                </a>
                <a 
                  href={`${etherscanBaseUrl}/address/${votingContractAddress}#writeContract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-dark p-4 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:bg-accent-300 hover:text-white hover:scale-102 border border-transparent hover:border-accent-100"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Write Contract</span>
                  <FaExternalLinkAlt className="ml-2" size={12} />
                </a>
                <a 
                  href={`${etherscanBaseUrl}/address/${votingContractAddress}#readContract`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-dark p-4 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:bg-accent-300 hover:text-white hover:scale-102 border border-transparent hover:border-accent-100"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Read Contract</span>
                  <FaExternalLinkAlt className="ml-2" size={12} />
                </a>
              </div>
            </div>
            
            <div className="mt-4">
              <a 
                href={`${etherscanBaseUrl}/address/${votingContractAddress}#events`}
                target="_blank"
                rel="noopener noreferrer"
                className="card-dark block p-4 rounded-lg flex items-center justify-center bg-gray-800 dark:bg-dark-300 text-white transform transition-all duration-300 hover:bg-accent-300 hover:scale-102"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>View All Transactions & Events</span>
                <FaExternalLinkAlt className="ml-2" size={12} />
              </a>
            </div>

            {/* CK Token Links */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-dark-100">
              <p className="text-xl font-semibold text-accent-300 mb-4 text-center">CK Token Contract Links:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a 
                  href={`${etherscanBaseUrl}/address/${ckTokenContractAddress}#code`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-dark p-4 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:bg-accent-300 hover:text-white hover:scale-102 border border-transparent hover:border-accent-100"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <span>Token Contract Code</span>
                  <FaExternalLinkAlt className="ml-2" size={12} />
                </a>
                <a 
                  href={`${etherscanBaseUrl}/token/${ckTokenContractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-dark p-4 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:bg-accent-300 hover:text-white hover:scale-102 border border-transparent hover:border-accent-100"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Token Holders & Info</span>
                  <FaExternalLinkAlt className="ml-2" size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <h2 className="text-3xl font-semibold mb-6 text-accent-300 text-center">How It Works</h2>
        <ol className="space-y-4 grid md:grid-cols-2 gap-4 md:space-y-0">
          <li className="card-light p-5 transform transition duration-300 hover:scale-105">
            <span className="text-accent-300 text-xl font-bold mr-2">1.</span> 
            <span className="font-medium">Connect your wallet to the dApp.</span>
          </li>
          <li className="card-light p-5 transform transition duration-300 hover:scale-105">
            <span className="text-accent-300 text-xl font-bold mr-2">2.</span> 
            <span className="font-medium">Buy CKTokens from the <button onClick={() => navigateTo("/token-marketplace")} className="text-accent-300 underline hover:text-accent-100">Token Marketplace</button> if you don't have any.</span>
          </li>
          <li className="card-light p-5 transform transition duration-300 hover:scale-105">
            <span className="text-accent-300 text-xl font-bold mr-2">3.</span> 
            <span className="font-medium">Participate in voting only if you hold CKTokens.</span>
          </li>
          <li className="card-light p-5 transform transition duration-300 hover:scale-105">
            <span className="text-accent-300 text-xl font-bold mr-2">4.</span> 
            <span className="font-medium">View results and track the election status transparently.</span>
          </li>
        </ol>
      </div>

      {/* Security Information Box */}
      <div className="mb-12 w-full max-w-4xl px-4">
        <h2 className="text-3xl text-accent-300 mt-12 font-bold text-center mb-6">Security & Safety</h2>
        <div className="card-light p-6 text-gray-700 dark:text-white mx-auto">
          <p className="text-lg mb-4">
            Your wallet connection is secure and safe. Here are some important points to ensure your safety:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>All transactions are processed on the Ethereum blockchain, ensuring transparency and security.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>We do not store your private keys or sensitive information.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Ensure you're using a trusted wallet and always verify the website URL.</span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Keep your wallet recovery phrases and private keys safe and private.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
