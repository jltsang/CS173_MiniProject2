// TODO 8 - Fetch storage of the Escrow by completing fetchStorage
import axios from "axios";

export const fetchStorage = async () => {
    const res = await axios.get(
        "https://api.ghostnet.tzkt.io/v1/contracts/KT1UjMGTNq8qmES11mxNTrWueZ9U1tx87Hks/storage/"
    );
    return res.data
};
