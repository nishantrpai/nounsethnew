import { useCallback, useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Input,
  Link,
  Spinner,
  Text,
  Image,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useNamepsaceClient } from "./useNamespaceClient";
import { normalize } from "viem/ens";
import { debounce } from "lodash";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Address, Hash, parseAbi } from "viem";
import { FaArrowDown, FaArrowUp, FaX } from "react-icons/fa6";
import { themeVariables } from "@/styles/themeVariables";
import { toast, ToastContainer } from "react-toastify";
import { mainnet, sepolia } from "viem/chains";
import { useAppConfig } from "./AppConfigContext";
import { MintSuccess } from "./MintSuccess";

enum RegistrationStep {
  START = 0,
  TX_SENT = 1,
  PRIMARY_NAME = 2,
  COMPLETE = 3,
}

// No coin type constants needed

interface MintFormProps {
  onSuccessfulMint?: () => void;
}

export const MintForm = ({ onSuccessfulMint }: MintFormProps) => {
  const { isRenting, listedName, listingChainId, isTestnet, defaultAvatarUri } =
    useAppConfig();

  // Helper function to get the correct Etherscan URL for transaction
  const getEtherscanUrl = (txHash: string) => {
    switch (listingChainId) {
      case mainnet.id:
        return `https://etherscan.io/tx/${txHash}`;
      case sepolia.id:
        return `https://sepolia.etherscan.io/tx/${txHash}`;
      case 8453: // Base
        return `https://basescan.org/tx/${txHash}`;
      case 84532: // Base Sepolia
        return `https://sepolia.basescan.org/tx/${txHash}`;
      case 42161: // Arbitrum One
        return `https://arbiscan.io/tx/${txHash}`;
      case 421614: // Arbitrum Sepolia
        return `https://sepolia.arbiscan.io/tx/${txHash}`;
      case 10: // Optimism
        return `https://optimistic.etherscan.io/tx/${txHash}`;
      case 11155420: // Optimism Sepolia
        return `https://sepolia-optimism.etherscan.io/tx/${txHash}`;
      case 137: // Polygon
        return `https://polygonscan.com/tx/${txHash}`;
      case 80002: // Polygon Amoy (testnet)
        return `https://amoy.polygonscan.com/tx/${txHash}`;
      default:
        // Default to mainnet etherscan for unknown chains
        return `https://etherscan.io/tx/${txHash}`;
    }
  };

  const [label, setLabel] = useState("");
  const { address, chainId } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { checkAvailable, mintParameters, executeTx, waitForTx } =
    useNamepsaceClient();
  const [mintError, setMintError] = useState<string>("");
  const [txHash, setTxHash] = useState<Hash>();
  const { switchChainAsync } = useSwitchChain();
  const [indicators, setIndicators] = useState<{
    checking: boolean;
    available: boolean;
  }>({
    available: false,
    checking: false,
  });
  const [mintIndicators, setMintIndicator] = useState<{
    waiting: boolean;
    btnLabel: string;
  }>({ waiting: false, btnLabel: "Register" });
  const [registrationStep, setRegistrationStep] = useState(
    RegistrationStep.START
  );
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Check if we're in debug mode with URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debugSuccessScreen') === 'true') {
      setLabel('debug-name');
      setRegistrationStep(RegistrationStep.PRIMARY_NAME);
      setShowSuccess(true);
    }
  }, []);

  const [primaryNameIndicators, setPrimaryNameIndicators] = useState<{
    waiting: boolean;
    btnLabel: string;
  }>({ waiting: false, btnLabel: "Set as primary name" });

  let reverseRegistarAbi;
  let reverseRegistar;
  let chainForPrimaryName;
  if (!isTestnet) {
    reverseRegistar = "0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb" as Address;
    reverseRegistarAbi = parseAbi(["function setName(string name)"]);
    chainForPrimaryName = mainnet.id;
  } else {
    reverseRegistar = "0xCF75B92126B02C9811d8c632144288a3eb84afC8" as Address;
    reverseRegistarAbi = parseAbi(["function setName(string _name)"]);
    chainForPrimaryName = sepolia.id;
  }

  const publicClient = usePublicClient({ chainId: chainForPrimaryName });
  const { data: walletClient } = useWalletClient({
    chainId: chainForPrimaryName,
  });
  const [expiryYears, setExpiryYears] = useState(1);

  const handleUpdateLabel = (value: string) => {
    const _value = value.toLocaleLowerCase();
    if (_value.includes(".")) {
      return;
    }
    try {
      normalize(_value);
    } catch (err) {
      return;
    }
    setLabel(_value);

    if (_value.length > 0) {
      setIndicators({ available: false, checking: true });
      debouncedCheck(_value);
    } else {
      setIndicators({ available: false, checking: false });
    }
  };

  const check = async (label: string) => {
    const subnameAvailable = await checkAvailable(label);
    setIndicators({
      available: subnameAvailable,
      checking: false,
    });
  };

  const debouncedCheck = useCallback(
    debounce((label) => check(label), 200),
    []
  );

  const handleMint = async () => {
    if (!address) {
      openConnectModal?.();
      return;
    }

    if (chainId !== listingChainId) {
      await switchChainAsync({ chainId: listingChainId });
    }

    const texts: { key: string; value: string }[] = [];

    if (defaultAvatarUri) {
      texts.push({ key: "avatar", value: defaultAvatarUri });
    }

    try {
      setMintIndicator({ btnLabel: "Waiting for wallet", waiting: true });
      // Simplified mint parameters - don't include address records to avoid coin type errors
      const params = await mintParameters({
        minterAddress: address,
        expiryInYears: expiryYears,
        records: {
          // Removing addresses property completely to avoid coin type issues
          texts: texts,
        },
        label: label,
        parentName: listedName,
        owner: address!,
      });

      const tx = await executeTx(params, address);
      setTxHash(tx);
      setRegistrationStep(RegistrationStep.TX_SENT);
      setMintIndicator({ btnLabel: "Registering...", waiting: true });
      await waitForTx(tx);
      setShowSuccess(true);
      setRegistrationStep(RegistrationStep.PRIMARY_NAME);
      
      // Keep success screen visible until user interaction
      // No auto-hide or auto-navigation - user must now explicitly choose to navigate away
    } catch (err: any) {
      console.error(err);
      if (err?.cause?.details?.includes("User denied transaction signatur")) {
        return;
      } else if (err?.cause?.details?.includes("insufficient funds for")) {
        setMintError(`Insufficient balance`);
      } else {
        parseError(err?.message || "");
      }
    } finally {
      setMintIndicator({ btnLabel: "Register", waiting: false });
    }
  };

  const parseError = (errMessage: string) => {
    if (errMessage.includes("MINTER_NOT_TOKEN_OWNER")) {
      setMintError("You don't have enough tokens for minting!");
    } else if (errMessage.includes("SUBNAME_TAKEN")) {
      setMintError("Subname is already taken");
    } else if (errMessage.includes("MINTER_NOT_WHITELISTED")) {
      setMintError("You are not whitelisted");
    } else if (errMessage.includes("LISTING_EXPIRED")) {
      setMintError("Listing has expired");
    } else if (errMessage.includes("SUBNAME_RESERVED")) {
      setMintError("Subname is reserved");
    } else if (errMessage.includes("VERIFIED_MINTER_ADDRESS_REQUIRED")) {
      setMintError("Verification required");
    } else if (errMessage.includes("Unsupported coin type")) {
      setMintError("Unsupported blockchain configuration");
    } else {
      setMintError("Unknown error occurred. Please try again.");
    }
  };

  const noLabel = label.length === 0;
  const subnameTakenErr =
    !noLabel && !indicators.checking && !indicators.available;
  const mintBtnDisabled =
    noLabel ||
    indicators.checking ||
    !indicators.available ||
    mintIndicators.waiting;

  const boxPadding = useBreakpointValue({ base: 4, md: 6 });
  const subHeadlineFontSize = useBreakpointValue({ base: "16px", md: "22px" });

  const handlePrimaryName = async () => {
    if (chainId !== chainForPrimaryName) {
      await switchChainAsync({ chainId: chainForPrimaryName });
    }

    try {
      setPrimaryNameIndicators({
        btnLabel: "Waiting for wallet",
        waiting: true,
      });

      const resp = await publicClient!!.simulateContract({
        abi: reverseRegistarAbi,
        address: reverseRegistar,
        functionName: "setName",
        args: [`${label}.${listedName}`],
        account: address!!,
      });

      try {
        const tx = await walletClient!!.writeContract(resp.request);
        setPrimaryNameIndicators({ btnLabel: "Processing", waiting: true });

        await publicClient?.waitForTransactionReceipt({
          hash: tx,
          confirmations: 2,
        });
        setRegistrationStep(RegistrationStep.COMPLETE);

        toast("Primary name set successfully!", {
          position: "top-right",
          closeButton: false,
          autoClose: 1500,
        });
      } catch (err: any) {
        if (err.details) {
          toast(err.details, { type: "error" });
        }
      }
    } catch (err: any) {
      if (err.details) {
        toast(err.details, { type: "error" });
      } else if (err.response) {
        toast(err.response?.data?.message, { type: "error" });
      } else {
        console.log(err);
        toast("Unknown error occurred :(", { type: "error" });
      }
    } finally {
      setPrimaryNameIndicators({
        btnLabel: "Set as primary name",
        waiting: false,
      });
    }
  };

  // Debugging effect to bypass minting process
  useEffect(() => {
    const debugSkipMinting = false; // Set to true to skip minting for debugging
    if (debugSkipMinting) {
      setLabel("debugname");
      setRegistrationStep(RegistrationStep.PRIMARY_NAME);
    }
  }, []);

  return (
    <Grid
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      paddingTop={showSuccess ? "20px" : "50px"}
      className={showSuccess ? "success-mode" : ""}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={0}
        alignSelf="center"
        className={showSuccess ? "hidden" : ""}
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
          Nounify Yourself
        </Text>
        <Box
          mt={0}
          mb={0}
          color={themeVariables.dark}
          fontSize={subHeadlineFontSize}
          textAlign="center"
          className="courier-prime tagline-container"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexWrap="nowrap"
          whiteSpace="nowrap"
        >
          Strap on the <Image src={"/inline.svg"} height={6} mx={1} mt={1} />,
          and enter the Nouniverse
        </Box>
      </Box>
      <Box
        bg="transparent"
        p={boxPadding}
        alignSelf="center"
        width="100%"
        maxWidth="600px"
        position="relative"
      >
        <Box paddingTop={6}>
          {registrationStep === RegistrationStep.START && (
            <>
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                mb={4}
              >
                <Box className="input-container" position="relative" flex="1">
                  <Input
                    value={label}
                    placeholder="Choose a name"
                    onChange={(e) => handleUpdateLabel(e.target.value)}
                    bg={themeVariables.light}
                    className="satoshi-font"
                    borderRadius="5px"
                    border="none"
                    p="10px"
                    fontSize="1em"
                    flex="1"
                    pr="7rem"
                    fontFamily="'Satoshi', sans-serif"
                  />
                  <Text
                    position="absolute"
                    right="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize="1em"
                    color="black"
                    pointerEvents="none"
                    className="satoshi-font"
                    fontFamily="'Satoshi', sans-serif"
                  >
                    .⌐◨-◨.eth
                  </Text>
                  {indicators.checking && (
                    <Box
                      position="absolute"
                      top="50%"
                      left="0.5rem"
                      transform="translateY(-50%)"
                    >
                      <Spinner color={themeVariables.accent} height={21} />
                    </Box>
                  )}
                </Box>
                <Button
                  onClick={() => handleMint()}
                  ml={4}
                  disabled={mintBtnDisabled}
                  color={themeVariables.light}
                  bg={
                    indicators.available && !noLabel && !indicators.checking
                      ? "#069420"
                      : "#888"
                  }
                  _hover={{
                    bg:
                      indicators.available && !noLabel && !indicators.checking
                        ? "#04891c"
                        : "#666",
                  }}
                  _active={{
                    bg:
                      indicators.available && !noLabel && !indicators.checking
                        ? "#037d18"
                        : "#555",
                  }}
                  borderRadius="5px"
                  className="londrina-solid mint-btn"
                  fontSize="18px"
                  transition="all 0.2s ease"
                >
                  {indicators.available && !noLabel && !indicators.checking
                    ? "Mint"
                    : "Mint"}
                </Button>
              </Box>

              {isRenting && (
                <Box display="flex" alignItems="center" mb={3} mt={3}>
                  <Text
                    color={themeVariables.light}
                    fontSize={14}
                    marginRight="0px"
                    mb={0}
                    marginLeft="5px"
                  >
                    Expiration in years:
                  </Text>
                  <FaArrowDown
                    style={{
                      cursor: "pointer",
                      color: themeVariables.accent,
                      marginLeft: "10px",
                      marginRight: "10px",
                    }}
                    onClick={() => setExpiryYears(Math.max(1, expiryYears - 1))}
                  />
                  <Text color={themeVariables.light} fontSize={14} mb={0}>
                    {expiryYears}
                  </Text>
                  <FaArrowUp
                    style={{
                      cursor: "pointer",
                      color: themeVariables.accent,
                      marginLeft: "10px",
                    }}
                    onClick={() => setExpiryYears(expiryYears + 1)}
                  />
                </Box>
              )}

              {/* Development debug tools */}
              {process.env.NODE_ENV === 'development' && (
                <Box
                  mt={4}
                  p={3}
                  bg="#333"
                  borderRadius="5px"
                  fontSize="0.9em"
                  textAlign="left"
                  display="flex"
                  alignItems="center"
                  width="fit-content"
                >
                  <Button
                    onClick={() => {
                      setLabel('debug-name');
                      setRegistrationStep(RegistrationStep.PRIMARY_NAME);
                      setShowSuccess(true);
                    }}
                    size="sm"
                    bg="#555"
                    color="white"
                    _hover={{ bg: "#666" }}
                    fontSize="12px"
                  >
                    Show Success Screen
                  </Button>
                  <Text ml={2} fontSize="12px" color="#999" mb={0}>
                    (Debug only)
                  </Text>
                </Box>
              )}

              {subnameTakenErr && (
                <Text
                  textAlign="center"
                  color={themeVariables.error}
                  mt={5}
                  mb={0}
                >
                  {label} is already registered.
                </Text>
              )}
              {mintError.length > 0 && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mt={5}
                  mb={0}
                >
                  <Text color={themeVariables.error} mb={0}>
                    {mintError}
                  </Text>
                  <FaX
                    style={{ cursor: "pointer", color: themeVariables.accent }}
                    onClick={() => setMintError("")}
                  />
                </Box>
              )}
            </>
          )}
          {registrationStep === RegistrationStep.TX_SENT && (
            <Grid templateColumns="1fr" justifyItems="center">
              <Spinner
                color={themeVariables.accent}
                width={100}
                height={100}
                animationDuration="1.3s"
                borderWidth="3px"
              />
              <Text mt={3} fontSize={20} color="white">
                Registration in progress
              </Text>
              {txHash && (
                <Link
                  href={getEtherscanUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  color={themeVariables.accent}
                  textDecoration="none"
                  _hover={{
                    textDecoration: "underline",
                    textDecorationColor: themeVariables.accent,
                  }}
                >
                  <Text
                    textAlign="center"
                    color={themeVariables.accent}
                    fontSize={15}
                    mt={0}
                    mb={0}
                  >
                    Click here for transaction
                  </Text>
                </Link>
              )}
            </Grid>
          )}
          {registrationStep === RegistrationStep.PRIMARY_NAME && (
            <Grid templateColumns="1fr" justifyItems="center" width="100%">
              {/* Domain name only with inline SVG - centered */}
              <Box textAlign="center" width="100%" mb={4}>
                <Text
                  fontSize="42px"
                  fontWeight="bold"
                  className="londrina-solid"
                  lineHeight="1.2"
                >
                  <Box display="inline" color={themeVariables.accent}>
                    {label}.
                  </Box>
                  <Box as="span" color={themeVariables.dark}>
                    <Image src="/inline.svg" height={30} display="inline" />
                    .eth
                  </Box>
                </Text>
              </Box>
              
              {/* Success message */}
              <Text
                textAlign="center"
                color={themeVariables.dark}
                fontSize={30}
                mb={6}
                className="londrina-solid"
              >
                Nounification complete!
              </Text>
              
              {/* Buttons section - row layout */}
              <Box width="100%" display="flex" flexDirection="row" gap={4} mt={2} justifyContent="center">
                <Button
                  onClick={() => handlePrimaryName()}
                  bg="#069420"
                  _hover={{ bg: "#04891c" }}
                  _active={{ bg: "#037d18" }}
                  color={themeVariables.light}
                  height="45px"
                  fontSize="18px"
                  flexBasis="60%"
                  disabled={primaryNameIndicators.waiting}
                  className="londrina-solid"
                >
                  <Box as="span" mr={2} display="inline-block">
                    <Image src="/inline.svg" height="20px" />
                  </Box>
                  {primaryNameIndicators.btnLabel}
                </Button>
                
                <Button
                  onClick={() => {
                    setLabel("");
                    setRegistrationStep(RegistrationStep.START);
                    setShowSuccess(false);
                  }}
                  bg="#333333"
                  _hover={{ bg: "#444444" }}
                  color={themeVariables.light}
                  height="45px"
                  fontSize="18px"
                  flexBasis="50%" 
                  disabled={primaryNameIndicators.waiting}
                  className="londrina-solid"
                >
                  Go back home
                </Button>
              </Box>
              
              {/* ENS domain link */}
              <Link
                href={`https://app.ens.domains/${label}.${listedName}`}
                target="_blank"
                rel="noopener noreferrer"
                mt={4}
                fontSize="14px"
                textDecoration="none"
                color={themeVariables.accent}
                _hover={{
                  textDecoration: "underline",
                }}
              >
                View on ENS App →
              </Link>
            </Grid>
          )}
          {registrationStep === RegistrationStep.COMPLETE && (
            <Grid templateColumns="1fr" justifyItems="center" width="100%">
              {/* Domain name only with inline SVG - centered */}
              <Box textAlign="center" width="100%" mb={4}>
                <Text
                  fontSize="42px"
                  fontWeight="bold"
                  className="londrina-solid"
                  lineHeight="1.2"
                >
                  <Box display="inline" color={themeVariables.accent}>
                    {label}
                  </Box>
                  <Box as="span" color={themeVariables.light}>
                    <Box as="span">.⌐◨-◨</Box>.eth
                  </Box>
                </Text>
              </Box>
              
              <Text
                textAlign="center"
                color={themeVariables.dark}
                fontSize={30}
                mb={6}
                className="londrina-solid"
              >
                Nounification complete!
              </Text>
              
              <Box 
                display="flex" 
                justifyContent="center" 
                mb={6} 
                width="100%"
                position="relative"
              >
                <Image
                  src={defaultAvatarUri || "/favicon.svg"}
                  alt="Nouns Avatar"
                  borderRadius="40px"
                  border="2px solid"
                  borderColor={themeVariables.accent}
                  width="120px"
                  height="120px"
                  className="success-avatar"
                />
              </Box>
              
              {/* Share on social */}
              <Link
                href={`https://x.com/intent/tweet?text=I just minted ${label}.${listedName} via @namespace_eth!`}
                target="_blank"
                rel="noopener noreferrer"
                mb={5}
                textDecoration="none"
                _hover={{
                  textDecoration: "underline",
                  textDecorationColor: themeVariables.accent,
                }}
              >
                <Text color="white" fontSize={18} textAlign="center">
                  <Box as="span" mr={2} display="inline-block">🐦</Box>
                  Share on X
                </Text>
              </Link>
              
              {/* Buttons section - row layout */}
              <Box width="100%" display="flex" flexDirection="row" gap={4} mt={2} justifyContent="center">
                <Button
                  onClick={() => {
                    if (onSuccessfulMint) {
                      onSuccessfulMint();
                    }
                  }}
                  bg="#069420"
                  _hover={{ bg: "#04891c" }}
                  _active={{ bg: "#037d18" }}
                  color={themeVariables.light}
                  height="45px"
                  fontSize="18px"
                  flexBasis="50%"
                  className="londrina-solid"
                >
                  <Box as="span" mr={2} display="inline-block">📇</Box>
                  View my names
                </Button>
                
                <Button
                  onClick={() => {
                    setLabel("");
                    setRegistrationStep(RegistrationStep.START);
                    setShowSuccess(false);
                  }}
                  bg="#333333"
                  _hover={{ bg: "#444444" }}
                  color={themeVariables.light}
                  height="45px"
                  fontSize="18px"
                  flexBasis="50%"
                  className="londrina-solid"
                >
                  Go back home
                </Button>
              </Box>
              
              {/* ENS domain link */}
              <Link
                href={`https://app.ens.domains/${label}.${listedName}`}
                target="_blank"
                rel="noopener noreferrer"
                mt={4}
                fontSize="14px"
                textDecoration="none"
                color={themeVariables.accent}
                _hover={{
                  textDecoration: "underline",
                }}
              >
                View on ENS App →
              </Link>
            </Grid>
          )}
        </Box>
      </Box>
      <ToastContainer
        toastStyle={{
          backgroundColor: themeVariables.accent,
          color: themeVariables.light,
        }}
        hideProgressBar
      />
      <MintSuccess active={showSuccess} />
    </Grid>
  );
};
