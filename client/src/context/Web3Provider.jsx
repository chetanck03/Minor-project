import { useEffect, useState } from "react"; 
import { Web3Context } from "./Web3Context"; 
import { getWeb3State } from "../utils/getWeb3State"; 
import { handleAccountChange } from "../utils/handleAccountChange"; 
import { handleChainChange } from "../utils/handleChainChange"; 

const Web3Provider = ({ children }) => {
  // Set initial state for web3 with null values for contract instance, selected account, and chain ID
  const [web3State, setWeb3State] = useState({
    contractInstance: null,
    selectedAccount: null,
    chainId: null,
    networkName: null,
    signer: null,
    provider: null
  });
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  // Function to handle wallet connection and retrieve web3 state
  const handleWallet = async () => {
    try {
      // Check if ethereum object exists in window (MetaMask or other wallet installed)
      if (!window.ethereum) {
        setShowWalletPopup(true);
        return;
      }
      
      const { contractInstance, selectedAccount, chainId, networkName, signer, provider } = await getWeb3State();

      // Update the web3State with the fetched data
      setWeb3State({ contractInstance, selectedAccount, chainId, networkName, signer, provider });
      
      // Persist selectedAccount to localStorage
      localStorage.setItem('selectedAccount', selectedAccount);
      console.log(contractInstance, selectedAccount, chainId, networkName, signer, provider);
    } catch (error) {
      console.log(error); 
      // If error is "MetaMask is not installed", show wallet popup
      if (error.message && error.message.includes("MetaMask is not installed")) {
        setShowWalletPopup(true);
      }
    }
  };

  // Function to handle wallet disconnection
  const disconnectWallet = () => {
    setWeb3State(prevState => ({
      ...prevState,
      selectedAccount: null,
      chainId: null,
      networkName: null,
      signer: null,
      provider: null
    }));
    localStorage.removeItem('selectedAccount'); // Clear from localStorage
  };

  // useEffect to add event listeners for account and chain (network) changes in MetaMask
  useEffect(() => {
    const initWeb3State = async () => {
      const storedAccount = localStorage.getItem('selectedAccount');
      if (storedAccount && window.ethereum) {
        try {
          // If there's a stored account, completely reinitialize the web3 state
          // This will restore the contract instance, signer, provider, etc.
          const web3StateData = await getWeb3State();
          setWeb3State(web3StateData);
        } catch (error) {
          console.log("Error restoring web3 state:", error);
          // If there's an error, just set the account from localStorage
          setWeb3State(prevState => ({
            ...prevState,
            selectedAccount: storedAccount
          }));
        }
      }
    };

    initWeb3State();

    if (window.ethereum) {
      // Listen for changes in the accounts and chains, and handle them accordingly
      window.ethereum.on('accountsChanged', () => handleAccountChange(setWeb3State));
      window.ethereum.on('chainChanged', () => handleChainChange(setWeb3State));

      // Cleanup: Remove the listeners when the component unmounts
      return () => {
        window.ethereum.removeListener('accountsChanged', () => handleAccountChange(setWeb3State));
        window.ethereum.removeListener('chainChanged', () => handleChainChange(setWeb3State));
      };
    }
  }, []); // Empty dependency array ensures this runs once on component mount

  // Wallet installation popup component
  const WalletInstallationPopup = () => {
    if (!showWalletPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-dark-300 rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-accent-300">Wallet Required</h3>
            <button 
              onClick={() => setShowWalletPopup(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              &times;
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You need a crypto wallet to use this application. We recommend installing MetaMask.
            </p>
            
            <div className="flex flex-col space-y-3">
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-accent-300 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-accent-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M378.7 32H133.3L64 192v128l64 64 64-64h192l64 64 64-64V192L378.7 32zm-37.3 320H170.7l-42.7 42.7-42.7-42.7V213.3l85.3-128h166.7l85.3 128v138.7l-42.7 42.7-42.7-42.7z"/>
                </svg>
                Install MetaMask
              </a>
              
              <a 
                href="https://metamask.io/download/mobile/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-200 dark:bg-dark-100 text-gray-700 dark:text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-dark-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path fill="currentColor" d="M16 64C16 28.7 44.7 0 80 0H304c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H80c-35.3 0-64-28.7-64-64V64zM144 448c0 8.8 7.2 16 16 16h64c8.8 0 16-7.2 16-16s-7.2-16-16-16H160c-8.8 0-16 7.2-16 16zM304 64H80V384H304V64z"/>
                </svg>
                Mobile Options
              </a>
              
              <a 
                href="https://ethereum.org/en/wallets/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-200 dark:bg-dark-100 text-gray-700 dark:text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 dark:hover:bg-dark-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path fill="currentColor" d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208S370.7 464 256 464zM256 336c-18 0-32 14-32 32s13.1 32 32 32c17.1 0 32-14 32-32S273.1 336 256 336zM289.1 128h-51.1C199 128 168 159 168 198c0 13 11 24 23 24s23-11 24-24C215.1 186 225.1 176 237.1 176h51.1C301.1 176 312 186 312 198c0 8-4 14.1-11 18.1L244 251C236 256 232 264 232 272V288c0 13 11 24 24 24S280 301 280 288V286l45.1-28c21-13 34-36 34-60C360 159 329 128 289.1 128z"/>
                </svg>
                Other Wallets
              </a>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>After installation, refresh this page to connect your wallet.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Wrap children components with the Web3Context provider to pass web3State & handleWallet globally */}
      <Web3Context.Provider value={{ web3State, handleWallet, disconnectWallet }}>
        {children}
        <WalletInstallationPopup />
      </Web3Context.Provider>
    </>
  );
};

export default Web3Provider;
