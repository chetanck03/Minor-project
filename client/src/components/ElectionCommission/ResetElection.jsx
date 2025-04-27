import { useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { FaTrashAlt, FaExclamationTriangle } from "react-icons/fa";

const ResetElection = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleResetElection = async () => {
    try {
      setLoading(true);
      const tx = await contractInstance.resetElection();
      await tx.wait();
      toast.success("Election has been reset successfully!");
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error resetting election:", error);
      toast.error("Failed to reset election");
      
      if (error.message.includes("Only admin can perform this action")) {
        toast.error("You are not authorized to reset the election");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {showConfirmation ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-300 dark:border-red-700">
          <div className="flex items-center mb-3">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Reset Election Confirmation</h3>
          </div>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            This will reset all election data in the smart contract including candidates, votes, and voting status. This action cannot be undone!
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleResetElection}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors duration-300 flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <FaTrashAlt className="mr-2" />
                  Confirm Reset
                </>
              )}
            </button>
            <button
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-lg transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowConfirmation(true)} 
          className="px-4 py-2 w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-lg transition-colors duration-300 flex items-center justify-center"
        >
          <FaTrashAlt className="mr-2" />
          Reset Election
        </button>
      )}
    </div>
  );
};

export default ResetElection; 