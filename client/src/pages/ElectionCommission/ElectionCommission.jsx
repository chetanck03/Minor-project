import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnnounceWinner from "../../components/ElectionCommission/AnnounceWinner";
import DisplayResult from "../../components/ElectionCommission/DisplayResult";
import EmergencyDeclare from "../../components/ElectionCommission/EmergencyDeclare";
import VotingStatus from "../../components/ElectionCommission/VotingStatus";
import VotingTimePeriod from "../../components/ElectionCommission/VotingTimePeriod";
import ResetElection from "../../components/ElectionCommission/ResetElection";
import ResetDatabase from "../../components/ElectionCommission/ResetDatabase";
import AdminManagement from "../../components/ElectionCommission/AdminManagement";
import { useWeb3Context } from "../../context/useWeb3Context";
import { 
  FaUserShield, 
  FaClock, 
  FaTrophy, 
  FaVoteYea, 
  FaExclamationTriangle, 
  FaCheck,
  FaTrash,
  FaUsers
} from "react-icons/fa";
import { Toaster } from "react-hot-toast";

const ElectionCommission = () => {
  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();
  const { web3State } = useWeb3Context();
  const [authorized, setAuthorized] = useState(false);
  const AUTHORIZED_ADDRESS = "0x00912Bf03a1d1768C8c256649a805089b672Ac31";

  useEffect(() => {
    if (!token) {
      navigateTo("/");
      return;
    }

    // Check if the connected wallet matches the authorized address
    if (web3State.selectedAccount && 
        web3State.selectedAccount.toLowerCase() === AUTHORIZED_ADDRESS.toLowerCase()) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      navigateTo("/");
    }
  }, [navigateTo, token, web3State.selectedAccount]);

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-center mb-6">
          <FaUserShield className="text-4xl text-accent-300 mr-3" />
          <h1 className="text-3xl md:text-4xl font-bold text-center text-accent-300">Election Commission</h1>
        </div>

        {/* Voting Status */}
        <section className="card-light p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FaVoteYea className="text-xl text-accent-300 mr-2" />
            <h2 className="text-xl font-semibold text-accent-300">Voting Status</h2>
          </div>
          <VotingStatus />
        </section>

        {/* Display Results */}
        <section className="card-light p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FaCheck className="text-xl text-accent-300 mr-2" />
            <h2 className="text-xl font-semibold text-accent-300">Display Results</h2>
          </div>
          <DisplayResult />
        </section>

        {/* Voting Time Period */}
        <section className="card-light p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FaClock className="text-xl text-accent-300 mr-2" />
            <h2 className="text-xl font-semibold text-accent-300">Set Voting Time Period</h2>
          </div>
          <VotingTimePeriod />
        </section>

        {/* Announce Winner */}
        <section className="card-light p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FaTrophy className="text-xl text-accent-300 mr-2" />
            <h2 className="text-xl font-semibold text-accent-300">Announce Winner</h2>
          </div>
          <AnnounceWinner />
        </section>

        {/* Emergency Declare */}
        <section className="card-light p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FaExclamationTriangle className="text-xl text-accent-300 mr-2" />
            <h2 className="text-xl font-semibold text-accent-300">Emergency Declare</h2>
          </div>
          <EmergencyDeclare />
        </section>
        
        {/* Admin Management */}
        {/* <section className="card-light p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FaUsers className="text-xl text-accent-300 mr-2" />
            <h2 className="text-xl font-semibold text-accent-300">Admin Management</h2>
          </div>
          <AdminManagement />
        </section> */}
        
        {/* Reset Section */}
        <section className="card-light p-6 shadow-md">
          <div className="flex items-center mb-4">
            <FaTrash className="text-xl text-accent-300 mr-2" />
            <h2 className="text-xl font-semibold text-accent-300">Reset Options</h2>
          </div>
          
          <div className="space-y-6">
            {/* Reset Election (blockchain) */}
            <div>
              <h3 className="text-md font-medium mb-3">Reset Blockchain Election Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This will reset all voter and candidate registrations in the smart contract.
              </p>
              <ResetElection />
            </div>
            
            {/* <div className="border-t border-gray-200 dark:border-dark-300 pt-6">
              <h3 className="text-md font-medium mb-3">Reset MongoDB Database</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                This will delete all voter and candidate images from the MongoDB database.
              </p>
              <ResetDatabase />
            </div> */}
          </div>
        </section>
      </div>
      <Toaster />
    </div>
  );
};

export default ElectionCommission;
