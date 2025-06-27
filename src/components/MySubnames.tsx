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
import { useAccount } from "wagmi";
import { useMemo, useState } from "react";
import { SideModal } from "./SideModal";
import { SingleSubname } from "./SingleSubname";
import { ToastContainer } from "react-toastify";
import { useAppConfig } from "./AppConfigContext";
import { useSubnames } from "./useSubnames";
import noImage from "../assets/no-avatar.png";

interface MySubnamesProps {
  setView: (view: string) => void;
}

export const MySubnames = ({ setView }: MySubnamesProps) => {
  const { listedName, listingType } = useAppConfig();
  const { address } = useAccount();
  const [selectedSubname, setSelectedSubname] = useState<Subname>();
  const [searchFilter, setSearchFilter] = useState("");

  const { isFetching, items, refetch } = useSubnames({
    owner: address,
    parentName: listedName,
    subnameType: listingType,
  });

  const allSubnames = useMemo(() => {
    return items.filter((i) => {
      if (searchFilter.length === 0) {
        return true;
      }
      return i.name.includes(searchFilter.toLocaleLowerCase());
    });
  }, [items, searchFilter]);

  const filterApplied = searchFilter.length > 0;

  const boxPadding = useBreakpointValue({ base: 4, md: 6 });

  return (
    <Grid
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      paddingTop="30px"
      maxWidth="800px"
      mx="auto"
      px={4}
    >
      {selectedSubname !== undefined && (
        <SideModal open={true} onClose={() => setSelectedSubname(undefined)}>
          <SingleSubname
            onUpdate={() => refetch()}
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
          mb={0}
          color={themeVariables.dark}
          fontSize="48px"
          textAlign="center"
          fontWeight="700"
          className="londrina-solid"
        >
          {items.length > 0
            ? `${items.length} names minted`
            : "No names minted"}
        </Text>
      </Box>
      {allSubnames.length ? (
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
      ) : null}
      <Box
        bg="white"
        p={boxPadding}
        alignSelf="center"
        shadow="none"
        height="300px"
        width="100%"
        maxWidth="600px"
        position="relative"
        border="1px solid none"
        borderColor={themeVariables.accent}
      >
        {isFetching && (
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
        {!isFetching && (
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
                    <Text
                      color={themeVariables.dark}
                      fontSize={24}
                      mb={8}
                      className="courier-prime"
                    >
                      You don't own any names.
                    </Text>{" "}
                    <Button
                      onClick={() => setView("mint")}
                      height="45px"
                      width="auto"
                      paddingX={5}
                      color={themeVariables.light}
                      bg="#069420"
                      _hover={{ bg: "#009612" }}
                      className="londrina-solid"
                      fontSize="20px"
                      borderRadius="5px"
                    >
                      <Box as="span" display="flex" alignItems="center">
                        <Image src="/inline.svg" height="22px" mr={2} />
                        Mint a name
                      </Box>
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
                          src={subname.texts?.avatar || noImage}
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
                          {subname.name}
                        </Text>
                        {index === 0 && (
                          <Box
                            ml={2}
                            px={2}
                            py={1}
                            bg="black"
                            color="white"
                            fontSize="xs"
                            borderRadius="2px"
                          >
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
      <Box
        display={allSubnames.length > 0 ? "block" : "none"}
        mt={5}
        p={3}
        bg="#f8a100"
        borderRadius="5px"
        fontSize="0.9em"
        textAlign="left"
        maxWidth="600px"
        width="100%"
      >
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
