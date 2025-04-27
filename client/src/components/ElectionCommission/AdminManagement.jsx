import { useState, useEffect, useRef } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-hot-toast";
import { FaUserCog, FaUserPlus, FaUserMinus, FaSpinner } from "react-icons/fa";

const AdminManagement = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [removingAdmin, setRemovingAdmin] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  const addressInputRef = useRef(null);

  // Fetch the list of admins when the component mounts
  useEffect(() => {
    fetchAdmins();
  }, [contractInstance]);

  const fetchAdmins = async () => {
    try {
      if (!contractInstance) return;
      
      setLoading(true);
      const adminList = await contractInstance.getAdmins();
      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Failed to load admin list");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      setAddingAdmin(true);
      
      const newAdminAddress = addressInputRef.current.value;
      
      // Basic address validation
      if (!newAdminAddress || !newAdminAddress.startsWith("0x") || newAdminAddress.length !== 42) {
        toast.error("Please enter a valid Ethereum address");
        return;
      }

      // Call smart contract function to add admin
      const tx = await contractInstance.addAdmin(newAdminAddress);
      await tx.wait();
      
      toast.success("Admin added successfully!");
      
      // Clear input and refresh admin list
      addressInputRef.current.value = "";
      fetchAdmins();
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Failed to add admin");
      
      if (error.message.includes("Address is already an admin")) {
        toast.error("This address is already an admin");
      } else if (error.message.includes("Not authorized")) {
        toast.error("You are not authorized to add admins");
      }
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async () => {
    try {
      setRemovingAdmin(true);
      
      if (!selectedAdmin) {
        toast.error("Please select an admin to remove");
        return;
      }
      
      // Call smart contract function to remove admin
      const tx = await contractInstance.removeAdmin(selectedAdmin);
      await tx.wait();
      
      toast.success("Admin removed successfully!");
      
      // Clear selection and refresh admin list
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error removing admin:", error);
      toast.error("Failed to remove admin");
      
      if (error.message.includes("Cannot remove election commissioner")) {
        toast.error("Cannot remove the main election commissioner");
      } else if (error.message.includes("Not authorized")) {
        toast.error("You are not authorized to remove admins");
      }
    } finally {
      setRemovingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Admin */}
      <div className="bg-white dark:bg-dark-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaUserPlus className="text-accent-300 mr-2" />
          Add Admin
        </h3>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Admin Wallet Address</label>
            <input
              type="text"
              ref={addressInputRef}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
              required
            />
          </div>
          <button
            type="submit"
            disabled={addingAdmin}
            className="w-full px-4 py-2 bg-accent-300 hover:bg-accent-400 text-white rounded-lg shadow transition-colors duration-300 flex items-center justify-center"
          >
            {addingAdmin ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Adding...
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2" />
                Add Admin
              </>
            )}
          </button>
        </form>
      </div>

      {/* Admin List and Remove */}
      <div className="bg-white dark:bg-dark-100 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaUserCog className="text-accent-300 mr-2" />
          Current Admins
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-accent-300 text-2xl" />
          </div>
        ) : admins.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No admins found</p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto">
              {admins.map((admin, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg mb-2 flex justify-between items-center cursor-pointer transition-colors duration-200 ${
                    selectedAdmin === admin 
                      ? "bg-accent-100 dark:bg-accent-900" 
                      : "bg-gray-100 dark:bg-dark-200 hover:bg-gray-200 dark:hover:bg-dark-300"
                  }`}
                  onClick={() => setSelectedAdmin(admin)}
                >
                  <div className="font-mono text-sm break-all">
                    {admin.substring(0, 6)}...{admin.substring(admin.length - 4)}
                    {admin === web3State.selectedAccount && (
                      <span className="ml-2 px-2 py-0.5 bg-accent-300 text-white text-xs rounded-full">You</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAdmin(admin);
                    }}
                  >
                    <FaUserMinus />
                  </button>
                </div>
              ))}
            </div>
            
            {selectedAdmin && (
              <div className="pt-3 border-t border-gray-200 dark:border-dark-300">
                <h4 className="text-sm font-medium mb-2">Selected Admin:</h4>
                <div className="bg-gray-100 dark:bg-dark-200 p-2 rounded-lg font-mono text-xs mb-3 break-all">
                  {selectedAdmin}
                </div>
                <button
                  onClick={handleRemoveAdmin}
                  disabled={removingAdmin}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow transition-colors duration-300 flex items-center justify-center"
                >
                  {removingAdmin ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <FaUserMinus className="mr-2" />
                      Remove Admin
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement; 