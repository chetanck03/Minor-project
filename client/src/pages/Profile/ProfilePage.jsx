import { useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";
import { FaExternalLinkAlt, FaCopy, FaWallet, FaNetworkWired, FaCheckCircle, FaIdCard, FaUser, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import erc20abi from "../../constant/erc20Abi.json";
import CONTRACTS from "../../constant/contractAddresses";

// Function to map gender value to string
const getGenderString = (genderValue) => {
  switch (genderValue) {
    case "0":
      return "Not Specified";
    case "1":
      return "Male";
    case "2":
      return "Female";
    case "3":
      return "Other";
    default:
      return "Unknown";
  }
};

const ProfilePage = () => {
  const { web3State, disconnectWallet } = useWeb3Context();
  const { selectedAccount, networkName, provider, contractInstance } = web3State;
  const [userInfo, setUserInfo] = useState(null);
  const [voterInfo, setVoterInfo] = useState(null);
  const [candidateInfo, setCandidateInfo] = useState(null);
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
            // Get all voters from contract
            const voters = await contractInstance.getVoterList();
            
            // Find voter by address
            const foundVoter = voters.find(v => 
              v.voterAddress.toLowerCase() === selectedAccount.toLowerCase()
            );
            
            if (foundVoter) {
              const voter = {
                voterId: foundVoter.voterId.toString(),
                name: foundVoter.name,
                age: foundVoter.age.toString(),
                gender: foundVoter.gender.toString(),
                voterCandidateId: foundVoter.voterCandidateId.toString(),
                voterAddress: foundVoter.voterAddress
              };
              
              setVoterInfo(voter);
              setIsVoterRegistered(true);
              setHasVoted(voter.voterCandidateId !== "0");
            } else {
              setVoterInfo(null);
              setIsVoterRegistered(false);
              setHasVoted(false);
            }
          } catch (error) {
            console.error("Error fetching voter data:", error);
            setVoterInfo(null);
            setIsVoterRegistered(false);
            setHasVoted(false);
          }
          
          try {
            // Get all candidates from contract
            const candidates = await contractInstance.getCandidateList();
            
            // Find candidate by address
            const foundCandidate = candidates.find(c => 
              c.candidateAddress.toLowerCase() === selectedAccount.toLowerCase()
            );
            
            if (foundCandidate) {
              const candidate = {
                candidateId: foundCandidate.candidateId.toString(),
                name: foundCandidate.name,
                party: foundCandidate.party,
                age: foundCandidate.age.toString(),
                gender: foundCandidate.gender.toString(),
                votes: foundCandidate.votes.toString(),
                candidateAddress: foundCandidate.candidateAddress
              };
              
              setCandidateInfo(candidate);
              setIsCandidateRegistered(true);
            } else {
              setCandidateInfo(null);
              setIsCandidateRegistered(false);
            }
          } catch (error) {
            console.error("Error fetching candidate data:", error);
            setCandidateInfo(null);
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
  
  const handleDisconnect = () => {
    disconnectWallet();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-300"></div>
        </div>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-dark-300 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <svg 
              className="h-24 w-24 text-gray-400 dark:text-gray-600 mx-auto mb-6" 
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
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">No Wallet Connected</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You need to connect your wallet to view your profile.</p>
            <Link to="/" className="inline-block bg-accent-300 hover:bg-accent-100 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
              Return to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-accent-300 mb-2">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your information on Voting DApp</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Left Column - Account Details */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-dark-100">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Account Details</h2>
              
              {/* Wallet Address */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <FaWallet className="text-accent-300 mr-2" />
                  <span className="text-sm font-medium">Wallet Address</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
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
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <FaNetworkWired className="text-accent-300 mr-2" />
                  <span className="text-sm font-medium">Network</span>
                </div>
                <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  {networkName || "Unknown Network"}
                </div>
              </div>
              
              {/* Token Balance */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-accent-300 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm font-medium">Token Balance</span>
                </div>
                <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  {userTokenBalance !== null ? `${parseFloat(userTokenBalance).toFixed(4)} CK` : 'Loading...'}
                </div>
              </div>
              
              {/* Contract Links */}
              <div>
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-accent-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm font-medium">Contract Links</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
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
                  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
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
              
              {/* Disconnect Button */}
              <button
                onClick={handleDisconnect}
                className="w-full mt-6 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300 flex items-center justify-center"
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
        </div>
        
        {/* Middle Column - Voter Information */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-lg overflow-hidden h-full">
            <div className="p-6 border-b border-gray-200 dark:border-dark-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Voter Information</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isVoterRegistered ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {isVoterRegistered ? 'Registered' : 'Not Registered'}
                </div>
              </div>
              
              {isVoterRegistered && voterInfo ? (
                <div className="space-y-5">
                  {/* Voter ID */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaIdCard className="text-accent-300 mr-2" />
                      <span className="text-sm font-medium">Voter ID</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {voterInfo.voterId ? voterInfo.voterId.toString() : 'N/A'}
                    </div>
                  </div>
                  
                  {/* Voter Name */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaUser className="text-accent-300 mr-2" />
                      <span className="text-sm font-medium">Name</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {voterInfo.name || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Voter Age */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-accent-300 mr-2" />
                      <span className="text-sm font-medium">Age</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {voterInfo.age ? voterInfo.age.toString() : 'N/A'}
                    </div>
                  </div>
                  
                  {/* Voting Status */}
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-accent-300 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-sm font-medium">Has Voted</span>
                    </div>
                    <div className={`text-sm py-2 px-3 rounded-lg flex items-center ${hasVoted ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      <div className={`w-3 h-3 rounded-full mr-2 ${hasVoted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      {hasVoted ? 'You have voted in this election' : 'You have not voted yet'}
                    </div>
                  </div>
                  
                  {voterInfo.votedCandidate && hasVoted && (
                    <div>
                      <div className="flex items-center mb-2">
                        <FaUser className="text-accent-300 mr-2" />
                        <span className="text-sm font-medium">Voted For</span>
                      </div>
                      <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                        Candidate #{voterInfo.votedCandidate.toString()}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <svg 
                    className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You are not registered as a voter.</p>
                  <Link
                    to="/register-voter"
                    className="inline-block bg-accent-300 hover:bg-accent-100 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    Register as Voter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Candidate Information */}
        <div className="col-span-1">
          <div className="bg-white dark:bg-dark-300 rounded-lg shadow-lg overflow-hidden h-full">
            <div className="p-6 border-b border-gray-200 dark:border-dark-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Candidate Information</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isCandidateRegistered ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {isCandidateRegistered ? 'Registered' : 'Not Registered'}
                </div>
              </div>
              
              {isCandidateRegistered && candidateInfo ? (
                <div className="space-y-5">
                  {/* Candidate ID */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaIdCard className="text-accent-300 mr-2" />
                      <span className="text-sm font-medium">Candidate ID</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {candidateInfo.candidateId ? candidateInfo.candidateId.toString() : 'N/A'}
                    </div>
                  </div>
                  
                  {/* Candidate Name */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaUser className="text-accent-300 mr-2" />
                      <span className="text-sm font-medium">Name</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {candidateInfo.name || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Candidate Age */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-accent-300 mr-2" />
                      <span className="text-sm font-medium">Age</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {candidateInfo.age ? candidateInfo.age.toString() : 'N/A'}
                    </div>
                  </div>
                  
                  {/* Candidate Party */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaFileAlt className="text-accent-300 mr-2" />
                      <span className="text-sm font-medium">Party</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {candidateInfo.party || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Candidate Vote Count */}
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-accent-300 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span className="text-sm font-medium">Vote Count</span>
                    </div>
                    <div className="text-sm py-2 px-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                      {candidateInfo.voteCount ? candidateInfo.voteCount.toString() : '0'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <svg 
                    className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You are not registered as a candidate.</p>
                  <Link
                    to="/register-candidate"
                    className="inline-block bg-accent-300 hover:bg-accent-100 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    Register as Candidate
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 