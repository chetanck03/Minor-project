import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWeb3Context } from "../../context/useWeb3Context";
import { useTheme } from "../../context/ThemeContext";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [voterDropdownOpen, setVoterDropdownOpen] = useState(false);
  const [candidateDropdownOpen, setCandidateDropdownOpen] = useState(false);
  const voterDropdownRef = useRef(null);
  const candidateDropdownRef = useRef(null);
  const location = useLocation();
  
  const { web3State, handleWallet, disconnectWallet } = useWeb3Context();
  const { selectedAccount } = web3State;
  const account = selectedAccount || "";
  const AUTHORIZED_ADDRESS = "0x00912Bf03a1d1768C8c256649a805089b672Ac31";
  const { isDarkMode, toggleTheme } = useTheme();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (voterDropdownRef.current && !voterDropdownRef.current.contains(event.target)) {
        setVoterDropdownOpen(false);
      }
      if (candidateDropdownRef.current && !candidateDropdownRef.current.contains(event.target)) {
        setCandidateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setVoterDropdownOpen(false);
    setCandidateDropdownOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleAccountClick = () => {
    if (account) {
      // Disconnect wallet
      disconnectWallet();
    } else {
      // Connect wallet
      handleWallet();
    }
  };

  // Check if the current wallet is the authorized election commission address
  const isElectionCommission = account && account.toLowerCase() === AUTHORIZED_ADDRESS.toLowerCase();

  return (
    <nav className="bg-white dark:bg-dark-300 text-dark-300 dark:text-white p-3 sticky top-0 z-50 shadow-lg transition-colors duration-300">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-accent-300 text-2xl font-bold tracking-wide">
          <Link to="/" className="flex items-center">
            <span>Voting DApp</span>
          </Link>
        </div>

        {/* Hamburger Menu (Mobile View) */}
        <div className="lg:hidden flex items-center">
          <button 
            onClick={toggleTheme}
            className="mr-4 focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <button onClick={toggleMenu} className="focus:outline-none p-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex space-x-1 text-sm">
          <li>
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md block hover:text-accent-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300 ${
                location.pathname === "/" ? "text-accent-300 bg-gray-100 dark:bg-dark-200" : ""
              }`}
            >
              Home
            </Link>
          </li>
          
          {/* Voter Dropdown */}
          <li className="relative" ref={voterDropdownRef}>
            <button 
              onClick={() => {
                setVoterDropdownOpen(!voterDropdownOpen);
                setCandidateDropdownOpen(false);
              }}
              className={`px-3 py-2 rounded-md flex items-center hover:text-accent-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300 ${
                ["/register-voter", "/voter-list", "/cast-vote"].includes(location.pathname) 
                  ? "text-accent-300 bg-gray-100 dark:bg-dark-200" 
                  : ""
              }`}
            >
              Voter 
              <svg 
                className={`w-4 h-4 ml-1 transform ${voterDropdownOpen ? "rotate-180" : ""} transition-transform duration-200`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Voter Dropdown Menu */}
            {voterDropdownOpen && (
              <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-dark-200 z-10 border border-gray-100 dark:border-dark-100">
                <div className="py-1">
                  <Link 
                    to="/register-voter" 
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
                      location.pathname === "/register-voter" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
                    }`}
                  >
                    Register Voter
                  </Link>
                  <Link 
                    to="/voter-list" 
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
                      location.pathname === "/voter-list" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
                    }`}
                  >
                    Voter List
                  </Link>
                  <Link 
                    to="/cast-vote" 
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
                      location.pathname === "/cast-vote" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
                    }`}
                  >
                    Cast Vote
                  </Link>
                </div>
              </div>
            )}
          </li>
          
          {/* Candidate Dropdown */}
          <li className="relative" ref={candidateDropdownRef}>
            <button 
              onClick={() => {
                setCandidateDropdownOpen(!candidateDropdownOpen);
                setVoterDropdownOpen(false);
              }}
              className={`px-3 py-2 rounded-md flex items-center hover:text-accent-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300 ${
                ["/register-candidate", "/candidate-list"].includes(location.pathname) 
                  ? "text-accent-300 bg-gray-100 dark:bg-dark-200" 
                  : ""
              }`}
            >
              Candidate
              <svg 
                className={`w-4 h-4 ml-1 transform ${candidateDropdownOpen ? "rotate-180" : ""} transition-transform duration-200`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Candidate Dropdown Menu */}
            {candidateDropdownOpen && (
              <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-dark-200 z-10 border border-gray-100 dark:border-dark-100">
                <div className="py-1">
                  <Link 
                    to="/register-candidate" 
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
                      location.pathname === "/register-candidate" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
                    }`}
                  >
                    Register Candidate
                  </Link>
                  <Link 
                    to="/candidate-list" 
                    className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
                      location.pathname === "/candidate-list" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
                    }`}
                  >
                    Candidate List
                  </Link>
                </div>
              </div>
            )}
          </li>
          
          <li>
            <Link 
              to="/election-results" 
              className={`px-3 py-2 rounded-md block hover:text-accent-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300 ${
                location.pathname === "/election-results" ? "text-accent-300 bg-gray-100 dark:bg-dark-200" : ""
              }`}
            >
              Election Results
            </Link>
          </li>
          
          {isElectionCommission && (
            <li>
              <Link 
                to="/election-commission" 
                className={`px-3 py-2 rounded-md block hover:text-accent-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300 ${
                  location.pathname === "/election-commission" ? "text-accent-300 bg-gray-100 dark:bg-dark-200" : ""
                }`}
              >
                Election Commission
              </Link>
            </li>
          )}
          
          <li>
            <Link 
              to="/token-marketplace" 
              className={`px-3 py-2 rounded-md block hover:text-accent-300 hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300 ${
                location.pathname === "/token-marketplace" ? "text-accent-300 bg-gray-100 dark:bg-dark-200" : ""
              }`}
            >
              Token Marketplace
            </Link>
          </li>
        </ul>

        {/* Account Address & Theme Toggle (Right side) */}
        <div className="hidden lg:flex items-center ml-2 space-x-3">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          {/* Profile Link - Only show when connected */}
          {account && (
            <Link
              to="/profile"
              className={`focus:outline-none p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition duration-300 ${
                location.pathname === "/profile" ? "text-accent-300 bg-gray-100 dark:bg-dark-200" : ""
              }`}
              aria-label="View Profile"
            >
              <svg 
                className="h-5 w-5 text-accent-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </Link>
          )}
          
          {/* Wallet Connect/Disconnect Button */}
          <button
            onClick={handleAccountClick}
            className={`${
              account ? "bg-red-600 hover:bg-red-700" : "bg-accent-300 hover:bg-accent-100"
            } text-white px-4 py-2 rounded-lg shadow-md text-sm transition duration-300 flex items-center`}
          >
            {account ? (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A1 1 0 014 17V7a1 1 0 011.513-.858l7.737 4.978a1 1 0 010 1.716l-7.737 4.978A1 1 0 015.12 17.804zM19 12h-2m2 4h-2m2-8h-2"
                  />
                </svg>
                <span className="hidden sm:block">{shortenAddress(account)}</span>
                <span className="sm:hidden text-xs">{shortenAddress(account)}</span>
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden mt-2 py-2 bg-white dark:bg-dark-200 rounded-lg shadow-lg overflow-hidden">
          <Link 
            to="/" 
            className={`block px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Home
          </Link>
          
          {/* Voter Group */}
          <div className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-300 text-sm uppercase tracking-wider">
            Voter
          </div>
          <Link 
            to="/register-voter" 
            className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/register-voter" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Register Voter
          </Link>
          <Link 
            to="/voter-list" 
            className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/voter-list" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Voter List
          </Link>
          <Link 
            to="/cast-vote" 
            className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/cast-vote" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Cast Vote
          </Link>
          
          {/* Candidate Group */}
          <div className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-300 text-sm uppercase tracking-wider">
            Candidate
          </div>
          <Link 
            to="/register-candidate" 
            className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/register-candidate" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Register Candidate
          </Link>
          <Link 
            to="/candidate-list" 
            className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/candidate-list" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Candidate List
          </Link>
          
          {/* Other Links */}
          <div className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-300 text-sm uppercase tracking-wider">
            Other
          </div>
          <Link 
            to="/election-results" 
            className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/election-results" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Election Results
          </Link>
          
          {isElectionCommission && (
            <Link 
              to="/election-commission" 
              className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
                location.pathname === "/election-commission" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
              }`}
            >
              Election Commission
            </Link>
          )}
          
          <Link 
            to="/token-marketplace" 
            className={`block px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
              location.pathname === "/token-marketplace" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
            }`}
          >
            Token Marketplace
          </Link>
          
          {/* Profile Link for Mobile - Only show when connected */}
          {account && (
            <>
              <div className="px-4 py-2 font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-300 text-sm uppercase tracking-wider">
                Account
              </div>
              <Link 
                to="/profile"
                className={`flex items-center w-full text-left px-6 py-2 hover:bg-gray-100 dark:hover:bg-dark-100 hover:text-accent-300 ${
                  location.pathname === "/profile" ? "text-accent-300 bg-gray-50 dark:bg-dark-100" : ""
                }`}
              >
                <svg 
                  className="h-4 w-4 mr-2 text-accent-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
                My Profile
              </Link>
            </>
          )}
          
          {/* Mobile Account Button */}
          <div className="mt-2 px-4 py-2">
            <button
              onClick={handleAccountClick}
              className={`${
                account ? "bg-red-600 hover:bg-red-700" : "bg-accent-300 hover:bg-accent-100"
              } text-white w-full px-4 py-2 rounded-lg shadow-md text-sm transition duration-300 flex items-center justify-center`}
            >
              {account ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5.121 17.804A1 1 0 014 17V7a1 1 0 011.513-.858l7.737 4.978a1 1 0 010 1.716l-7.737 4.978A1 1 0 015.12 17.804zM19 12h-2m2 4h-2m2-8h-2"
                    />
                  </svg>
                  <span className="text-xs">{shortenAddress(account)}</span>
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
