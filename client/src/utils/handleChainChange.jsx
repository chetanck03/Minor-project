import { getWeb3State } from "./getWeb3State";

export const handleChainChange = async (setWeb3State) => {
    try {
        // Get the complete updated web3 state with the new chain
        const web3StateData = await getWeb3State();
        
        // Update the entire web3State with the new data
        setWeb3State(web3StateData);
    } catch (error) {
        console.log("Error in handleChainChange:", error);
        
        // Fallback to just updating the chainId if getWeb3State fails
        // Request the current chain ID from MetaMask
        const chainIdHex = await window.ethereum.request({
            method: 'eth_chainId' 
        });

        // Convert the chain ID from hexadecimal to a decimal number
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

        // Update the web3State with the new chain ID and network name
        setWeb3State((prevState) => ({
            ...prevState,
            chainId,
            networkName
        }));
    }
};
