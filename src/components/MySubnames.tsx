import {
  Box,
  Button,
  Flex,
  Grid,
  Spinner,
  Text,
  Image,
  Input,
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

  return (
    <Grid
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      paddingTop={{ base: "20px", md: "30px" }}
      maxWidth="800px"
      mx="auto"
      px={{ base: 2, md: 4 }}
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
        mb={8}
        alignSelf="center"
        width="100%"
      >
        <Text
          mt={0}
          mb={0}
          color={themeVariables.dark}
          fontSize={{ base: "32px", md: "48px" }}
          textAlign="center"
          fontWeight="700"
          className="londrina-solid"
        >
          {items.length > 0
            ? `${items.length} names minted`
            : "No names minted"}
        </Text>
      </Box>

      {/* Search Input - styled to be part of the page */}
      {allSubnames.length > 0 && (
        <Box width="100%" maxWidth="600px" mb={6} px={{ base: 2, md: 0 }}>
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search names"
            bg="white"
            borderRadius="12px"
            border="2px solid #e2e8f0"
            _hover={{ borderColor: "#cbd5e0" }}
            _focus={{ borderColor: themeVariables.accent, boxShadow: "none" }}
            height={{ base: "44px", md: "48px" }}
            fontSize={{ base: "14px", md: "16px" }}
            fontWeight="500"
          />
        </Box>
      )}

      <Box
        bg="white"
        borderRadius="16px"
        width="100%"
        maxWidth="600px"
        overflow="hidden"
        minHeight="300px"
        mx={{ base: 2, md: 0 }}
      >
        {isFetching && (
          <Flex alignItems="center" justifyContent="center" height="300px">
            <Spinner
              color={themeVariables.accent}
              width="60px"
              height="60px"
            />
          </Flex>
        )}
        {!isFetching && (
          <>
            {allSubnames.length === 0 && (
              <>
                {!filterApplied && (
                  <Flex
                    height="300px"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    px={8}
                  >
                    <Text
                      color={themeVariables.dark}
                      fontSize={24}
                      mb={8}
                      textAlign="center"
                      className="courier-prime"
                    >
                      You don't own any names.
                    </Text>
                    <Button
                      onClick={() => setView("mint")}
                      height={{ base: "44px", md: "48px" }}
                      px={{ base: 4, md: 6 }}
                      color="white"
                      bg="#069420"
                      _hover={{ bg: "#04891c" }}
                      className="londrina-solid"
                      fontSize={{ base: "16px", md: "18px" }}
                      borderRadius="12px"
                      fontWeight="bold"
                    >
                      <Box as="span" display="flex" alignItems="center">
                        <Image 
                          src="/inline.svg" 
                          height={{ base: "16px", md: "20px" }} 
                          mr={{ base: 1, md: 2 }} 
                        />
                        <Text display={{ base: "none", sm: "block" }} mb={0}>
                          Mint a name
                        </Text>
                      </Box>
                    </Button>
                  </Flex>
                )}
                {filterApplied && (
                  <Flex
                    height="300px"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    px={8}
                  >
                    <Text color="#666" fontSize={20} mb={6} textAlign="center">
                      No names match your search
                    </Text>
                    <Button
                      onClick={() => setSearchFilter("")}
                      color="white"
                      bg={themeVariables.accent}
                      _hover={{ bg: "#dd6b20" }}
                      borderRadius="8px"
                      px={6}
                      height="40px"
                    >
                      Clear search
                    </Button>
                  </Flex>
                )}
              </>
            )}
            {allSubnames.length > 0 && (
              <Box>
                {allSubnames
                  .filter((i) => {
                    if (searchFilter.length === 0) {
                      return true;
                    }
                    return i.name.toLowerCase().includes(searchFilter.toLowerCase());
                  })
                  .map((subname, index) => (
                    <Flex
                      key={subname.name + "-" + index}
                      alignItems="center"
                      p={{ base: 3, md: 4 }}
                      _hover={{ bg: "#f7fafc" }}
                      transition="background-color 0.2s"
                      width="100%"
                      justifyContent="space-between"
                      gap={{ base: 1, sm: 0 }}
                    >
                      <Flex 
                        alignItems="center" 
                        flex="1" 
                        width={{ base: "100%", sm: "auto" }}
                      >
                        <Image
                          src={subname.texts?.avatar || noImage}
                          width={{ base: "32px", md: "40px" }}
                          height={{ base: "32px", md: "40px" }}
                          borderRadius="8px"
                          backgroundColor="#f1f1f1"
                        />
                        <Text
                          fontSize={{ base: "14px", md: "16px" }}
                          ml={{ base: 3, md: 4 }}
                          fontWeight="600"
                          mb={0}
                          color="black"
                          fontFamily="'Satoshi', sans-serif"
                        >
                          {subname.name}
                        </Text>
                        {index === 0 && (
                          <Box
                            ml={3}
                            mr={{ base: 0, sm: 2 }}
                            px={2}
                            py={1}
                            bg="black"
                            color="white"
                            fontSize={{ base: "10px", md: "12px" }}
                            borderRadius="12px"
                            fontWeight="600"
                            fontFamily="'Satoshi', sans-serif"
                            className="satoshi-font"
                            display="flex"
                            alignItems="center"
                          >
                            <Image 
                              src="/inline.svg" 
                              height={{ base: "10px", md: "12px" }} 
                              mr={1} 
                              display={{ base: "block", sm: "block" }}
                            />
                            <Text display={{ base: "none", sm: "block" }} mb={0}>
                              Primary
                            </Text>
                          </Box>
                        )}
                      </Flex>
                      <Button
                        onClick={() => setSelectedSubname(subname)}
                        size="sm"
                        color="#3182ce"
                        bg="#ebf8ff"
                        _hover={{ bg: "#ebf8ff", color: "#2c5aa0" }}
                        fontWeight="600"
                        fontSize={{ base: "12px", md: "14px" }}
                        px={{ base: 2, md: 3 }}
                        height={{ base: "28px", md: "32px" }}
                        borderRadius="6px"
                        className="satoshi-font"
                        fontFamily="'Satoshi', sans-serif"
                        display="flex"
                        alignItems="center"
                        minWidth={{ base: "auto", sm: "auto" }}
                        gap={{ base: 1, sm: 2 }}
                      >
                        <Image 
                          src="/settings.svg" 
                          height={{ base: "14px", md: "16px" }}
                          color="#3182ce"
                        />
                        <Text display={{ base: "none", sm: "block" }} mb={0}>
                          Manage name
                        </Text>
                      </Button>
                    </Flex>
                  ))}
              </Box>
            )}
          </>
        )}
      </Box>
      
      {/* Info box */}
      {allSubnames.length > 0 && (
        <Box
          mt={6}
          p={4}
          bg="#fff3cd"
          borderRadius="12px"
          fontSize="14px"
          textAlign="center"
          maxWidth="600px"
          width="100%"
          border="1px solid #ffeaa7"
        >
          <Text mb={0} color="#856404" fontWeight="500">
            Manage name navigates to ens.app: https://app.ens.domains/{"{name}"}
          </Text>
        </Box>
      )}

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
