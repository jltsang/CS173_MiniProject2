// TODO 2.a - Setup a Beacon Wallet instance
import { BeaconWallet } from "@taquito/beacon-wallet";

export const wallet = new BeaconWallet({
    name: "Escrow Contract",
    preferredNetwork: "ghostnet",
})

// TODO 2.b - Complete connectWallet function (for ghostnet)
export const connectWallet = async () => {
    await wallet.requestPermissions({ network: {type: "ghostnet"} });
};

// TODO 2.c - Complete disconnectWallet function
export const disconnectWallet = async () => {
    await wallet.clearActiveAccount();
};

// TODO 2.c - Complete getAccount function
export const getAccount = async () => {
    const connectedWallet = await wallet.client.getActiveAccount();
    if (connectedWallet) {
        return connectedWallet.address;
    }
    else {
        return "";
    }
};
