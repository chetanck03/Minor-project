import { ethers } from "ethers";
import abi from "../constant/abi.json";
import axios from "axios"
import CONTRACTS from "../constant/contractAddresses";

export const getWeb3State = async () => {
    try {
        // Check if ethereum provider exists (MetaMask or other wallet)
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }

        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        const selectedAccount = accounts[0];

        const chainIdHex = await window.ethereum.request({
            method: 'eth_chainId'
        });
        const chainId = parseInt(chainIdHex, 16);

        // Mapping chainId to network name
        let networkName = '';
        switch (chainId) {
            case 1:
                networkName = 'Ethereum Mainnet';
                break;
            case 3:
                networkName = 'Ropsten Test Network';
                break;
            case 4:
                networkName = 'Rinkeby Test Network';
                break;
            case 5:
                networkName = 'Goerli Test Network';
                break;
            case 42:
                networkName = 'Kovan Test Network';
                break;
            case 56:
                networkName = 'Binance Smart Chain';
                break;
            case 137:
                networkName = 'Polygon Mainnet';
                break;
            case 80001:
                networkName = 'Polygon Mumbai Test Network';
                break;
            case 11155111:
                networkName = 'Sepolia Test Network';
                break;
            case 17000:
                networkName = 'Ethereum Holesky Testnet';
                break;
            // Add more networks as needed
            default:
                networkName = 'Unknown Network';
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Get voting contract address from constants
        const contractAddress = CONTRACTS.VOTING_CONTRACT;

        const message = "Welcome to Voting Dapp. You accept our terms and condition";
        const signature = await signer.signMessage(message);
        const dataSignature = { signature };
        
        // Fix the double slash issue by ensuring the backend URL doesn't end with a slash
        const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL.endsWith('/') 
            ? import.meta.env.VITE_REACT_APP_BACKEND_BASEURL.slice(0, -1) 
            : import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;
            
        const res = await axios.post(`${backendUrl}/api/authentication?accountAddress=${selectedAccount}`, dataSignature);
        localStorage.setItem("token", res.data.token);

        const contractInstance = new ethers.Contract(contractAddress, abi, signer);
        
        return { contractInstance, selectedAccount, chainId, networkName, signer, provider }; // Return networkName here

    } catch (error) {
        // Handle specific error cases
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }
        
        console.error("Web3 State Error:", error);
        throw error;
    }
};
