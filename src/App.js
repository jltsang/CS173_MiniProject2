import { useState, useEffect } from "react";

// Components
import Navbar from "./components/Navbar";
import { claimCounterParty, claimOwner, addBalanceCounterparty, addBalanceOwner, revertFunds } from "./utils/operation";
import { fetchStorage } from "./utils/tzkt";
import { getAccount } from "./utils/wallet";

const App = () => {
  // Players holding lottery tickets
  const [account, setAccount] = useState("");
  const [parties, setParties] = useState({ owner: '', counterparty: '', admin: ''});
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [loadingCounterparty, setLoadingCounterparty] = useState(false);
  const [loadingRevertFunds, setLoadingRevertFunds] = useState(false);
  const [loadingClaimCounterparty, setLoadingClaimCounterparty] = useState(false);
  const [loadingClaimOwner, setLoadingClaimOwner] = useState(false);
  const [secret, setSecret] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    (async () => {
      // TODO 5.b - Get the active account
      const account = await getAccount();
      setAccount(account);
    })();
  }, []);

  // Set players and tickets remaining
  useEffect(() => {
    // TODO 9 - Fetch players and tickets remaining from storage
    (async () => {
      const storage = await fetchStorage();
      setParties({ owner: storage.owner, counterparty: storage.counterparty, admin: storage.admin});
    })();
  }, []);

  // TODO 7.a - Complete onBuyTicket function
  const onAddBalanceOwner = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to add balance to owner?");
      if (confirmed) {
        setLoadingOwner(true);
        await addBalanceOwner();
        alert("Transaction successful");
      }
    } catch(e) {
      if (e.data?.[1]?.with?.string) {
        const errorMessage = e.data[1].with.string;
        alert(`Transaction failed: ${errorMessage}`);
      }
      else {
        const errorMessage = e.description;
        alert(`Transaction failed: ${errorMessage}`);
      }
    } finally {
      setLoadingOwner(false);
    }
  };

  // TODO 11.a - Complete onEndGame function
  const onAddBalanceCounterparty = async () => {    
    try {
      const confirmed = window.confirm("Are you sure you want to add balance to counterparty?");
      if (confirmed) {
        setLoadingCounterparty(true);
        await addBalanceCounterparty();
        alert("Transaction successful");
      }
    } catch(e) {
      if (e.data?.[1]?.with?.string) {
        const errorMessage = e.data[1].with.string;
        alert(`Transaction failed: ${errorMessage}`);
      }
      else {
        const errorMessage = e.description;
        alert(`Transaction failed: ${errorMessage}`);
      }
    } finally {
      setLoadingCounterparty(false);
    }
  };

  const onClaimCounterparty = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to claim as counterparty?");
      if (confirmed) {
        setShowPopup(true);
      }
    } catch(e) {
      throw e;
    }
  };

  const onClaimCounterpartyConfirmed = async () => {
    try {
      setLoadingClaimCounterparty(true);
      await claimCounterParty(secret);
      alert("Transaction successful");
    } catch(e) {
      if (e.data?.[1]?.with?.string) {
        const errorMessage = e.data[1].with.string;
        alert(`Transaction failed: ${errorMessage}`);
      }
      else {
        let errorMessage = "";
        e.description ? errorMessage = e.description : errorMessage = e;
        alert(`Transaction failed: ${errorMessage}`);
      }
    } finally {
      setLoadingClaimCounterparty(false);
      setShowPopup(false);
      setSecret("");
    }
  };

  const onClaimOwner = async () => {
    try {
      const confirmed = window.confirm("Are you sure you want to claim as owner?");
      if (confirmed) {
        setLoadingClaimOwner(true);
        await claimOwner();
        alert("Transaction successful");
      }
    } catch(e) {
      if (e.data?.[1]?.with?.string) {
        const errorMessage = e.data[1].with.string;
        alert(`Transaction failed: ${errorMessage}`);
      }
      else {
        const errorMessage = e.description;
        alert(`Transaction failed: ${errorMessage}`);
      }
    } finally {
      setLoadingClaimOwner(false);
    }
  };

  const onRevertFunds = async () => {
    try {
      let confirmed = false;
      if (account === parties.owner || account === parties.counterparty) {
        confirmed = window.confirm("Do you agree to agree to revert funds for this contract?");
      }
      else if (account === parties.admin) {
        confirmed = window.confirm("Do you agree to revert the funds for this contract?");
      }
      if (confirmed) {
        setLoadingRevertFunds(true);
        await revertFunds()
        if (account === parties.admin) {
          alert("Funds reverted successfully");
        }
        else {
          alert("You have agreed to revert funds for this contract. Please wait for the admin to confirm the transaction.");
        }
      }
    } catch(e) {
      if (e.data?.[1]?.with?.string) {
        const errorMessage = e.data[1].with.string;
        alert(`Transaction failed: ${errorMessage}`);
      }
      else {
        const errorMessage = e.description;
        alert(`Transaction failed: ${errorMessage}`);
      }
    } finally {
      setLoadingRevertFunds(false);
    }
  };

  return (
    <div className="h-100">
      <Navbar />
      <div className="d-flex flex-column justify-content-center align-items-center h-100">
        <div className="contract-container">
          <div className="contract-info">
            <p>{parties.owner ? "Owner: " + parties.owner : ''}</p>
            <p>{parties.counterparty ? "Counterparty: " + parties.counterparty : ''}</p>
          </div>
          <div className="button-row">
            <button onClick={onAddBalanceOwner} className="btn btn-primary btn-lg" disabled={ account !== parties.owner }>
              { loadingOwner ? "Loading..." : "Add Balance Owner" }
            </button>
            <button onClick={onClaimOwner} className="btn btn-primary btn-lg" disabled={ account !== parties.owner }>
              { loadingClaimOwner ? "Loading..." : "Claim Owner" }
            </button>
          </div>
          <div className="button-row">
            <button onClick={onAddBalanceCounterparty} className="btn btn-primary btn-lg" disabled={ account !== parties.counterparty }>
              { loadingCounterparty ? "Loading..." : "Add Balance Counterparty" }
            </button>
            <button onClick={onClaimCounterparty} className="btn btn-primary btn-lg" disabled={ account !== parties.counterparty }>
              { loadingClaimCounterparty ? "Loading..." : "Claim Counterparty" }
            </button>
          </div>
          { showPopup && (
            <div className="popup-container">
              <div>Enter Secret:</div>
              <input type="text" value={secret} onChange={(e) => setSecret(e.target.value)} />
              < br />
              <button onClick={onClaimCounterpartyConfirmed} className="btn btn-add">
                Confirm
              </button>
              <button onClick={() => setShowPopup(false)} className="btn btn-neg">
                Cancel
              </button>
            </div>
          ) }
          <button onClick={onRevertFunds} className="btn btn-primary btn-lg" disabled={ account !== parties.owner && account !== parties.counterparty && account !== parties.admin }>
            { loadingRevertFunds ? "Loading..." : "Revert Funds" }
          </button>
        </div>
      </div>
    </div>
  );
};
export default App;
