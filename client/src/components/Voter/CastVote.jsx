import { useEffect, useRef, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import toast, { Toaster } from "react-hot-toast";
import { FaVoteYea, FaCoins, FaUser, FaCheckCircle } from "react-icons/fa";
import { ethers } from "ethers";
import erc20abi from "../../constant/erc20Abi.json";
import CONTRACTS from "../../constant/contractAddresses";
import { getImageUrl } from "../../utils/getImageUrl";

const CastVote = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance, selectedAccount, provider } = web3State;
  const voterId = useRef(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  
  // State to manage voting status and timer
  const [votingStatus, setVotingStatus] = useState("Not Started");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for token balance and eligibility
  const [tokenBalance, setTokenBalance] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(true);
  
  // State for candidates
  const [candidates, setCandidates] = useState([]);
  const [candidateImages, setCandidateImages] = useState({});
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [imageLoadingStates, setImageLoadingStates] = useState({});
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  // CK Token contract address from constants
  const ckTokenContractAddress = CONTRACTS.CK_TOKEN_CONTRACT;

  // Check token balance and eligibility
  useEffect(() => {
    const checkTokenBalance = async () => {
      if (!provider || !selectedAccount) {
        setIsBalanceLoading(false);
        return;
      }
      
      try {
        setIsBalanceLoading(true);
        const tokenContract = new ethers.Contract(ckTokenContractAddress, erc20abi, provider);
        const balanceWei = await tokenContract.balanceOf(selectedAccount);
        const balanceEth = ethers.formatEther(balanceWei);
        
        setTokenBalance(balanceEth);
        // Check if balance is at least 1 token
        setIsEligible(parseFloat(balanceEth) >= 1);
      } catch (error) {
        console.error("Error fetching token balance:", error);
        toast.error("Could not check token balance");
      } finally {
        setIsBalanceLoading(false);
      }
    };
    
    checkTokenBalance();
    
    // Set up interval to refresh balance every 30 seconds
    const intervalId = setInterval(checkTokenBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, [provider, selectedAccount]);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!contractInstance) return;

      try {
        setLoadingCandidates(true);
        const candidateList = await contractInstance.getCandidateList();
        
        // Format candidate data
        const formattedCandidates = candidateList.map(candidate => ({
          candidateId: candidate.candidateId.toString(),
          name: candidate.name,
          party: candidate.party,
          candidateAddress: candidate.candidateAddress,
        }));
        
        setCandidates(formattedCandidates);
        
        // Reset image loading states for new candidate list
        const loadingStates = {};
        formattedCandidates.forEach(candidate => {
          loadingStates[candidate.candidateAddress] = true;
        });
        setImageLoadingStates(loadingStates);
        
        // Fetch images for each candidate
        const imagePromises = formattedCandidates.map(async (candidate) => {
          try {
            const ipfsUrl = await getImageUrl(candidate.candidateAddress, 'candidate');
            return { address: candidate.candidateAddress, ipfsUrl };
          } finally {
            // Mark image as loaded regardless of success or failure
            setImageLoadingStates(prev => ({
              ...prev,
              [candidate.candidateAddress]: false
            }));
          }
        });
        
        const imageResults = await Promise.all(imagePromises);
        const imageMap = {};
        imageResults.forEach(result => {
          if (result.ipfsUrl) {
            imageMap[result.address] = result.ipfsUrl;
          }
        });
        
        setCandidateImages(imageMap);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoadingCandidates(false);
      }
    };

    if (contractInstance) {
      fetchCandidates();
    }
  }, [contractInstance]);

  // Handle image load error
  const handleImageError = (address) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [address]: true
    }));
  };

  // Function to render the candidate profile picture
  const renderCandidateImage = (candidate) => {
    const address = candidate.candidateAddress;
    const hasImage = candidateImages[address] && !imageLoadErrors[address];
    const isLoading = imageLoadingStates[address];
    
    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-200 rounded-full border-2 border-accent-300">
          <div className="w-4 h-4 border-2 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (hasImage) {
      return (
        <img
          className="w-full h-full object-cover rounded-full border-2 border-accent-300"
          src={candidateImages[address]}
          alt={`${candidate.name}'s image`}
          onError={() => handleImageError(address)}
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-200 rounded-full border-2 border-accent-300">
        <span className="text-lg font-bold text-accent-300">
          {candidate.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  useEffect(() => {
    const checkVotingPeriod = async () => {
      try {
        // Fetch start and end times from the contract
        const startTimeBigInt = await contractInstance.startTime();
        const endTimeBigInt = await contractInstance.endTime();

        const startTime = Number(startTimeBigInt); // Convert to number
        const endTime = Number(endTimeBigInt); // Convert to number

        // Update voting status and timer
        if (Date.now() / 1000 < startTime) {
          setVotingStatus("Not Started");
          setTimeRemaining(startTime - Math.floor(Date.now() / 1000)); // Time until voting starts
        } else if (Date.now() / 1000 >= startTime && Date.now() / 1000 < endTime) {
          setVotingStatus("In Progress");
          setTimerStarted(true);
          setTimeRemaining(endTime - Math.floor(Date.now() / 1000)); // Time until voting ends
        } else {
          setVotingStatus("Ended");
        }
      } catch (error) {
        console.error("Error fetching voting period:", error);
      }
    };

    if (contractInstance) {
      checkVotingPeriod();
    }
  }, [contractInstance]);

  useEffect(() => {
    let timer;
    if (timerStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(prev - 1, 0)); // Decrease time remaining
      }, 1000);
    } else if (timeRemaining === 0) {
      setTimerStarted(false);
      setVotingStatus("Ended");
    }

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [timerStarted, timeRemaining]);

  const handleCastVote = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const voterID = voterId.current.value;
      
      if (!selectedCandidateId) {
        toast.error("Please select a candidate");
        setIsLoading(false);
        return;
      }

      // Make sure voting is in progress before casting a vote
      if (votingStatus !== "In Progress") {
        toast.error("Voting is not currently active.");
        setIsLoading(false);
        return;
      }
      
      // Check token eligibility
      if (!isEligible) {
        toast.error("You need at least 1 CK Token to vote.");
        setIsLoading(false);
        return;
      }

      await contractInstance.vote(voterID, selectedCandidateId);
      toast.success("Vote cast successfully!");
      
      // Clear the input fields
      voterId.current.value = "";
      setSelectedCandidateId(null);
    } catch (error) {
      console.error("Error casting vote:", error);
      toast.error("Failed to cast vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format time into hours, minutes, and seconds
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hours, minutes, secs };
  };

  const { hours, minutes, secs } = formatTime(timeRemaining);

  const getStatusColor = () => {
    switch (votingStatus) {
      case "In Progress":
        return "text-green-500";
      case "Ended":
        return "text-red-500";
      default:
        return "text-yellow-500";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="card-light p-8 max-w-3xl w-full">
        <div className="flex items-center justify-center mb-6">
          <FaVoteYea className="text-4xl text-accent-300 mr-3" />
          <h1 className="text-3xl font-bold text-center text-accent-300">Cast Your Vote</h1>
        </div>

        {/* Token Balance and Eligibility */}
        <div className="bg-gray-100 dark:bg-dark-100 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-center mb-2">
            <FaCoins className="text-xl text-accent-300 mr-2" />
            <h2 className="text-lg font-semibold">CK Token Balance</h2>
          </div>
          
          {isBalanceLoading ? (
            <div className="flex justify-center p-2">
              <div className="w-5 h-5 border-2 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : selectedAccount ? (
            <>
              <p className="text-center text-xl font-bold mb-2">
                {tokenBalance !== null ? `${parseFloat(tokenBalance).toFixed(2)} CK Tokens` : "Unable to fetch balance"}
              </p>
              <div className={`text-center p-2 rounded font-semibold ${isEligible ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'}`}>
                {isEligible ? 
                  "You are eligible to vote!" : 
                  "You need at least 1 CK Token to vote"}
              </div>
            </>
          ) : (
            <p className="text-center text-orange-500 dark:text-orange-400">
              Please connect your wallet to check eligibility
            </p>
          )}
        </div>

        {/* Voting Status */}
        <div className="text-center mb-6">
          <h2 className="text-lg mb-1">Status:</h2>
          <div className={`text-xl font-bold ${getStatusColor()}`}>
            {votingStatus}
          </div>
        </div>
        
        {/* Timer Display */}
        {timerStarted && (
          <div className="mb-8">
            <h2 className="text-xl text-center text-accent-300 font-bold mb-4">
              Time Remaining:
            </h2>
            <div className="flex justify-center space-x-4">
              <div className="flex flex-col items-center bg-accent-300 p-4 rounded-lg shadow-md">
                <span className="text-xl text-white font-bold">{String(hours).padStart(2, '0')}</span>
                <span className="text-sm text-white">Hours</span>
              </div>
              <div className="flex flex-col items-center bg-accent-300 p-4 rounded-lg shadow-md">
                <span className="text-xl text-white font-bold">{String(minutes).padStart(2, '0')}</span>
                <span className="text-sm text-white">Minutes</span>
              </div>
              <div className="flex flex-col items-center bg-accent-300 p-4 rounded-lg shadow-md">
                <span className="text-xl text-white font-bold">{String(secs).padStart(2, '0')}</span>
                <span className="text-sm text-white">Seconds</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleCastVote} className="space-y-6">
          {/* Voter ID */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Voter ID
            </label>
            <input
              type="text"
              ref={voterId}
              placeholder="Enter your voter ID"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
              required
            />
          </div>

          {/* Candidate Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Select a Candidate
            </label>
            
            {loadingCandidates ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : candidates.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-dark-200 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No candidates available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map((candidate) => (
                  <div 
                    key={candidate.candidateId}
                    onClick={() => setSelectedCandidateId(candidate.candidateId)}
                    className={`card-elevated p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedCandidateId === candidate.candidateId 
                        ? 'border-2 border-accent-300 ring-2 ring-accent-300 ring-opacity-50' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative w-16 h-16 mr-4 overflow-hidden">
                        {renderCandidateImage(candidate)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.party}</p>
                        <div className="text-xs bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded mt-1 inline-block">
                          ID: {candidate.candidateId}
                        </div>
                      </div>
                      
                      {selectedCandidateId === candidate.candidateId && (
                        <div className="ml-2 text-accent-300">
                          <FaCheckCircle size={20} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || votingStatus !== "In Progress" || !selectedCandidateId || !isEligible}
            className={`w-full py-3 rounded-lg font-medium transition-colors duration-300 ${
              isLoading || votingStatus !== "In Progress" || !selectedCandidateId || !isEligible
                ? "bg-gray-300 dark:bg-dark-100 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-accent-300 hover:bg-accent-100 text-white"
            }`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Processing...</span>
              </div>
            ) : (
              "Cast Vote"
            )}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default CastVote;
