import { addEnsContracts, ensPublicActions, ensSubgraphActions } from "@ensdomains/ensjs";
import { createPublicClient, publicActions } from "viem";
import { mainnet } from "viem/chains";
import { http } from "viem";

export const ENS_CLIENT = createPublicClient({
    chain: {
        ...addEnsContracts(mainnet),
        subgraphs: {
            ens: {
                url: "https://api.thegraph.com/subgraphs/name/ensdomains/ens"
            }
        }
    },
    transport: http()
}).extend(publicActions).extend(ensPublicActions).extend(ensSubgraphActions);
