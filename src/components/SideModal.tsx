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


    const modalWidth = useBreakpointValue({ 
      base: "100vw", 
      sm: "90vw", 
      md: "600px", 
      lg: "600px" 
    });


  
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
        boxShadow={{ base: "none", md: "12px 0 24px rgba(0, 0, 0, 0.5)" }}
        borderLeft={{ base: "none", md: "1px solid #e0e0e0" }}
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
          top={{ base: "16px", md: "20px" }}
          right={{ base: "16px", md: "20px" }}
          width={{ base: "28px", md: "32px" }}
          height={{ base: "28px", md: "32px" }}
          minWidth={{ base: "28px", md: "32px" }}
          color="#666"
          _hover={{ bg: "#e9ecef", color: "#333" }}
          _active={{ bg: "#dee2e6" }}
          borderRadius="8px"
          fontSize={{ base: "14px", md: "16px" }}
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
        <Box p={{ base: 2, md: 4 }} pt={{ base: "50px", md: "60px" }}>
          {props.children}
        </Box>
      </Box>,
      document.body
    );
};