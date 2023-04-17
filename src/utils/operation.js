import { tezos } from "./tezos"

export const addBalanceOwner = async () => {
    try {
        const contract = await tezos.wallet.at("KT1UjMGTNq8qmES11mxNTrWueZ9U1tx87Hks");
        const op = await contract.methods.addBalanceOwner().send({
            amount: 50,
            mutez: false,
        })

        await op.confirmation(1);
    } 
    catch(err) {
        throw err;
    }
};

export const addBalanceCounterparty = async () => {
    try {
        const contract = await tezos.wallet.at("KT1UjMGTNq8qmES11mxNTrWueZ9U1tx87Hks");
        const op = await contract.methods.addBalanceCounterparty().send({
            amount: 4,
            mutez: false,
        })

        await op.confirmation(1);
    } 
    catch(err) {
        throw err;
    }
};

export const claimOwner = async () => {
    try {
        const contract = await tezos.wallet.at("KT1UjMGTNq8qmES11mxNTrWueZ9U1tx87Hks")
        const op = await contract.methods.claimOwner().send()

        await op.confirmation(1);
    }
    catch (err) {
        throw err;
    }
};

export const claimCounterParty = async (secret) => {
    try {
        const byteArray = secret.slice(2);
        const hexString = Buffer.from(byteArray, "hex").toString("hex");
                
        const contract = await tezos.wallet.at("KT1UjMGTNq8qmES11mxNTrWueZ9U1tx87Hks")
        const op = await contract.methods.claimCounterparty(hexString).send()

        await op.confirmation(1);
    }
    catch (err) {
        throw err;
    }
};

export const revertFunds = async () => {
    try {
        const contract = await tezos.wallet.at("KT1UjMGTNq8qmES11mxNTrWueZ9U1tx87Hks")
        const op = await contract.methods.revertFunds().send()

        await op.confirmation(1);
    }
    catch (err) {
        throw err;
    }
};