import axios from "axios";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { ENS_CLIENT } from "./ens/ens-client";
import { KnownTexts } from "./records/TextRecords";
import { KnownAddresses } from "./records/Addresses";
import { Subname, EnsRecords } from "./Types";

const fetchL2Subnames = async (owner: string, parentName: string) => {
  const { data } = await axios.get<{
    items: Subname[];
    totalItems: number;
  }>(`https://indexer.namespace.ninja/api/v1/nodes`, {
    params: {
      owner,
      parentName: parentName,
    },
  });
  return data.items;
};

const fetchL1Subnames = async (owner: Address, parentName: string) => {
  try {
    const subnamesFetched = await ENS_CLIENT.getSubnames({
      name: parentName,
      searchString: "",
      orderBy: "labelName",
      orderDirection: "asc",
      pageSize: 100,
    });

    if (!subnamesFetched || subnamesFetched.length === 0) {
      return [];
    }

    const filteredSubnames = subnamesFetched.filter(
      (subname: any) => subname.wrappedOwner?.id?.toLowerCase() === owner.toLowerCase()
    );

    const subnamesWithRecords = [];

    for (const subname of filteredSubnames) {
      const subdomain = `${subname.labelName}.${parentName}`;

      const recordsRes = await ENS_CLIENT.getRecords({
        name: subdomain,
        texts: Object.values(KnownTexts).map((text) => text.key),
        coins: Object.values(KnownAddresses).map((address) => address.coinType),
      });

      const records: EnsRecords = {
        texts: {},
        addresses: {},
      };

      if (recordsRes.texts) {
        for (const text of recordsRes.texts) {
          if (text.value) {
            records.texts[text.key] = text.value;
          }
        }
      }

      if (recordsRes.coins) {
        for (const coin of recordsRes.coins) {
          if (coin.value) {
            records.addresses[coin.name] = coin.value;
          }
        }
      }

      const subnameToReturn: Subname = {
        name: subdomain,
        label: subname.labelName || "",
        expiry: subname.expiryDate?.value || 0,
        texts: records.texts,
        addresses: records.addresses,
      };

      subnamesWithRecords.push(subnameToReturn);
    }

    return subnamesWithRecords;
  } catch (error) {
    console.error("Error fetching L1 subnames:", error);
    return [];
  }
};

interface UseSubnamesState {
  isFetching: boolean;
  isL1Subnames: boolean;
  items: Subname[];
}

interface UseSubnamesProps {
  owner?: string;
  parentName: string;
  subnameType: "L1" | "L2";
}

export const useSubnames = ({
  owner,
  parentName,
  subnameType,
}: UseSubnamesProps) => {
  const [state, setState] = useState<UseSubnamesState>({
    isFetching: true,
    isL1Subnames: false,
    items: [],
  });

  useEffect(() => {
    if (!owner) {
      setState({
        isFetching: false,
        isL1Subnames: false,
        items: [],
      });
      return;
    }

    setState((prev) => ({ ...prev, isFetching: true }));

    const fetchFunc = subnameType === "L1" ? fetchL1Subnames : fetchL2Subnames;

    fetchFunc(owner as Address, parentName)
      .then((res) => {
        setState({
          isFetching: false,
          isL1Subnames: subnameType === "L1",
          items: res,
        });
      })
      .catch((err) => {
        console.error(err)
        setState({
          isFetching: false,
          isL1Subnames: subnameType === "L1",
          items: [],
        });
      });
  }, [owner, parentName, subnameType]);

  const refetch = () => {
    if (!owner) return;

    setState((prev) => ({ ...prev, isFetching: true }));

    const fetchFunc = subnameType === "L1" ? fetchL1Subnames : fetchL2Subnames;

    fetchFunc(owner as Address, parentName)
      .then((res) => {
        setState({
          isFetching: false,
          isL1Subnames: subnameType === "L1",
          items: res,
        });
      })
      .catch((err) => {
        console.error(err)
        setState({
          isFetching: false,
          isL1Subnames: subnameType === "L1",
          items: [],
        });
      });
  };

  return {
    ...state,
    refetch,
  };
};
