import { ReactElement, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Button, useBreakpointValue } from "@chakra-ui/react";

export const SideModal = (props: {
  open: boolean;
  onClose?: () => void;
  children?: ReactElement
}) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);


    const modalWidth = useBreakpointValue({ base: "100%", md: "600px" });


  
    if (!isClient || !props.open) {
      return null;
    }
    



    return createPortal(
      <Box
        position="fixed"
        top="0"
        right={props.open ? "0" : "-100%"}
        height="100vh"
        width={modalWidth}
        boxShadow="12px 0 24px rgba(0, 0, 0, 0.5)"
        borderLeft="1px solid #e0e0e0"
        zIndex="1000"
        bg="white"
        color="#333"
        transition="right 0.3s ease-in-out"
        overflowY="auto"
      >
        {/* Close button in top right */}
        <Button
          onClick={() => props.onClose?.()}
          position="absolute"
          top="20px"
          right="20px"
          width="32px"
          height="32px"
          minWidth="32px"
          color="#666"
          _hover={{ bg: "#e9ecef", color: "#333" }}
          _active={{ bg: "#dee2e6" }}
          borderRadius="8px"
          fontSize="16px"
          fontWeight="500"
          zIndex="1001"
          display="flex"
          alignItems="center"
          justifyContent="center"
          transition="all 0.2s ease"
          className="satoshi-font"
        >
          ✕
        </Button>
        <Box p="4" pt="60px">
          {props.children}
        </Box>
      </Box>,
      document.body
    );
};