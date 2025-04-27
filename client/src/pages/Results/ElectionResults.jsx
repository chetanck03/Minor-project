import { useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast, Toaster } from "react-hot-toast";
import { FaPoll, FaTrophy, FaUserFriends, FaVoteYea, FaAddressCard } from "react-icons/fa";

const ElectionResults = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [winner, setWinner] = useState({
    id: null,
    name: "No winner declared",
    address: null,
    votes: 0,
  });
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsPublished, setResultsPublished] = useState(false);

  useEffect(() => {
    const getResults = async () => {
      if (!contractInstance) return;
      
      try {
        setLoading(true);
        
        // Check if voting has ended (we still need this for the resultsPublished state)
        const votingStatus = await contractInstance.getVotingStatus();
        const votingEnded = votingStatus === 2; // 2 = VotingStatus.Ended
        
        // Always try to get winner information, similar to DisplayResult component
        try {
          const winnerId = await contractInstance.winnerId();
          const winnerName = await contractInstance.winnerName();
          const winnerAddress = await contractInstance.winnerAddress();
          const winnerVotes = await contractInstance.winnerVotes();

          // If we get here, results are available
          setWinner({
            id: winnerId.toString(),
            name: winnerName,
            address: winnerAddress,
            votes: winnerVotes.toString(),
          });
          
          // If winnerId exists and is greater than 0, results have been announced
          const winnerAnnounced = winnerId > 0;
          setResultsPublished(votingEnded && winnerAnnounced);
        } catch (error) {
          console.log("Winner not declared yet");
          setResultsPublished(false);
        }

        // Get all candidates
        const candidateCount = await contractInstance.candidateCount();
        const candidatesArray = [];

        for (let i = 1; i <= candidateCount; i++) {
          const candidate = await contractInstance.getCandidate(i);
          candidatesArray.push({
            id: i,
            name: candidate.name,
            address: candidate.candidateAddress,
            votes: candidate.voteCount.toString(),
          });
        }

        // Sort candidates by votes (highest first)
        candidatesArray.sort((a, b) => parseInt(b.votes) - parseInt(a.votes));
        setCandidates(candidatesArray);
      } catch (error) {
        // toast.error("Error fetching election data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (contractInstance) {
      getResults();
      const intervalId = setInterval(getResults, 5000); // Update every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [contractInstance]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-center mb-6">
          <FaPoll className="text-4xl text-accent-300 mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-center text-accent-300">Election Results</h1>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-accent-300 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">Loading results...</p>
          </div>
        ) : (
          <>
            {/* Winner Section - Always display this section, and it will show appropriate message if no winner yet */}
            <section className="card-light p-8 shadow-md">
              <div className="flex items-center justify-center mb-6">
                <FaTrophy className="text-2xl text-accent-300 mr-2" />
                <h2 className="text-2xl font-semibold text-accent-300">Winner</h2>
              </div>
              
              {winner.id ? (
                <div className="flex flex-col items-center">
                  <div className="card-elevated p-6 w-full max-w-md border-2 border-accent-300">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center mb-4">
                        <FaTrophy className="text-3xl text-accent-300 mr-2" />
                        <h3 className="text-xl font-bold">
                          {winner.name}
                        </h3>
                      </div>
                      
                      <div className="w-full space-y-4 mb-4">
                        <div className="card-elevated p-3 rounded-lg flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">ID:</span>
                          </div>
                          <span className="font-semibold">{winner.id}</span>
                        </div>
                        
                        <div className="card-elevated p-3 rounded-lg flex justify-between items-center">
                          <div className="flex items-center">
                            <FaVoteYea className="text-accent-300 mr-2" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Votes:</span>
                          </div>
                          <span className="font-semibold">{winner.votes}</span>
                        </div>
                      </div>
                      
                      <div className="w-full">
                        <div className="flex items-center mb-1">
                          <FaAddressCard className="text-accent-300 mr-2" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Wallet Address:</span>
                        </div>
                        <div className="text-xs font-mono bg-gray-100 dark:bg-dark-200 p-2 rounded-lg overflow-hidden text-ellipsis break-all">
                          {winner.address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-elevated p-6 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <FaTrophy className="text-4xl text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400">No winner declared yet</p>
                  </div>
                </div>
              )}
            </section>

            {/* All Candidates Results - Only show when results are fully published */}
            {resultsPublished && (
              <section className="card-light p-8 shadow-md">
                <div className="flex items-center justify-center mb-6">
                  <FaUserFriends className="text-2xl text-accent-300 mr-2" />
                  <h2 className="text-2xl font-semibold text-accent-300">All Candidates</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-dark-100 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-dark-200 border-b border-gray-200 dark:border-dark-100">
                        <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400">Rank</th>
                        <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400">Name</th>
                        <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400">Votes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-dark-100">
                      {candidates.map((candidate, index) => (
                        <tr 
                          key={candidate.id} 
                          className={`${winner.id && winner.id === candidate.id.toString() ? "bg-accent-300/10" : ""} hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150`}
                        >
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3 font-medium">{candidate.name}</td>
                          <td className="px-4 py-3">{candidate.votes}</td>
                        </tr>
                      ))}
                      {candidates.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">No candidates found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
};

export default ElectionResults; 