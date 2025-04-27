import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-toastify";
import { BiCalendarPlus, BiUserPlus, BiX } from "react-icons/bi";

const CreateElection = () => {
  const navigate = useNavigate();
  const { web3State } = useWeb3Context();
  const { contractInstance, account } = web3State;
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  
  const [candidates, setCandidates] = useState([
    { name: "", party: "" },
    { name: "", party: "" },
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle candidate input changes
  const handleCandidateChange = (index, field, value) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index][field] = value;
    setCandidates(updatedCandidates);
  };
  
  // Add new candidate field
  const addCandidate = () => {
    setCandidates([...candidates, { name: "", party: "" }]);
  };
  
  // Remove candidate field
  const removeCandidate = (index) => {
    if (candidates.length <= 2) {
      toast.warning("At least two candidates are required");
      return;
    }
    
    const updatedCandidates = [...candidates];
    updatedCandidates.splice(index, 1);
    setCandidates(updatedCandidates);
  };
  
  // Convert date-time local to Unix timestamp
  const convertToTimestamp = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return Math.floor(date.getTime() / 1000);
  };
  
  // Validate form data
  const validateForm = () => {
    // Check if title is provided
    if (!formData.title.trim()) {
      toast.error("Please provide an election title");
      return false;
    }
    
    // Check if description is provided
    if (!formData.description.trim()) {
      toast.error("Please provide an election description");
      return false;
    }
    
    // Check if start time is provided
    if (!formData.startTime) {
      toast.error("Please provide a start time for the election");
      return false;
    }
    
    // Check if end time is provided
    if (!formData.endTime) {
      toast.error("Please provide an end time for the election");
      return false;
    }
    
    // Check if end time is after start time
    const startTimestamp = convertToTimestamp(formData.startTime);
    const endTimestamp = convertToTimestamp(formData.endTime);
    
    if (endTimestamp <= startTimestamp) {
      toast.error("End time must be after start time");
      return false;
    }
    
    // Check if all candidates have a name and party
    for (let i = 0; i < candidates.length; i++) {
      if (!candidates[i].name.trim() || !candidates[i].party.trim()) {
        toast.error(`Please complete details for candidate ${i + 1}`);
        return false;
      }
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Convert date-time values to Unix timestamps
      const startTimestamp = convertToTimestamp(formData.startTime);
      const endTimestamp = convertToTimestamp(formData.endTime);
      
      // Create election on blockchain
      await contractInstance.createElection(
        formData.title,
        formData.description,
        startTimestamp,
        endTimestamp,
        candidates.map(c => ({ name: c.name, party: c.party })),
        { from: account }
      );
      
      toast.success("Election created successfully!");
      
      // Redirect to elections page
      navigate("/admin/elections");
      
    } catch (error) {
      console.error("Error creating election:", error);
      toast.error("Failed to create election. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/admin/elections")}
            className="flex items-center text-accent-300 hover:text-accent-100 transition-colors duration-300"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Elections
          </button>
        </div>
        
        <div className="card-light p-6 md:p-8">
          <h1 className="text-3xl font-bold text-accent-300 mb-6">Create New Election</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BiCalendarPlus className="mr-2 text-accent-300" />
                Election Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Election Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Presidential Election 2024"
                    className="w-full p-3 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-300 focus:border-transparent transition duration-300"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Election Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a brief description of the election"
                    className="w-full p-3 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-300 focus:border-transparent transition duration-300 h-24"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-300 focus:border-transparent transition duration-300"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-300 focus:border-transparent transition duration-300"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BiUserPlus className="mr-2 text-accent-300" />
                Candidates
              </h2>
              
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <div key={index} className="card-elevated p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Candidate {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeCandidate(index)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-300"
                        aria-label="Remove candidate"
                      >
                        <BiX className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`candidate-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          id={`candidate-name-${index}`}
                          value={candidate.name}
                          onChange={(e) => handleCandidateChange(index, "name", e.target.value)}
                          placeholder="Candidate name"
                          className="w-full p-3 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-300 focus:border-transparent transition duration-300"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`candidate-party-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Party *
                        </label>
                        <input
                          type="text"
                          id={`candidate-party-${index}`}
                          value={candidate.party}
                          onChange={(e) => handleCandidateChange(index, "party", e.target.value)}
                          placeholder="Political party"
                          className="w-full p-3 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-300 focus:border-transparent transition duration-300"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addCandidate}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-accent-300 dark:hover:border-accent-200 rounded-lg text-gray-500 dark:text-gray-400 hover:text-accent-300 dark:hover:text-accent-200 transition-colors duration-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Another Candidate
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/admin/elections")}
                className="mr-4 py-3 px-6 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`py-3 px-6 rounded-lg font-medium transition-colors duration-300 flex items-center
                  ${isCreating ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed" : "bg-accent-300 hover:bg-accent-100 text-white"}`}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Election...
                  </>
                ) : (
                  "Create Election"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateElection; 