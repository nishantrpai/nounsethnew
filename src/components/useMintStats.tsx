import { useEffect, useState } from "react";
import { useAppConfig } from "./AppConfigContext";
import { ENS_CLIENT } from "./ens/ens-client";
import axios from "axios";

interface MintStats {
  totalMinted: number;
  recentMints: string[];
  isLoading: boolean;
  error: string | null;
}

export const useMintStats = () => {
  const [stats, setStats] = useState<MintStats>({
    totalMinted: 0,
    recentMints: [],
    isLoading: true,
    error: null,
  });

  const { listingChainId, listedName, listingType } = useAppConfig();

  useEffect(() => {
    const fetchMintStats = async () => {
      if (!listingChainId || !listedName) return;

      try {
        setStats(prev => ({ ...prev, isLoading: true, error: null }));
        
        let totalMinted = 0;
        let recentMints: string[] = [];

        if (listingType === "L1") {
          // For L1 (ENS), use ENS_CLIENT
          const subnames = await ENS_CLIENT.getSubnames({
            name: listedName,
            searchString: "",
            orderBy: "createdAt",
            orderDirection: "desc",
            pageSize: 100,
          });

          totalMinted = subnames?.length || 0;
          recentMints = subnames?.slice(0, 10).map((sub: any) => sub.name) || [];
        } else {
          // For L2, use the indexer API
          const { data } = await axios.get<{
            items: any[];
            totalItems: number;
          }>(`https://indexer.namespace.ninja/api/v1/nodes`, {
            params: {
              parentName: listedName,
              limit: 100,
            },
          });

          totalMinted = data.totalItems || 0;
          recentMints = data.items?.slice(0, 10).map(item => item.name) || [];
        }

        setStats({
          totalMinted,
          recentMints,
          isLoading: false,
          error: null,
        });

      } catch (error) {
        console.error("Error fetching mint stats:", error);
        setStats(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to fetch mint statistics",
        }));
      }
    };

    fetchMintStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchMintStats, 30000);
    
    return () => clearInterval(interval);
  }, [listingChainId, listedName, listingType]);

  return stats;
};
