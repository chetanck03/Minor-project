import { useRef, useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { useNavigate } from "react-router-dom";
import { uploadVoterImage } from "../../utils/uploadVoterImage";
import { FaUpload, FaUser } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

const RegisterVoter = () => {
  const token = localStorage.getItem("token");
  const navigateTo = useNavigate();

  useEffect(() => {
    if (!token) {
      navigateTo("/");
    }
  }, [navigateTo, token]);

  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const nameRef = useRef(null);
  const ageRef = useRef(null);
  const genderRef = useRef(null);

  const handleVoterRegistration = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);

      const name = nameRef.current.value;
      const age = ageRef.current.value;
      const gender = genderRef.current.value;

      const genderEnum = mapGenderToEnum(gender);
      
      // If file exists, upload it, but make it optional
      let imageUploadSuccess = true;
      if (file) {
        const imageUploadResponse = await uploadVoterImage(file);
        console.log("Image upload response:", imageUploadResponse);
        imageUploadSuccess = imageUploadResponse.success;
        
        if (!imageUploadSuccess) {
          toast.error("Image upload failed. You can proceed without an image or try again.");
          setIsLoading(false);
          return;
        }
      }

      if (imageUploadSuccess) {
        await contractInstance.registerVoter(name, age, genderEnum);
        nameRef.current.value = "";
        ageRef.current.value = "";
        genderRef.current.value = "";
        setFile(null);
        setFilePreview(null);

        // Success toast
        toast.success("Voter Registration Successful!");
      }
    } catch (error) {
      console.error(error);
      // Failure toast
      toast.error("Registration Failed, Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const mapGenderToEnum = (gender) => {
    switch (gender) {
      case "Male":
        return 1;
      case "Female":
        return 2;
      case "Other":
        return 3;
      default:
        return 0;
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    // Check if the file is in PNG format
    if (file && file.type === "image/png") {
      setFile(file);
      setFilePreview(URL.createObjectURL(file));
    } else if (file) {
      // Show error toast if the file is not PNG
      toast.error("Please upload a PNG image!");
      setFile(null);
      setFilePreview(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-200 dark:to-dark-300 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="card-light p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-accent-300">Register Voter</h1>
        
        <form onSubmit={handleVoterRegistration} className="space-y-6">
          {/* Image Upload - Optional */}
          {/* <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-full border-4 border-accent-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-dark-100 rounded-full border-4 border-accent-300">
                  <FaUser className="text-4xl text-gray-400 dark:text-gray-600" />
                </div>
              )}
              
              <label
                htmlFor="file-upload"
                className="absolute bottom-0 right-0 bg-accent-300 hover:bg-accent-100 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors duration-300"
              >
                <FaUpload />
              </label>
              <input
                type="file"
                accept="image/png"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload PNG image (optional)</p>
          </div> */}

          {/* Voter Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              ref={nameRef}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
              required
            />
          </div>

          {/* Voter Age */}
          <div>
            <label className="block text-sm font-medium mb-1">Age</label>
            <input
              type="number"
              ref={ageRef}
              placeholder="Enter your age"
              min="18"
              max="120"
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
              required
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              ref={genderRef}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-100 bg-white dark:bg-dark-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-300 focus:border-transparent transition-colors duration-300"
              required
            >
              <option value="" disabled selected>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-accent-300 hover:bg-accent-100 text-white font-medium px-4 py-3 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Register as Voter"
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Your details will be stored securely on the blockchain.</p>
          <p className="mt-1">Make sure all information is accurate for verification purposes.</p>
        </div>
      </div>

      {/* Toast container */}
      <Toaster />
    </div>
  );
};

export default RegisterVoter;
