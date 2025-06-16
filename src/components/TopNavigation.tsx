import { useAccount } from "wagmi";
import {
  Grid,
  Box,
  Button,
  Text,
  Link,
  Flex,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { themeVariables } from "@/styles/themeVariables";
import { useEffect, useState } from "react";

interface TopNavigationProps {
  setView: (view: string) => void;
}

export const TopNavigation = ({ setView }: TopNavigationProps) => {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setView("mint");
    }
  }, [isConnected]);

  // Font sizes for responsive design
  const fontSize = useBreakpointValue({ base: "lg", md: "xl" });
  const padding = useBreakpointValue({ base: 2, md: 4 });
  const showText = useBreakpointValue({ base: false, md: false });

  return (
    <Box
      bg={themeVariables.light}
      p={padding}
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
      width="100%"
    >
      <Grid
        templateColumns={{ base: "1fr auto", md: "auto 1fr" }}
        alignItems="center"
        maxWidth="1250px"
        margin="0 auto"
      >
        <Grid templateColumns="auto auto" alignItems="center">
          <Link textDecoration="none" onClick={() => setView("mint")}>
            <Image src={"/favicon.svg"} onClick={() => {
              setIsCopied(true);
              navigator.clipboard.writeText("⌐◨-◨");
              setTimeout(() => setIsCopied(false), 2000);
            }} />{" "}
            {/* when copied is clicked a black banner slightly tilted upwards with boxshadow will show for few seconds*/}
            { isCopied && (
              <Box
              // ease-in-out transition
                transform="translateX(-60%) translateY(100%) rotate(-15deg)"
                bg="black"
                color="white"
                p={2}
                borderRadius="md"
                boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                zIndex={1000}
              >
                Copied ⌐◨-◨ to clipboard!
              </Box>
            )}
            {/* <Text 
              fontSize="28px" 
              fontWeight="bold"
              className="nouns-logo-red"
              title="Click to copy"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText("⌐◨-◨");
                alert("Copied ⌐◨-◨ to clipboard!");
              }}
            >
              ⌐◨-◨
            </Text> */}
            {showText && (
              <Text
                fontSize={fontSize}
                fontWeight="bold"
                color={themeVariables.accent}
                ml={3}
                mb={0}
              >
                WAGMI
              </Text>
            )}
          </Link>
        </Grid>
        <Flex textAlign="right" ml="auto" alignItems="center">
          {isConnected && (
            <Box display="flex" alignItems="center">
              <Link
                onClick={() => setView("mint")}
                fontWeight="500"
                mr={4}
                textDecoration="none"
                color="black"
                _hover={{ textDecoration: "underline" }}
              >
                Mint
              </Link>
              <Link
                onClick={() => setView("subnames")}
                fontWeight="500"
                mr={4}
                textDecoration="none"
                color="black"
                _hover={{ textDecoration: "underline" }}
              >
                My names
              </Link>
            </Box>
          )}
          {!isConnected ? (
            <Button
              onClick={() => openConnectModal?.()}
              bg="#333"
              color={themeVariables.light}
              borderRadius="5px"
              _hover={{ bg: "#222" }}
            >
              Connect Wallet
            </Button>
          ) : (
            <ConnectButton
              chainStatus="none"
              showBalance={false}
              accountStatus="address"
            />
          )}
        </Flex>
      </Grid>
    </Box>
  );
};
