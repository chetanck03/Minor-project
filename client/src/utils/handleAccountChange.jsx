// Function to handle account changes in MetaMask and update the web3 state
import { getWeb3State } from "./getWeb3State";

export const handleAccountChange = async (setWeb3State) => {
  try {
    // Get the updated web3 state with the new account
    const web3StateData = await getWeb3State();
    
    // Update the entire web3State with the new data
    setWeb3State(web3StateData);
    
    // Update localStorage with the new account
    localStorage.setItem('selectedAccount', web3StateData.selectedAccount);
  } catch (error) {
    console.log("Error in handleAccountChange:", error);
    
    // Fallback to just updating the account if getWeb3State fails
    const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts' 
    });
    
    const selectedAccount = accounts[0];
    
    // Update the web3State with just the new selected account
    setWeb3State((prevState) => ({
        ...prevState,
        selectedAccount
    }));
    
    // Update localStorage
    localStorage.setItem('selectedAccount', selectedAccount);
  }
};
