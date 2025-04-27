import { useEffect, useState } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { FaUser, FaSearch } from "react-icons/fa";
import { getImageUrl } from "../../utils/getImageUrl";

// Function to map enum values to strings
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

const GetCandidateList = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [candidateList, setCandidateList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [candidateImages, setCandidateImages] = useState({});
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  useEffect(() => {
    const fetchCandidateList = async () => {
      try {
        setLoading(true);
        const candidates = await contractInstance.getCandidateList();
        
        // Format candidate data
        const formattedCandidates = candidates.map(candidate => ({
          candidateId: candidate.candidateId.toString(),
          name: candidate.name,
          party: candidate.party,
          age: candidate.age.toString(),
          gender: candidate.gender.toString(),
          votes: candidate.votes.toString(),
          candidateAddress: candidate.candidateAddress,
        }));
        
        setCandidateList(formattedCandidates);
        setFilteredCandidates(formattedCandidates);
        
        // Reset image loading states for new candidate list
        const loadingStates = {};
        formattedCandidates.forEach(candidate => {
          loadingStates[candidate.candidateAddress] = true;
        });
        setImageLoadingStates(loadingStates);
        
        // Fetch images for each candidate using the utility function
        const imagePromises = formattedCandidates.map(async (candidate) => {
          try {
            const ipfsUrl = await getImageUrl(candidate.candidateAddress, 'candidate');
            return { address: candidate.candidateAddress, ipfsUrl };
          } finally {
            // Mark image as loaded regardless of success or failure
            setImageLoadingStates(prev => ({
              ...prev,
              [candidate.candidateAddress]: false
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
        
        console.log("Candidate image map:", imageMap);
        setCandidateImages(imageMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching candidate list: ", error);
        setLoading(false);
      }
    };

    if (contractInstance) {
      fetchCandidateList(); // Initial fetch on component mount
      
      // Set up interval to fetch candidate list periodically
      const interval = setInterval(() => {
        fetchCandidateList();
      }, 10000); // 10000 ms = 10 seconds
      
      // Clean up interval on unmount
      return () => clearInterval(interval);
    }
  }, [contractInstance]);

  // Filter candidates based on search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCandidates(candidateList);
    } else {
      const filtered = candidateList.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        candidate.candidateId.includes(searchTerm) ||
        candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.candidateAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  }, [searchTerm, candidateList]);

  // Handle image load error
  const handleImageError = (address) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [address]: true
    }));
  };

  // Function to render the profile picture
  const renderProfilePicture = (candidate) => {
    const address = candidate.candidateAddress;
    const hasImage = candidateImages[address] && !imageLoadErrors[address];
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
          src={candidateImages[address]}
          alt={`${candidate.name}'s image`}
          onError={() => handleImageError(address)}
        />
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-200 rounded-full border-2 border-accent-300">
        <span className="text-2xl font-bold text-accent-300">
          {candidate.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-accent-300 mb-8">Candidate List</h1>
        
        {/* Search Bar */}
        <div className="mb-8 max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, ID, party or address..."
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
            <p className="text-lg text-gray-500 dark:text-gray-400">Loading candidates...</p>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-dark-100 rounded-xl shadow-sm">
            {searchTerm ? (
              <div>
                <p className="text-xl text-gray-500 dark:text-gray-400">No candidates found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-accent-300 hover:bg-accent-100 text-white rounded-lg transition-colors duration-300"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <p className="text-xl text-gray-500 dark:text-gray-400">No registered candidates available at the moment.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCandidates.map((candidate, index) => (
              <div
                key={index}
                className="card-light p-6 flex flex-col items-center text-center transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative w-24 h-24 mb-4 overflow-hidden">
                  {renderProfilePicture(candidate)}
                </div>

                <h2 className="text-xl font-bold mb-1 text-accent-300">{candidate.name}</h2>
                <p className="text-sm bg-accent-50 dark:bg-accent-900 text-accent-600 dark:text-accent-300 px-3 py-1 rounded-full mb-3">
                  {candidate.party}
                </p>
                
                <div className="w-full mb-4 space-y-2">
                  <div className="card-elevated p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Candidate ID</span>
                    <span className="font-semibold">{candidate.candidateId}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="card-elevated p-3 rounded-lg flex-1 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Age</span>
                      <span className="font-semibold">{candidate.age}</span>
                    </div>
                    <div className="card-elevated p-3 rounded-lg flex-1 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Gender</span>
                      <span className="font-semibold">{getGenderString(candidate.gender)}</span>
                    </div>
                  </div>
                  
                  <div className="card-elevated p-3 rounded-lg text-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Current Votes</span>
                    <span className="font-semibold text-accent-300 text-xl">{candidate.votes}</span>
                  </div>
                </div>
                
                {/* Wallet Address */}
                <div className="w-full mt-auto">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Wallet Address</div>
                  <div className="text-xs font-mono bg-gray-100 dark:bg-dark-200 p-2 rounded-lg overflow-hidden text-ellipsis">
                    {candidate.candidateAddress}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Total count */}
        {filteredCandidates.length > 0 && (
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? (
              <p>Showing {filteredCandidates.length} of {candidateList.length} candidates</p>
            ) : (
              <p>Total registered candidates: {candidateList.length}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetCandidateList;
