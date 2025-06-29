import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { Address } from "viem";
import { Subname } from "./Types";
import { useAppConfig } from "./AppConfigContext";
import { mainnet } from "viem/chains";

interface UsePrimarySubnameProps {
  subnames: Subname[];
  ownerAddress?: Address;
}

export const usePrimarySubname = ({ subnames, ownerAddress }: UsePrimarySubnameProps) => {
  const { listingChainId } = useAppConfig();
  const publicClient = usePublicClient({ chainId: listingChainId });
  const mainnetClient = usePublicClient({ chainId: mainnet.id });
  const [primarySubname, setPrimarySubname] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const findPrimarySubname = async () => {
      if (!ownerAddress || subnames.length === 0) {
        setPrimarySubname(null);
        return;
      }

      setIsLoading(true);

      try {
        // For primary resolution, we need to use mainnet client
        const clientToUse = listingChainId === mainnet.id ? publicClient : mainnetClient;
        
        if (!clientToUse) {
          // Fall back to first subname if no client available
          setPrimarySubname(subnames[0]?.name || null);
          return;
        }

        // Use the client to get the primary ENS name for this address
        const primaryName = await clientToUse.getEnsName({
          address: ownerAddress,
        });

        console.log("Primary ENS name for address:", ownerAddress, "is:", primaryName);

        // Check if the primary name matches any of our subnames
        if (primaryName) {
          const matchingSubname = subnames.find(subname => 
            subname.name.toLowerCase() === primaryName.toLowerCase()
          );
          
          if (matchingSubname) {
            setPrimarySubname(primaryName);
          } else {
            // If no exact match, fall back to first subname
            setPrimarySubname(subnames[0]?.name || null);
          }
        } else {
          // If no primary name set, fall back to first subname
          setPrimarySubname(subnames[0]?.name || null);
        }
      } catch (error) {
        console.error("Error fetching primary ENS name:", error);
        // Fall back to first subname on error
        setPrimarySubname(subnames[0]?.name || null);
      } finally {
        setIsLoading(false);
      }
    };

    findPrimarySubname();
  }, [subnames, ownerAddress, publicClient, mainnetClient, listingChainId]);

  return {
    primarySubname,
    isLoading,
    isPrimary: (subnamesName: string) => 
      primarySubname?.toLowerCase() === subnamesName.toLowerCase()
  };
};
