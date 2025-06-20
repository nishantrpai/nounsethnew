import {
  Box,
  Button,
  Flex,
  Grid,
  Spinner,
  Text,
  Image,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react";
import { themeVariables } from "@/styles/themeVariables";
import { Subname } from "./Types";
import axios from "axios";
import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { SideModal } from "./SideModal";
import { SingleSubname } from "./SingleSubname";
import { ToastContainer } from "react-toastify";
import { useAppConfig } from "./AppConfigContext";

const fetchSubnames = async (owner: string, parentName: string) => {
  const { data } = await axios.get<{
    items: Subname[];
    totalItems: number;
  }>(`https://indexer.namespace.ninja/api/v1/nodes`, {
    params: {
      owner,
      parentName: parentName,
    },
  });
  return data;
};

interface MySubnamesProps {
  setView: (view: string) => void;
}

export const MySubnames = ({ setView }: MySubnamesProps) => {
  const { listedName } = useAppConfig();
  const { address } = useAccount();
  const [selectedSubname, setSelectedSubname] = useState<Subname>();
  const [searchFilter, setSearchFilter] = useState("");
  const [subnames, setSubnames] = useState<{
    fetching: boolean;
    items: Subname[];
    totalItems: number;
  }>({
    fetching: true,
    items: [],
    totalItems: 0,
  });

  useEffect(() => {
    if (!address) {
      return;
    }

    fetchSubnames(address, listedName).then((res) => {
      setSubnames({
        fetching: false,
        items: res.items,
        totalItems: res.totalItems,
      });
    });
  }, [address]);

  const refreshSubnames = async () => {
    fetchSubnames(address!!, listedName).then((res) => {
      setSubnames({
        fetching: false,
        items: res.items,
        totalItems: res.totalItems,
      });
    });
  };

  let sbnms: Subname[] = [];
  for (let i = 0; i < 10; i++) {
    sbnms = [...sbnms, ...subnames.items];
  }
  const filterApplied = searchFilter.length > 0;

  const allSubnames = useMemo(() => {
    return subnames.items.filter((i) => {
      if (searchFilter.length === 0) {
        return true;
      }
      return i.name.includes(searchFilter.toLocaleLowerCase());
    });
  }, [subnames, searchFilter]);

  const boxPadding = useBreakpointValue({ base: 4, md: 6 });

  return (
    <Grid
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      paddingTop="50px"
      maxWidth="800px"
      mx="auto"
    >
      {selectedSubname !== undefined && (
        <SideModal open={true} onClose={() => setSelectedSubname(undefined)}>
          <SingleSubname
            onUpdate={() => refreshSubnames()}
            subname={selectedSubname}
          />
        </SideModal>
      )}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={10}
        alignSelf="center"
        width="100%"
      >
        <Text
          mt={0}
          mb={6}
          color={themeVariables.dark}
          fontSize="48px"
          textAlign="center"
          fontWeight="700"
        >
          {subnames.totalItems} names minted
        </Text>
      </Box>
      <Box width="100%" alignSelf="center">
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={"Search names"}
            borderRadius="5px"
            width={{ base: "60%", md: "50%" }}
            borderColor="#ccc"
          />
        </Flex>
      </Box>
      <Box
        bg="white"
        p={boxPadding}
        alignSelf="center"
        shadow="md"
        height="400px"
        position="relative"
        border="1px solid"
        borderColor={themeVariables.accent}
      >
        {subnames.fetching && (
          <Flex alignItems="center" justifyContent="center" height="100%">
            <Spinner
              color={themeVariables.accent}
              width={200}
              height={200}
              animationDuration="1.3s"
              borderWidth="3px"
            />
          </Flex>
        )}
        {!subnames.fetching && (
          <>
            {allSubnames.length === 0 && (
              <>
                {!filterApplied && (
                  <Flex
                    height="100%"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color={themeVariables.accent} fontSize={24} mb={10}>
                      You don't own any subname
                    </Text>
                    <Button
                      onClick={() => setView("mint")}
                      width="50%"
                      color={themeVariables.light}
                      bg={themeVariables.accent}
                    >
                      Register
                    </Button>
                  </Flex>
                )}
                {filterApplied && (
                  <Flex
                    height="100%"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color={themeVariables.accent} fontSize={24} mb={10}>
                      No subnames with search criteria
                    </Text>
                    <Button
                      onClick={() => setSearchFilter("")}
                      width="50%"
                      color={themeVariables.light}
                      bg={themeVariables.accent}
                    >
                      Clear
                    </Button>
                  </Flex>
                )}
              </>
            )}
            {allSubnames.length > 0 && (
              <>
                {allSubnames
                  .filter((i) => {
                    if (searchFilter.length === 0) {
                      return true;
                    }
                    return i.name.includes(searchFilter.toLocaleLowerCase());
                  })
                  .map((subname, index) => (
                    <Flex
                      key={subname.name + "-" + index}
                      alignItems="center"
                      p={3}
                      borderBottom="1px solid #ccc"
                      cursor="pointer"
                      width="100%"
                      justifyContent="space-between"
                    >
                      <Flex alignItems="center">
                        <Image
                          src={subname.texts["avatar"]}
                          width="35px"
                          height="35px"
                          borderRadius="full"
                          backgroundColor="#f1f1f1"
                        />
                        <Text
                          fontSize="16px"
                          ml={4}
                          fontWeight="500"
                          mb={0}
                          color="black"
                        >
                          {subname.name}.noun.eth
                        </Text>
                        {index === 0 && (
                          <Box ml={2} px={2} py={1} bg="black" color="white" fontSize="xs" borderRadius="2px">
                            Primary
                          </Box>
                        )}
                      </Flex>
                      <Button 
                        onClick={() => setSelectedSubname(subname)}
                        size="sm"
                        color="blue.500"
                      >
                        Manage name
                      </Button>
                    </Flex>
                  ))}
              </>
            )}
          </>
        )}
      </Box>
      <Box mt={5} p={3} bg="#f8a100" borderRadius="5px" fontSize="0.9em" textAlign="left" maxWidth="600px" width="100%">
        <Text mb={0}>
          Manage name navs users to ens.app: https://app.ens.domains/{"{name}"}
        </Text>
      </Box>
      <ToastContainer
        toastStyle={{
          backgroundColor: themeVariables.accent,
          color: themeVariables.light,
        }}
        hideProgressBar
      />
    </Grid>
  );
};
