import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { FaUser, FaSearch } from "react-icons/fa";
import { getImageUrl } from "../../utils/getImageUrl";

// Function to map gender value to string
const getGenderString = (genderValue) => {
  switch (genderValue) {
    case "0":
      return "Not Specified";
    case "1":
      return "Male";
    case "2":
      return "Female";
    case "3":
      return "Other";
    default:
      return "Unknown";
  }
};

const GetVoterList = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [voterList, setVoterList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [voterImages, setVoterImages] = useState({});
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  useEffect(() => {
    const fetchVoterList = async () => {
      try {
        setLoading(true);
        // Fetch the voter list from the smart contract
        const voters = await contractInstance.getVoterList();

        // Map the fetched data to an array of voter objects
        const formattedVoters = voters.map(voter => ({
          voterId: voter.voterId.toString(),
          name: voter.name,
          age: voter.age.toString(),
          gender: voter.gender.toString(),
          voterAddress: voter.voterAddress,
        }));

        setVoterList(formattedVoters);
        setFilteredVoters(formattedVoters);
        
        // Reset image loading states for new voter list
        const loadingStates = {};
        formattedVoters.forEach(voter => {
          loadingStates[voter.voterAddress] = true;
        });
        setImageLoadingStates(loadingStates);
        
        // Fetch images for each voter using the utility function
        const imagePromises = formattedVoters.map(async (voter) => {
          try {
            const ipfsUrl = await getImageUrl(voter.voterAddress, 'voter');
            return { address: voter.voterAddress, ipfsUrl };
          } finally {
            // Mark image as loaded regardless of success or failure
            setImageLoadingStates(prev => ({
              ...prev,
              [voter.voterAddress]: false
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
        
        console.log("Voter image map:", imageMap);
        setVoterImages(imageMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching voter list: ", error);
        setLoading(false);
      }
    };

    if (contractInstance) {
      fetchVoterList(); // Initial fetch on component mount

      // Set up interval to fetch voter list every 10 seconds
      const interval = setInterval(() => {
        fetchVoterList();
      }, 10000); // 10000 ms = 10 seconds

      // Cleanup the interval on component unmount
      return () => clearInterval(interval);
    }
  }, [contractInstance]); // Re-run effect when contractInstance changes

  // Filter voters based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredVoters(voterList);
    } else {
      const filtered = voterList.filter(voter => 
        voter.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        voter.voterId.includes(searchTerm) ||
        voter.voterAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVoters(filtered);
    }
  }, [searchTerm, voterList]);

  // Handle image load error
  const handleImageError = (address) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [address]: true
    }));
  };

  // Function to render the profile picture
  const renderProfilePicture = (voter) => {
    const address = voter.voterAddress;
    const hasImage = voterImages[address] && !imageLoadErrors[address];
    const isLoading = imageLoadingStates[address];
    
    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-200 rounded-full border-2 border-accent-300">
          <div className="w-6 h-6 border-2 border-accent-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (hasImage) {
      return (
        <img
          className="w-full h-full object-cover rounded-full border-2 border-accent-300"
          src={voterImages[address]}
          alt={`${voter.name}'s image`}
          onError={() => handleImageError(address)}
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-200 rounded-full border-2 border-accent-300">
        <span className="text-2xl font-bold text-accent-300">
          {voter.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-accent-300 mb-8">Voter List</h1>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-accent-300 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">Loading voters...</p>
          </div>
        ) : filteredVoters.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-100 rounded-xl shadow-sm">
            {searchTerm ? (
              <div>
                <p className="text-xl text-gray-500 dark:text-gray-400">No voters found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-accent-300 hover:bg-accent-100 text-white rounded-lg transition-colors duration-300"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <p className="text-xl text-gray-500 dark:text-gray-400">No registered voters available at the moment.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVoters.map((voter, index) => (
              <div
                key={index}
                className="card-light p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative w-24 h-24 mb-4 overflow-hidden">
                  {renderProfilePicture(voter)}
                </div>

                <h2 className="text-xl font-bold mb-3 text-accent-300">{voter.name}</h2>
                
                <div className="w-full mb-4 space-y-2">
                  <div className="card-elevated p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Voter ID</span>
                    <span className="font-semibold">{voter.voterId}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="card-elevated p-3 rounded-lg flex-1 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Age</span>
                      <span className="font-semibold">{voter.age}</span>
                    </div>
                    <div className="card-elevated p-3 rounded-lg flex-1 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Gender</span>
                      <span className="font-semibold">{getGenderString(voter.gender)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Wallet Address */}
                <div className="w-full mt-auto">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Address</div>
                  <div className="text-xs font-mono bg-gray-100 dark:bg-dark-200 p-2 rounded-lg overflow-hidden text-ellipsis">
                    {voter.voterAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Total count */}
        {filteredVoters.length > 0 && (
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? (
              <p>Showing {filteredVoters.length} of {voterList.length} voters</p>
            ) : (
              <p>Total registered voters: {voterList.length}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetVoterList;
