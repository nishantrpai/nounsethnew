import { useAccount } from "wagmi";
import logo from "../assets/logo.png";
import { Grid, Box, Button, Image, Text, Link, Flex, useBreakpointValue } from "@chakra-ui/react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { themeVariables } from "@/styles/themeVariables";
import { useEffect } from "react";

interface TopNavigationProps {
  setView: (view: string) => void;
}

export const TopNavigation = ({ setView }: TopNavigationProps) => {
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) {
      setView("mint");
    }
  }, [isConnected]);


  const logoHeight = useBreakpointValue({ base: "40px", md: "40px" });
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
            <Image
              height={logoHeight}
              src={logo}
              alt="Logo"
            />
            {showText && (
              <Text fontSize={fontSize} fontWeight="bold" color={themeVariables.accent} ml={3} mb={0}>
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
            <ConnectButton chainStatus="none" showBalance={false} accountStatus="address"/>
          )}
        </Flex>
      </Grid>
    </Box>
  );
};