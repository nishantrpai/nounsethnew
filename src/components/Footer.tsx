import { Flex, Link, Text, Image, Box, Stack } from "@chakra-ui/react";
import { themeVariables } from "@/styles/themeVariables";
import logo from "../assets/logo.png";
import { FaTwitter } from 'react-icons/fa';

export const Footer = () => {
  return (
    <Flex
      as="footer"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      p={2}
      bg={themeVariables.light}
      boxShadow="0 -2px 4px rgba(0,0,0,0.1)"
      mt="auto"
    >
      <Box ml={4}>
        <Image
          height="40px"
          src={logo}
          alt="Logo"
        />
      </Box>
      
      <Stack direction="row" mr={4}>
        <Text mb={0} fontSize="sm">Made with 🧠🧩</Text>
        <Link href="https://twitter.com/nouns" target="_blank">
          <Box as={FaTwitter} boxSize="20px" />
        </Link>
      </Stack>
    </Flex>
  );
};
