import { useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { FaTrophy, FaVoteYea, FaAddressCard } from "react-icons/fa";

const DisplayResult = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [winner, setWinner] = useState({
    id: null,
    name: "No winner declared",
    address: null,
    votes: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getWinner = async () => {
      try {
        setLoading(true);
        const winnerId = await contractInstance.winnerId();
        const winnerName = await contractInstance.winnerName();
        const winnerAddress = await contractInstance.winnerAddress();
        const winnerVotes = await contractInstance.winnerVotes();

        setWinner({
          id: winnerId.toString(),
          name: winnerName,
          address: winnerAddress,
          votes: winnerVotes.toString(),
        });
      } catch (error) {
        toast.error("Error: Getting Winner");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (contractInstance) {
      // Fetch winner immediately and then set interval to fetch every 3 seconds
      getWinner();
      const intervalId = setInterval(getWinner, 3000); // 3000 ms = 3 seconds

      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [contractInstance]);

  return (
    <div className="transition-all duration-300">
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-4 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : winner.id ? (
        <div className="card-elevated p-6 border border-gray-200 dark:border-dark-100 rounded-lg">
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
      ) : (
        <div className="card-elevated p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <FaTrophy className="text-4xl text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No winner declared yet</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayResult;
