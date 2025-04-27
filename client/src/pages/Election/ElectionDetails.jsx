import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-toastify";
import { BiTimeFive, BiIdCard, BiCheckCircle } from "react-icons/bi";
import { FiUsers } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbCheckbox } from "react-icons/tb";
import Loading from "../../components/Loading";

const ElectionDetails = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { web3State } = useWeb3Context();
  const { contractInstance, account } = web3State;
  
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  
  // Fetch election details
  useEffect(() => {
    const fetchElectionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch election details from contract
        const result = await contractInstance.getElection(electionId, { from: account });
        
        // Format election data
        const formattedElection = {
          id: result.id.toString(),
          title: result.title,
          description: result.description,
          startTime: parseInt(result.startTime) * 1000, // Convert to milliseconds
          endTime: parseInt(result.endTime) * 1000, // Convert to milliseconds
          candidates: result.candidates.map((candidate, index) => ({
            id: index.toString(),
            name: candidate.name,
            party: candidate.party,
            voteCount: parseInt(candidate.voteCount),
          })),
          totalVoters: parseInt(result.totalVoters),
          totalVotes: parseInt(result.totalVotes),
          isActive: result.isActive,
        };
        
        setElection(formattedElection);
        
        // Check if user is registered for this election
        const registrationStatus = await contractInstance.checkVoterRegistration(
          account,
          electionId,
          { from: account }
        );
        setIsRegistered(registrationStatus);
        
        // Check if user has already voted
        const votingStatus = await contractInstance.checkVoterVotingStatus(
          account,
          electionId,
          { from: account }
        );
        setHasVoted(votingStatus);
        
      } catch (error) {
        console.error("Error fetching election details:", error);
        setError("Failed to load election details. Please try again later.");
        toast.error("Failed to load election details");
      } finally {
        setLoading(false);
      }
    };
    
    if (contractInstance && account) {
      fetchElectionDetails();
    }
  }, [contractInstance, account, electionId]);
  
  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().getTime());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time for display
  const formatTimeLeft = (targetTime) => {
    const timeLeft = targetTime - currentTime;
    
    if (timeLeft <= 0) {
      return "Ended";
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Calculate election status
  const getElectionStatus = () => {
    if (!election) return "";
    
    if (currentTime < election.startTime) {
      return "Upcoming";
    } else if (currentTime >= election.startTime && currentTime <= election.endTime) {
      return "Active";
    } else {
      return "Ended";
    }
  };
  
  const handleRegister = async () => {
    try {
      await contractInstance.registerForElection(electionId, { from: account });
      setIsRegistered(true);
      toast.success("Successfully registered for this election!");
    } catch (error) {
      console.error("Error registering for election:", error);
      toast.error("Failed to register for this election");
    }
  };
  
  const handleVote = () => {
    navigate(`/vote/${electionId}`);
  };
  
  const handleViewResults = () => {
    navigate(`/results/${electionId}`);
  };
  
  if (loading) {
    return <Loading message="Loading election details..." />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300">
        <div className="card-light p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300">{error}</p>
          <button
            onClick={() => navigate("/elections")}
            className="mt-6 py-2 px-4 bg-accent-300 hover:bg-accent-100 text-white rounded-lg transition-colors duration-300"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }
  
  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300">
        <div className="card-light p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Election Not Found</h2>
          <p className="text-gray-700 dark:text-gray-300">
            The election you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/elections")}
            className="mt-6 py-2 px-4 bg-accent-300 hover:bg-accent-100 text-white rounded-lg transition-colors duration-300"
          >
            Back to Elections
          </button>
        </div>
      </div>
    );
  }
  
  const electionStatus = getElectionStatus();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/elections")}
            className="flex items-center text-accent-300 hover:text-accent-100 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Elections
          </button>
        </div>
        
        <div className="card-light p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-accent-300 mb-2 md:mb-0">{election.title}</h1>
            
            <div className={`
              inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${electionStatus === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                electionStatus === "Upcoming" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : 
                "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}
            `}>
              {electionStatus}
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-6">{election.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-elevated p-4 flex items-center">
              <BiTimeFive className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Start Time</div>
                <div className="font-medium">{formatDate(election.startTime)}</div>
              </div>
            </div>
            
            <div className="card-elevated p-4 flex items-center">
              <BiTimeFive className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">End Time</div>
                <div className="font-medium">{formatDate(election.endTime)}</div>
              </div>
            </div>
            
            <div className="card-elevated p-4 flex items-center">
              <BiTimeFive className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {electionStatus === "Upcoming" ? "Starts in" : 
                   electionStatus === "Active" ? "Ends in" : 
                   "Ended on"}
                </div>
                <div className="font-medium">
                  {electionStatus === "Upcoming" ? formatTimeLeft(election.startTime) : 
                   electionStatus === "Active" ? formatTimeLeft(election.endTime) : 
                   formatDate(election.endTime)}
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-elevated p-4 flex items-center">
              <FiUsers className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Registered Voters</div>
                <div className="font-medium">{election.totalVoters}</div>
              </div>
            </div>
            
            <div className="card-elevated p-4 flex items-center">
              <TbCheckbox className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Votes Cast</div>
                <div className="font-medium">{election.totalVotes}</div>
              </div>
            </div>
            
            <div className="card-elevated p-4 flex items-center">
              <BiCheckCircle className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Your Status</div>
                <div className="font-medium">
                  {!isRegistered ? "Not Registered" : 
                   hasVoted ? "Voted" : "Registered, Not Voted"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {!isRegistered && electionStatus === "Upcoming" && (
              <button
                onClick={handleRegister}
                className="w-full md:w-auto py-3 px-6 bg-accent-300 hover:bg-accent-100 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
              >
                <BiIdCard className="mr-2" />
                Register for Election
              </button>
            )}
            
            {isRegistered && !hasVoted && electionStatus === "Active" && (
              <button
                onClick={handleVote}
                className="w-full md:w-auto py-3 px-6 bg-accent-300 hover:bg-accent-100 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
              >
                <TbCheckbox className="mr-2" />
                Cast Vote
              </button>
            )}
            
            {(hasVoted || electionStatus === "Ended") && (
              <button
                onClick={handleViewResults}
                className="w-full md:w-auto py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
              >
                <HiOutlineDocumentText className="mr-2" />
                View Results
              </button>
            )}
          </div>
        </div>
        
        <div className="card-light p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6">Candidates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {election.candidates.map((candidate) => (
              <div key={candidate.id} className="card-elevated p-5 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-2">{candidate.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{candidate.party}</p>
                
                {electionStatus === "Ended" && (
                  <div className="mt-auto">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Votes Received</div>
                    <div className="text-xl font-bold text-accent-300">{candidate.voteCount}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetails; 