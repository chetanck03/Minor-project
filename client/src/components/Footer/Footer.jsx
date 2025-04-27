import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 py-8 w-full bottom-0 mt-auto transition-colors duration-300 border-t border-gray-200 dark:border-dark-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section - Brand */}
          <div className="text-center md:text-left">
            <Link to="/" className="text-xl font-bold text-accent-300 hover:text-accent-100 transition-colors duration-300">
              Voting DApp
            </Link>
            <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
              A secure and transparent blockchain-based voting platform
            </p>
            <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
              Made by Chetan Ck 💖
            </p>
          </div>

          {/* Center Section - Navigation Links */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-3 text-accent-300">Quick Links</h3>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent-300 transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/register-voter" className="hover:text-accent-300 transition duration-300">
                  Register Voter
                </Link>
              </li>
              <li>
                <Link to="/register-candidate" className="hover:text-accent-300 transition duration-300">
                  Register Candidate
                </Link>
              </li>
              <li>
                <Link to="/voter-list" className="hover:text-accent-300 transition duration-300">
                  Voter List
                </Link>
              </li>
              <li>
                <Link to="/candidate-list" className="hover:text-accent-300 transition duration-300">
                  Candidate List
                </Link>
              </li>
              <li>
                <Link to="/cast-vote" className="hover:text-accent-300 transition duration-300">
                  Cast Vote
                </Link>
              </li>
              <li>
                <Link to="/election-results" className="hover:text-accent-300 transition duration-300">
                  Results
                </Link>
              </li>
              <li>
                <Link to="/token-marketplace" className="hover:text-accent-300 transition duration-300">
                  Token Marketplace
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - Contact & Social */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-semibold mb-3 text-accent-300">Connect With Us</h3>
            <div className="flex justify-center md:justify-end space-x-4 mb-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition duration-300"
                aria-label="GitHub"
              >
                <FaGithub className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-400 transition duration-300"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition duration-300"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 dark:text-gray-400 hover:text-pink-500 transition duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need assistance? <a href="mailto:support@votingdapp.com" className="text-accent-300 hover:underline">support@votingdapp.com</a>
            </p>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-dark-200 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Voting DApp. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
