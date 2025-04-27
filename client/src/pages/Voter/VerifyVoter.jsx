import { useState, useEffect } from "react";
import { useWeb3Context } from "../../context/useWeb3Context";
import { toast } from "react-toastify";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { getImageUrl } from "../../utils/getImageUrl";

const VerifyVoter = () => {
  const { web3State } = useWeb3Context();
  const { contractInstance } = web3State;
  const [voterId, setVoterId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [voterImage, setVoterImage] = useState(null);

  // Helper function to convert gender enum to string
  const getGenderString = (genderCode) => {
    const genders = ["Not Specified", "Male", "Female", "Other"];
    return genders[Number(genderCode)] || "Unknown";
  };

  // Fetch voter image when verification result is updated
  useEffect(() => {
    const fetchVoterImage = async () => {
      if (verificationResult?.verified && verificationResult.voterInfo.voterAddress) {
        const imageUrl = await getImageUrl(verificationResult.voterInfo.voterAddress, 'voter');
        setVoterImage(imageUrl);
      }
    };

    fetchVoterImage();
  }, [verificationResult]);

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!voterId.trim()) {
      toast.error("Please enter a voter ID");
      return;
    }

    try {
      setVerifying(true);
      setVerificationResult(null);
      setVoterImage(null);
      
      // Call the smart contract's voterDetails mapping to get voter info
      const voterInfo = await contractInstance.voterDetails(voterId);
      
      // Check if the voter exists (non-empty address and name)
      const verified = voterInfo.voterAddress !== "0x0000000000000000000000000000000000000000" && 
                      voterInfo.name.length > 0;
      
      // Update the verification result state
      if (verified) {
        setVerificationResult({ 
          verified, 
          voterInfo: {
            name: voterInfo.name,
            age: voterInfo.age.toString(),
            gender: voterInfo.gender.toString(),
            voterAddress: voterInfo.voterAddress,
            voterId: voterInfo.voterId.toString()
          }
        });
        toast.success("Voter verified successfully!");
      } else {
        setVerificationResult({ verified: false });
        toast.error("Voter verification failed. Voter ID not found.");
      }
    } catch (error) {
      console.error("Error verifying voter:", error);
      toast.error("Failed to verify voter. Please try again.");
      setVerificationResult({ verified: false });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Verify Voter</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Enter a voter ID to verify if the voter is registered in the system
            and view their details.
          </p>
        </div>

        <div className="card-light p-6 md:p-8">
          <form onSubmit={handleVerification} className="space-y-6">
            <div>
              <label
                htmlFor="voterId"
                className="block text-sm font-medium mb-2"
              >
                Voter ID
              </label>
              <input
                type="text"
                id="voterId"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="input-field w-full"
                placeholder="Enter voter ID number"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full flex justify-center items-center"
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </>
              ) : (
                "Verify Voter"
              )}
            </button>
          </form>
        </div>
        
        {verificationResult && (
          <div className={`card-light p-6 md:p-8 border-2 ${
            verificationResult.verified 
              ? "border-green-400 dark:border-green-600" 
              : "border-red-400 dark:border-red-600"
          }`}>
            <div className="flex items-center justify-center mb-6">
              {verificationResult.verified ? (
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                  <AiOutlineCheckCircle className="w-12 h-12 text-green-500 dark:text-green-400" />
                </div>
              ) : (
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
                  <AiOutlineCloseCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-center mb-6">
              {verificationResult.verified
                ? "Voter Verified Successfully"
                : "Voter Verification Failed"}
            </h2>
            
            {verificationResult.verified && (
              <div className="card-elevated p-6 space-y-4">
                {/* Profile Image */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 overflow-hidden">
                    {voterImage ? (
                      <img
                        className="w-full h-full object-cover rounded-full border-2 border-accent-300"
                        src={voterImage}
                        alt={`${verificationResult.voterInfo.name}'s image`}
                        onError={(e) => {
                          console.log("Error loading voter image, hiding element");
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-dark-200 rounded-full border-2 border-accent-300">
                        <span className="text-lg font-bold text-accent-300">
                          {verificationResult.voterInfo.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card-elevated p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Name</div>
                    <div className="font-semibold">{verificationResult.voterInfo.name}</div>
                  </div>
                  
                  <div className="card-elevated p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Age</div>
                    <div className="font-semibold">{verificationResult.voterInfo.age}</div>
                  </div>
                  
                  <div className="card-elevated p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Gender</div>
                    <div className="font-semibold">{getGenderString(verificationResult.voterInfo.gender)}</div>
                  </div>
                  
                  <div className="card-elevated p-3 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Voter ID</div>
                    <div className="font-semibold">{verificationResult.voterInfo.voterId}</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Wallet Address</div>
                  <div className="text-xs font-mono bg-gray-100 dark:bg-dark-200 p-2 rounded-lg overflow-hidden break-all">
                    {verificationResult.voterInfo.voterAddress}
                  </div>
                </div>
              </div>
            )}
            
            {!verificationResult.verified && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                The voter ID you entered was not found in the system. Please check the ID and try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyVoter; 