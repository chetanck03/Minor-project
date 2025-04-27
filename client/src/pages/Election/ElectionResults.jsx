import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-toastify";
import { FiUsers } from "react-icons/fi";
import { BiTimeFive, BiTrophy } from "react-icons/bi";
import { HiOutlineDocumentReport } from "react-icons/hi";
import Loading from "../../components/Loading";
import { Toaster } from "react-hot-toast";

const ElectionResults = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { web3State } = useWeb3Context();
  const { contractInstance, account } = web3State;
  
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch election results
  useEffect(() => {
    const fetchElectionResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch election details from contract
        const result = await contractInstance.getElection(electionId, { from: account });
        
        // Format election data
        const candidates = result.candidates.map((candidate, index) => ({
          id: index.toString(),
          name: candidate.name,
          party: candidate.party,
          voteCount: parseInt(candidate.voteCount),
        }));
        
        // Sort candidates by vote count (descending)
        candidates.sort((a, b) => b.voteCount - a.voteCount);
        
        // Calculate total votes and percentages
        const totalVotes = parseInt(result.totalVotes);
        
        candidates.forEach(candidate => {
          candidate.percentage = totalVotes > 0 
            ? ((candidate.voteCount / totalVotes) * 100).toFixed(2)
            : "0.00";
        });
        
        const formattedElection = {
          id: result.id.toString(),
          title: result.title,
          description: result.description,
          startTime: parseInt(result.startTime) * 1000, // Convert to milliseconds
          endTime: parseInt(result.endTime) * 1000, // Convert to milliseconds
          candidates: candidates,
          totalVoters: parseInt(result.totalVoters),
          totalVotes: totalVotes,
          isActive: result.isActive,
          participation: result.totalVoters > 0 
            ? ((totalVotes / parseInt(result.totalVoters)) * 100).toFixed(2)
            : "0.00",
        };
        
        setElection(formattedElection);
        
      } catch (error) {
        console.error("Error fetching election results:", error);
        setError("Failed to load election results. Please try again later.");
        toast.error("Failed to load election results");
      } finally {
        setLoading(false);
      }
    };
    
    if (contractInstance && account) {
      fetchElectionResults();
    }
  }, [contractInstance, account, electionId]);
  
  // Format date for display
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Get election status
  const getElectionStatus = () => {
    if (!election) return "";
    
    const now = new Date().getTime();
    
    if (now < election.startTime) {
      return "Upcoming";
    } else if (now >= election.startTime && now <= election.endTime) {
      return "Active";
    } else {
      return "Ended";
    }
  };
  
  // Calculate color based on vote percentage
  const getColorClass = (percentage) => {
    const percent = parseFloat(percentage);
    if (percent >= 50) return "bg-accent-300";
    if (percent >= 30) return "bg-blue-500";
    if (percent >= 15) return "bg-yellow-500";
    return "bg-gray-500";
  };
  
  if (loading) {
    return <Loading message="Loading election results..." />;
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
  const winner = election.candidates.length > 0 ? election.candidates[0] : null;
  const isElectionOver = electionStatus === "Ended";
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/election/${electionId}`)}
            className="flex items-center text-accent-300 hover:text-accent-100 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Election Details
          </button>
        </div>
        
        <div className="card-light p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-accent-300 mb-2 md:mb-0">Election Results</h1>
            
            <div className={`
              inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${electionStatus === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : 
                electionStatus === "Upcoming" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : 
                "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}
            `}>
              {electionStatus}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">{election.title}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{election.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card-elevated p-4 flex items-center rounded-lg">
              <BiTimeFive className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Start Time</div>
                <div className="font-medium">{formatDate(election.startTime)}</div>
              </div>
            </div>
            
            <div className="card-elevated p-4 flex items-center rounded-lg">
              <BiTimeFive className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">End Time</div>
                <div className="font-medium">{formatDate(election.endTime)}</div>
              </div>
            </div>
            
            <div className="card-elevated p-4 flex items-center rounded-lg">
              <FiUsers className="w-6 h-6 text-accent-300 mr-3" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Participation</div>
                <div className="font-medium">
                  {election.participation}% ({election.totalVotes} of {election.totalVoters})
                </div>
              </div>
            </div>
          </div>
          
          {isElectionOver && winner && (
            <div className="card-elevated border-2 border-accent-300 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex items-center justify-center bg-accent-300/20 rounded-full p-4 mb-4 md:mb-0 md:mr-6">
                  <BiTrophy className="w-10 h-10 text-accent-300" />
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-lg text-accent-300 font-medium mb-1">Winner</h4>
                  <h3 className="text-2xl font-bold mb-1">{winner.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-2">{winner.party}</p>
                  <div className="flex items-center justify-center md:justify-start">
                    <span className="font-bold text-accent-300 mr-2">{winner.voteCount} votes</span>
                    <span className="text-gray-500 dark:text-gray-400">({winner.percentage}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Detailed Results Section */}
        <div className="card-light p-6 md:p-8 mb-8 shadow-md">
          <div className="flex items-center mb-6">
            <HiOutlineDocumentReport className="w-6 h-6 text-accent-300 mr-2" />
            <h2 className="text-2xl font-bold text-accent-300">Detailed Results</h2>
          </div>
          
          <div className="space-y-6">
            {election.candidates.map((candidate, index) => (
              <div key={candidate.id} className="card-elevated p-5 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center">
                      {index === 0 && isElectionOver && (
                        <BiTrophy className="w-5 h-5 text-accent-300 mr-2" />
                      )}
                      <h4 className="text-xl font-semibold">{candidate.name}</h4>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{candidate.party}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-lg mr-2">{candidate.voteCount}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">votes ({candidate.percentage}%)</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-dark-200 rounded-full h-2.5">
                  <div 
                    className={`${getColorClass(candidate.percentage)} h-2.5 rounded-full`} 
                    style={{ width: `${Math.max(3, candidate.percentage)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            {election.candidates.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No candidates found for this election.
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default ElectionResults; 