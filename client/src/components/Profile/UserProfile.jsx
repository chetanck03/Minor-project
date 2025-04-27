import { useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { FaExternalLinkAlt, FaCopy, FaWallet, FaNetworkWired, FaCheckCircle } from "react-icons/fa";
import erc20abi from "../../constant/erc20Abi.json";
import CONTRACTS from "../../constant/contractAddresses";

const UserProfile = ({ onClose }) => {
  const { web3State, disconnectWallet } = useWeb3Context();
  const { selectedAccount, networkName, provider, contractInstance } = web3State;
  const [userInfo, setUserInfo] = useState(null);
  const [isVoterRegistered, setIsVoterRegistered] = useState(false);
  const [isCandidateRegistered, setIsCandidateRegistered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userTokenBalance, setUserTokenBalance] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Contract addresses from constants
  const votingContractAddress = CONTRACTS.VOTING_CONTRACT;
  const ckTokenContractAddress = CONTRACTS.CK_TOKEN_CONTRACT;
  
  // Etherscan base URL from constants
  const etherscanBaseUrl = CONTRACTS.ETHERSCAN_BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!selectedAccount) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Set basic user info immediately
        setUserInfo({
          address: selectedAccount,
          network: networkName || "Unknown Network",
        });
        
        // Get token balance
        if (provider) {
          try {
            const erc20Contract = new ethers.Contract(ckTokenContractAddress, erc20abi, provider);
            const tokenBalanceWei = await erc20Contract.balanceOf(selectedAccount);
            const tokenBalanceEth = ethers.formatEther(tokenBalanceWei);
            setUserTokenBalance(tokenBalanceEth);
          } catch (error) {
            console.error("Error fetching token balance:", error);
            setUserTokenBalance("0");
          }
        }
        
        // Get voter and candidate information if contract instance is available
        if (contractInstance) {
          try {
            const voter = await contractInstance.getVoter(selectedAccount);
            setIsVoterRegistered(voter.isRegistered);
            setHasVoted(voter.hasVoted);
          } catch (error) {
            console.error("Error fetching voter data:", error);
            setIsVoterRegistered(false);
            setHasVoted(false);
          }
          
          try {
            const candidate = await contractInstance.getCandidate(selectedAccount);
            setIsCandidateRegistered(candidate.isRegistered);
          } catch (error) {
            console.error("Error fetching candidate data:", error);
            setIsCandidateRegistered(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedAccount, contractInstance, provider, networkName]);

  const copyToClipboard = () => {
    if (!selectedAccount) return;
    
    navigator.clipboard.writeText(selectedAccount)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Address copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy address");
      });
  };

  const handleLogout = () => {
    disconnectWallet();
    onClose();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-dark-300 rounded-lg shadow-lg max-w-md w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-accent-300">Your Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
            &times;
          </button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-300"></div>
        </div>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="p-6 bg-white dark:bg-dark-300 rounded-lg shadow-lg max-w-md w-full mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-accent-300">Your Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
            &times;
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <svg 
            className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
            />
          </svg>
          <p className="text-center text-gray-500 dark:text-gray-400">No wallet connected</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-accent-300 hover:bg-accent-100 text-white rounded-lg shadow-md transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-dark-300 rounded-lg shadow-lg max-w-md w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-accent-300">Your Profile</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">
          &times;
        </button>
      </div>
      
      <div className="space-y-5">
        {/* Wallet Address */}
        <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-lg border border-gray-100 dark:border-dark-100">
          <div className="flex items-center mb-2">
            <FaWallet className="text-accent-300 mr-2" />
            <span className="text-sm font-medium">Wallet Address</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-mono break-all">
              {selectedAccount ? `${selectedAccount.slice(0, 8)}...${selectedAccount.slice(-6)}` : 'Not connected'}
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={copyToClipboard}
                className="p-1 text-gray-500 hover:text-accent-300 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <FaCheckCircle className="text-green-500" /> : <FaCopy />}
              </button>
              <a 
                href={`${etherscanBaseUrl}/address/${selectedAccount}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-500 hover:text-accent-300 transition-colors"
                title="View on Etherscan"
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>
        </div>
        
        {/* Network */}
        <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-lg border border-gray-100 dark:border-dark-100">
          <div className="flex items-center mb-2">
            <FaNetworkWired className="text-accent-300 mr-2" />
            <span className="text-sm font-medium">Network</span>
          </div>
          <div className="text-sm">
            {networkName || "Unknown Network"}
          </div>
        </div>
        
        {/* Token Balance */}
        <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-lg border border-gray-100 dark:border-dark-100">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-accent-300 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
            </svg>
            <span className="text-sm font-medium">Token Balance</span>
          </div>
          <div className="text-sm">
            {userTokenBalance !== null ? `${parseFloat(userTokenBalance).toFixed(4)} CK` : 'Loading...'}
          </div>
        </div>
        
        {/* Voting Status */}
        <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-lg border border-gray-100 dark:border-dark-100">
          <div className="flex items-center mb-3">
            <svg className="w-4 h-4 text-accent-300 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            <span className="text-sm font-medium">Voting Status</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isVoterRegistered ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm">Registered Voter</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isCandidateRegistered ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm">Registered Candidate</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${hasVoted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <span className="text-sm">Has Voted</span>
            </div>
          </div>
        </div>
        
        {/* Contract Links */}
        <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-lg border border-gray-100 dark:border-dark-100">
          <div className="flex items-center mb-3">
            <svg className="w-4 h-4 text-accent-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span className="text-sm font-medium">Contract Links</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Voting Contract</span>
              <a 
                href={`${etherscanBaseUrl}/address/${votingContractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-300 hover:text-accent-100 text-sm flex items-center"
              >
                <span className="mr-1">View</span>
                <FaExternalLinkAlt size={12} />
              </a>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Token Contract</span>
              <a 
                href={`${etherscanBaseUrl}/address/${ckTokenContractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-300 hover:text-accent-100 text-sm flex items-center"
              >
                <span className="mr-1">View</span>
                <FaExternalLinkAlt size={12} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300 flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
};

export default UserProfile; 