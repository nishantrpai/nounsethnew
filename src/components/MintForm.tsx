import { useCallback, useState } from "react";
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
import { mainnet, sepolia, base, optimism } from "viem/chains";
import { useAppConfig } from "./AppConfigContext";

enum RegistrationStep {
  START = 0,
  TX_SENT = 1,
  PRIMARY_NAME = 2,
  COMPLETE = 3,
}

const ETH_COIN = 60;
const BASE_COIN = 2147492101;
const OP_COIN = 2147483658;

export const MintForm = () => {
  const { isRenting, listedName, listingChainId, isTestnet, defaultAvatarUri } =
    useAppConfig();

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

  const [primaryNameIndicators, setPrimaryNameIndicators] = useState<{
    waiting: boolean;
    btnLabel: string;
  }>({ waiting: false, btnLabel: "Set primary name!" });

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
    const addresses: { coin: number; value: string; chain: number }[] = [
      {
        value: address,
        coin: ETH_COIN,
        chain: mainnet.id,
      },
      {
        value: address,
        coin: BASE_COIN,
        chain: base.id,
      },
      {
        value: address,
        coin: OP_COIN,
        chain: optimism.id,
      },
    ];

    const texts: { key: string; value: string }[] = [];

    if (defaultAvatarUri) {
      texts.push({ key: "avatar", value: defaultAvatarUri });
    }

    try {
      setMintIndicator({ btnLabel: "Waiting for wallet", waiting: true });
      const params = await mintParameters({
        minterAddress: address,
        expiryInYears: expiryYears,
        records: {
          addresses: addresses,
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
      setRegistrationStep(RegistrationStep.PRIMARY_NAME);
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
      setMintError("You don't have enought tokens for minting!");
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
    } else {
      setMintError("Unknown error ocurred. Check console for more info");
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
        btnLabel: "Set primary name!",
        waiting: false,
      });
    }
  };

  return (
    <Grid
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      paddingTop="50px"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={0}
        alignSelf="center"
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
        <Text
          mt={0}
          mb={0}
          color={themeVariables.dark}
          fontSize={subHeadlineFontSize}
          textAlign="center"
          className="courier-prime"
        >
          <div className="tagline-container" style={{ display: "inline-flex", alignItems: "center", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
            Strap on the <Image src={"/favicon.svg"} height={20} style={{marginTop: 5, marginLeft: 5, marginRight: 5}} />, and enter the Nouniverse
          </div>
        </Text>
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
                    borderRadius="5px"
                    border="none"
                    p="10px"
                    fontSize="1em"
                    flex="1"
                    pr="7rem"
                  />
                  <Text
                    position="absolute"
                    right="10px"
                    top="50%"
                    transform="translateY(-50%)"
                    fontSize="1em"
                    color="black"
                    pointerEvents="none"
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
                  bg="#888"
                  _hover={{ bg: "#666" }}
                  borderRadius="5px"
                  className="londrina-solid mint-btn"
                >
                  Mint
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

              <Box
                mt={2}
                p={3}
                bg="#F2A730"
                borderRadius="5px"
                fontSize="0.9em"
                textAlign="left"
                display="flex"
                alignItems="flex-start"
                flexDirection="column"
                width="fit-content"
                ml="auto"
              >
                <Text mb={0}>
                  Disabled button if: <br />
                  • no input in field <br />• wallet not connected
                </Text>
              </Box>

              {subnameTakenErr && (
                <Text
                  textAlign="center"
                  color={themeVariables.error}
                  mt={5}
                  mb={0}
                >
                  Subname is already registered
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
                // fix block explorer
                <Link
                  href={`${listedName}/tx/` + txHash}
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
            <Grid templateColumns="1fr" justifyItems="center">
              <Text
                textAlign="center"
                color={themeVariables.light}
                fontSize={24}
                mt={2}
                mb={4}
              >
                You have registered
              </Text>
              <Box display="flex" justifyContent="center" mb={1}>
                <Box
                  as="img"
                  //@ts-ignore
                  src={defaultAvatarUri}
                  alt="Avatar"
                  borderRadius="40px"
                  border="2px solid"
                  borderColor={themeVariables.accent}
                  boxSize="120px"
                />
              </Box>
              <Link
                href={`https://app.ens.domains/${label}.${listedName}`}
                target="_blank"
                rel="noopener noreferrer"
                mb={2}
                textDecoration="none"
                _hover={{
                  textDecoration: "underline",
                  textDecorationColor: themeVariables.accent,
                }}
              >
                <Text color="white" fontSize={30} textAlign="center">
                  <Box as="span" color={themeVariables.accent}>
                    {label}
                  </Box>
                  .{listedName}
                </Text>
              </Link>
              <Button
                onClick={() => handlePrimaryName()}
                bg={themeVariables.accent}
                color={themeVariables.light}
                width="100%"
                mb={2}
                disabled={primaryNameIndicators.waiting}
              >
                {primaryNameIndicators.btnLabel}
              </Button>
              <Button
                onClick={() => {
                  setLabel("");
                  setRegistrationStep(RegistrationStep.START);
                }}
                bg={themeVariables.main}
                color={themeVariables.light}
                width="95%"
                disabled={primaryNameIndicators.waiting}
              >
                Finish
              </Button>
            </Grid>
          )}
          {registrationStep === RegistrationStep.COMPLETE && (
            <Grid templateColumns="1fr" justifyItems="center">
              <Text
                textAlign="center"
                color={themeVariables.light}
                fontSize={24}
                mt={2}
                mb={4}
              >
                You have registered
              </Text>
              <Box display="flex" justifyContent="center" mb={1}>
                <Box
                  as="img"
                  //@ts-ignore
                  src={defaultAvatarUri}
                  alt="Avatar"
                  borderRadius="40px"
                  border="2px solid"
                  borderColor={themeVariables.accent}
                  boxSize="120px"
                />
              </Box>
              <Link
                href={`https://app.ens.domains/${label}.${listedName}`}
                target="_blank"
                rel="noopener noreferrer"
                mb={2}
                textDecoration="none"
                _hover={{
                  textDecoration: "underline",
                  textDecorationColor: themeVariables.accent,
                }}
              >
                <Text color="white" fontSize={30} textAlign="center">
                  <Box as="span" color={themeVariables.accent}>
                    {label}
                  </Box>
                  .{listedName}
                </Text>
              </Link>
              <Link
                href={`https://x.com/intent/tweet?text=I just minted ${label}.${listedName} via @namespace_eth!`}
                target="_blank"
                rel="noopener noreferrer"
                mb={2}
                textDecoration="none"
                _hover={{
                  textDecoration: "underline",
                  textDecorationColor: themeVariables.accent,
                }}
              >
                <Text color="white" fontSize={30} textAlign="center">
                  Share on X
                </Text>
              </Link>
              <Button
                onClick={() => {
                  setLabel("");
                  setRegistrationStep(RegistrationStep.START);
                }}
                bg={themeVariables.accent}
                color={themeVariables.light}
                width="100%"
              >
                Great!
              </Button>
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
    </Grid>
  );
};
