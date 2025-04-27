import { createBrowserRouter } from "react-router-dom";
import RegisterVoter from "../pages/Voter/RegisterVoter";
import RegisterCandidate from "../pages/Candidate/RegisterCandidate";
import GetVoterList from "../pages/Voter/GetVoterList"
import GetCandidateList from "../pages/Candidate/GetCandidateList"
import ElectionCommission from "../pages/ElectionCommission/ElectionCommission"
import ElectionResults from "../pages/Results/ElectionResults";
import Wallet from "../components/Wallet/Wallet";
import Navigation from "../components/Navigation/Navigation";
import Footer from "../components/Footer/Footer";
import TokenExchange from "../pages/TokenMarketplace/TokenMarketplace"
import CastVote from "../components/Voter/CastVote";
import ProfilePage from "../pages/Profile/ProfilePage";
import { Navigate } from "react-router-dom";
import { useWeb3Context } from "../context/useWeb3Context";

// Protected Route component for Election Commission
const ProtectedElectionCommissionRoute = () => {
  const { web3State } = useWeb3Context();
  const { selectedAccount } = web3State;
  const AUTHORIZED_ADDRESS = "0x00912Bf03a1d1768C8c256649a805089b672Ac31";
  
  // Check if the connected wallet matches the authorized address
  if (selectedAccount && selectedAccount.toLowerCase() === AUTHORIZED_ADDRESS.toLowerCase()) {
    return (
      <div>
        <Navigation />
        <ElectionCommission />
        <Footer/>
      </div>
    );
  }
  
  // Redirect to home if not authorized
  return <Navigate to="/" />;
};

export const routes = createBrowserRouter([
  {
    path: '/', element: (
      <div>
        <Navigation />
        <Wallet />
        <Footer/>
      </div>)
  },
  {
    path: '/register-voter', element: (
      <div>
        <Navigation />
        <RegisterVoter />
        <Footer/>

      </div>

    )
  },
  {
    path: '/register-candidate', element: (
      <div>
        <Navigation />
        <RegisterCandidate />
        <Footer/>

      </div>
    )
  },
  {
    path: '/voter-list', element: (
      <div>
        <Navigation />
        <GetVoterList />
        <Footer/>

      </div>
    )
  },
  {
    path: '/candidate-list', element: (
      <div>
        <Navigation />
        <GetCandidateList />
        <Footer/>

      </div>
    )
  },
  {
    path: '/cast-vote', element: (
      <div>
        <Navigation />
        <CastVote/>
        <Footer/>

      </div>
    )
  },
  {
    path: '/election-results', element: (
      <div>
        <Navigation />
        <ElectionResults />
        <Footer/>
      </div>
    )
  },
  {
    path: '/election-commission', element: (
      <div>
        <Navigation />
        <ElectionCommission />
        <Footer/>
      </div>
    )
  },
  {
    path: '/profile', element: (
      <div>
        <Navigation />
        <ProfilePage />
        <Footer/>
      </div>
    )
  },
  {path:"/token-marketplace",element:(
    <div>
        <Navigation/>
        <TokenExchange/>
        <Footer/>
    </div>
)},
])