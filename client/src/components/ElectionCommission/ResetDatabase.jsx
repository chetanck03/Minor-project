import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaTrash, FaExclamationTriangle, FaDatabase, FaSpinner } from "react-icons/fa";
import axios from "axios";

const ResetDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [dbStats, setDbStats] = useState({ voters: 0, candidates: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    fetchDatabaseStats();
  }, []);
  
  const fetchDatabaseStats = async () => {
    try {
      setLoadingStats(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/admin/database-stats`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        setDbStats(response.data.stats);
      } else {
        toast.error("Failed to load database statistics");
      }
    } catch (error) {
      console.error("Error fetching database stats:", error);
      toast.error("Failed to load database statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      setLoading(true);
      
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/admin/reset-database`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        const { voters, candidates } = response.data.deleted;
        toast.success(`Database reset successfully! Deleted ${voters} voter(s) and ${candidates} candidate(s)`);
        setShowConfirmation(false);
        
        // Update stats after reset
        fetchDatabaseStats();
      } else {
        toast.error("Failed to reset database");
      }
    } catch (error) {
      console.error("Error resetting database:", error);
      toast.error("Failed to reset database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Database Stats */}
      <div className="bg-white dark:bg-dark-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaDatabase className="text-accent-300 mr-2" />
          Database Statistics
        </h3>
        
        {loadingStats ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-accent-300 text-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-dark-200 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Voters</p>
              <p className="text-2xl font-bold text-accent-300">{dbStats.voters}</p>
            </div>
            
            <div className="bg-gray-100 dark:bg-dark-200 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">Candidates</p>
              <p className="text-2xl font-bold text-accent-300">{dbStats.candidates}</p>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchDatabaseStats}
            disabled={loadingStats}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-dark-300 hover:bg-gray-300 dark:hover:bg-dark-400 rounded-md transition-colors duration-300 flex items-center"
          >
            {loadingStats ? <FaSpinner className="animate-spin mr-1" /> : "Refresh"}
          </button>
        </div>
      </div>

      {/* Reset Database */}
      {showConfirmation ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-300 dark:border-red-700">
          <div className="flex items-center mb-3">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Warning: This action cannot be undone!</h3>
          </div>
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
            Resetting the database will remove all voter and candidate images from MongoDB. This will break image display functionality until users re-register.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleResetDatabase}
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
                  <FaTrash className="mr-2" />
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
          className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center"
        >
          <FaTrash className="mr-2" />
          Reset MongoDB Database
        </button>
      )}
    </div>
  );
};

export default ResetDatabase; 