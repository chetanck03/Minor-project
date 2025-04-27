import { useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { FaBan, FaExclamationTriangle } from "react-icons/fa";

const EmergencyDeclare = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const emergencyStop = async () => {
    try {
      setLoading(true);
      const tx = await contractInstance.StopVoting();
      await tx.wait();
      toast.success("Voting has been stopped!");
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error stopping voting:", error);
      toast.error("Error: Emergency Stop");
      
      if (error.message.includes("Only admin can perform this action")) {
        toast.error("You are not authorized to stop voting");
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
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Emergency Stop Confirmation</h3>
          </div>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            This will immediately stop all voting activity regardless of the voting period. Are you sure you want to proceed?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={emergencyStop}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors duration-300 flex items-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Stopping...
                </>
              ) : (
                <>
                  <FaBan className="mr-2" />
                  Confirm Stop
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
          <FaBan className="mr-2" />
          Emergency Stop Voting
        </button>
      )}
    </div>
  );
};

export default EmergencyDeclare;
