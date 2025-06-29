import { Box, Button, Flex, Text, Image, Input } from "@chakra-ui/react";
import { Subname } from "./Types";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { Address, encodeFunctionData, Hash, namehash, parseAbi, zeroAddress } from "viem";
import { KnownText, KnownTexts } from "./records/TextRecords";
import { toast, ToastContainer } from "react-toastify";
import { themeVariables } from "@/styles/themeVariables";
import { CgProfile } from "react-icons/cg";
import { IoShareSocialSharp } from "react-icons/io5";
import { mainnet, sepolia } from "viem/chains";
import { getL2NamespaceContracts, getEnsContracts } from "@namespacesdk/addresses"
import { useAppConfig } from "./AppConfigContext";

const resolverAbi = parseAbi([
  "function setText(bytes32 node, string key, string value) external",
  "function setAddr(bytes32 node, uint256 coinType, bytes value) external",
]);




export const SingleSubname = ({subname, onUpdate}: {subname: Subname; onUpdate: () => void;}) => {

    const { listingChainId } = useAppConfig()

    const publicClient = usePublicClient({ chainId: listingChainId });
    const { data: walletClient } = useWalletClient({ chainId: listingChainId });
    const { switchChain } = useSwitchChain();
    const { chain, address } = useAccount();
  
    const [selectedText, setSelectedText] = useState("name");
  
    const [btnState, setBtnState] = useState<{
      waitingWallet: boolean
      waitingTx: boolean
    }>({
      waitingTx: false,
      waitingWallet: false
    })
  
    const [textValues, setTextValues] = useState<Record<string, string>>({});
  
  
  
    useEffect(() => {
      const _texts: Record<string, string> = {};
  
      Object.keys(subname.texts || {}).forEach((textKey) => {
        _texts[textKey] = subname.texts[textKey];
      });
  
      setTextValues(_texts);
    }, [subname]);
  
    const textMetadata: KnownText = useMemo(() => {
      const defaultt: KnownText = {
        key: "",
        label: "",
        type: "profile",
        disabled: false,
        placeholder: "set text value...",
      };
  
      if (!selectedText || !KnownTexts[selectedText]) {
        return defaultt;
      }
  
      return KnownTexts[selectedText];
    }, [selectedText]);
  
    const handleTextChange = (_selectedText: string, value: string) => {
      const _txts = { ...textValues };
      _txts[_selectedText] = value;
      setTextValues(_txts);
    };
  
    const getRecordsToUpdate = () => {
      const textsToChange: { key: string; value: string }[] = [];
  
      Object.keys(textValues).forEach((txt) => {
        let shouldUpdate = false;
        const textValue = textValues[txt];
        const existingTexts: Record<string, string> = subname.texts;
        if (existingTexts[txt] && existingTexts[txt].length > 0) {
          if (textValue !== existingTexts[txt]) {
            shouldUpdate = true;
          }
        } else {
          shouldUpdate = true;
        }
  
        if (shouldUpdate) {
          textsToChange.push({ key: txt, value: textValue });
        }
      });
  
      return { texts: textsToChange };
    };
  
    const hasRecordUpdates = useMemo(() => {
      const { texts } = getRecordsToUpdate();
  
      return texts.length > 0;
    }, [textValues]);
  
    const toResolverData = () => {
      const data: Hash[] = [];
  
      const nameNode = namehash(subname.name);
      const { texts } = getRecordsToUpdate();
  
      console.log("Converting to resolver data", subname.name)

      texts.forEach((txt) => {
        data.push(
          encodeFunctionData({
            abi: resolverAbi,
            args: [nameNode, txt.key, txt.value],
            functionName: "setText",
          })
        );
      });
  
      return data;
    };
  
    const handleUpdate = async () => {
      if (chain?.id !== listingChainId) {
        switchChain({ chainId: listingChainId });
      }
  
      const resolverData = toResolverData();

      let resolver: string = zeroAddress;
      if (listingChainId === mainnet.id) {
        resolver = getEnsContracts(false).publicResolver
      } else if (listingChainId === sepolia.id) {
        resolver = getEnsContracts(true).publicResolver
      } else {
        resolver = getL2NamespaceContracts(listingChainId).resolver
      }


  
      try {
        const resp = await publicClient!!.simulateContract({
          abi: parseAbi(["function multicall(bytes[] data) external"]),
          address: resolver as Address,
          functionName: "multicall",
          args: [resolverData],
          account: address!!,
        });
    
        try {
          setBtnState({waitingWallet: true, waitingTx: false})
          const tx =  await walletClient!!.writeContract(resp.request);
          setBtnState({waitingTx: true, waitingWallet: false})
  
  
          await publicClient?.waitForTransactionReceipt({hash: tx, confirmations:2})
          setBtnState({waitingTx: false, waitingWallet: false})
  
          toast("Records updated successfully!", {position: "top-right", closeButton: false, autoClose: 1500})
  
          setTimeout(() => {
            onUpdate()
          },3000)
  
        } catch(err: any) {
          console.error(err);
          if (err.details) {
            sendToast(err.details)
          }
        } finally {
          setBtnState({waitingTx: false, waitingWallet: false})
        }
    
      } catch(err:any) {
        if (err.details) {
          sendToast(err.details)
        } else if (err.response) {
          sendToast(err.response?.data?.message)
        } else {
          sendToast("Unknown error ocurred :(")
        }
        console.error(err)
  
      }
    };
  
    const sendToast = (obj: any) => {
      toast(obj,  {type: "error"});
    }
   
    const mintBtnLabel = btnState.waitingTx ? "Waiting for tx..." : btnState.waitingWallet ? "Waiting for wallet..." : "Update"
    const mintBtnLoading = btnState.waitingTx || btnState.waitingWallet;



    return (
      <Box p={{ base: 4, md: 6 }} maxWidth="600px" mx="auto">
        {/* Header with avatar and name */}
        <Flex alignItems="center" flexDirection="column" mb={{ base: 6, md: 8 }}>
          <Image 
            src={subname.texts["avatar"]} 
            width={{ base: "60px", md: "80px" }}
            height={{ base: "60px", md: "80px" }}
            borderRadius="12px" 
            backgroundColor="#f1f1f1"
            mb={4}
          />
          <Text 
            fontSize={{ base: "24px", md: "28px" }}
            color={themeVariables.dark}
            fontWeight="700"
            textAlign="center"
            className="londrina-solid"
            mb={0}
          >
            {subname.name}
          </Text>
        </Flex>

        {/* Header for Text Records */}
        <Text 
          textAlign="center" 
          color="#333" 
          fontSize={{ base: "18px", md: "20px" }}
          mb={6}
          className="satoshi-font"
          fontWeight="600"
        >
          Text Records
        </Text>

        {/* Content Area */}
        <Box 
          bg="white" 
          borderRadius="16px" 
          p={{ base: 4, md: 6 }}
          mb={6}
          minHeight="400px"
        >
        {/* Text Records Content */}
        <>
          <Text 
            textAlign="center" 
            color="#666" 
            fontSize="16px"
            mb={6}
            className="satoshi-font"
            fontWeight="500"
          >
            Select a text record to edit
          </Text>
          <Flex flexWrap="wrap" justifyContent="center" mb={6}>
            {Object.values(KnownTexts).map((txt) => (
              <Button
                key={txt.key}
                onClick={() => setSelectedText(txt.key)}
                variant="outline"
                border={selectedText === txt.key ? "none" : "2px solid #e2e8f0"}
                bg={selectedText === txt.key ? "#069420" : "white"}
                color={selectedText === txt.key ? "white" : "#666"}
                _hover={{ 
                  borderColor: selectedText === txt.key ? "none" : "#069420", 
                  bg: selectedText === txt.key ? "#04891c" : "#f0fff4",
                  transform: "scale(1.02)" 
                }}
                borderRadius="12px"
                p={4}
                m={2}
                height="auto"
                minH="60px"
                flexDirection="column"
                className="satoshi-font"
                fontWeight="600"
                transition="all 0.2s ease"                  >
                {txt.icon ? (
                  <Image src={txt.icon} width="20px" height="20px" mb={2} />
                ) : txt.type === "profile" ? (
                  <CgProfile size={20} style={{ marginBottom: "8px" }} />
                ) : (
                  <IoShareSocialSharp size={20} style={{ marginBottom: "8px" }} />
                )}
                <Text mb={0} fontSize="14px">{txt.label}</Text>
              </Button>
            ))}
            {Object.keys(textValues)
              .filter((txt) => !KnownTexts[txt] && txt !== "avatar")
              .map((txt) => (
                <Button
                  key={txt + "-custom"}
                  onClick={() => setSelectedText(txt)}
                  variant="outline"
                  border={selectedText === txt ? "none" : "2px solid #e2e8f0"}
                  bg={selectedText === txt ? "#069420" : "white"}
                  color={selectedText === txt ? "white" : "#666"}
                  _hover={{ 
                    borderColor: selectedText === txt ? "none" : "#069420", 
                    bg: selectedText === txt ? "#04891c" : "#f0fff4",
                    transform: "scale(1.02)" 
                  }}
                  borderRadius="12px"
                  p={4}
                  m={2}
                  height="auto"
                  minH="60px"
                  flexDirection="column"
                  className="satoshi-font"
                  fontWeight="600"
                  transition="all 0.2s ease"
                >
                  <CgProfile size={20} style={{ marginBottom: "8px" }} />
                  <Text mb={0} fontSize="14px">{txt}</Text>
                </Button>
              ))}
          </Flex>
          {selectedText && (
            <Box width="100%">
              <Text 
                mb={3} 
                color="#333"
                fontSize="16px"
                fontWeight="600"
                className="satoshi-font"
              >
                {textMetadata.label} Record
              </Text>
              <Input
                value={textValues[selectedText] || ""}
                onChange={(e) => handleTextChange(selectedText, e.target.value)}
                bg="white"
                color="#333"
                border="2px solid #e2e8f0"
                borderRadius="12px"
                _hover={{ borderColor: "#cbd5e0" }}
                _focus={{ borderColor: "#069420", boxShadow: "none" }}
                _placeholder={{ color: "#999" }}
                height="48px"
                fontSize="16px"
                className="satoshi-font"
                fontWeight="500"
                placeholder={textMetadata.placeholder}
              />
            </Box>
          )}
        </>
      </Box>

        {/* Update Button */}
        <Box>
          <Button
            onClick={handleUpdate}
            disabled={!hasRecordUpdates || mintBtnLoading}
            bg={hasRecordUpdates && !mintBtnLoading ? "#069420" : "#cbd5e0"}
            color="white"
            _hover={{ bg: hasRecordUpdates && !mintBtnLoading ? "#04891c" : "#cbd5e0" }}
            _disabled={{ bg: "#cbd5e0", color: "#a0aec0", cursor: "not-allowed" }}
            width="100%"
            height="56px"
            borderRadius="16px"
            className="londrina-solid"
            fontSize="20px"
            fontWeight="bold"
          >
            {mintBtnLabel}
          </Button>
        </Box>

        <ToastContainer 
          toastStyle={{ 
            backgroundColor: themeVariables.accent, 
            color: themeVariables.light,
            borderRadius: "12px",
            fontFamily: "'Satoshi', sans-serif"
          }} 
          hideProgressBar
        />
      </Box>
    );
}