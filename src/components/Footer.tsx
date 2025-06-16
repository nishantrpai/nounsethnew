import { Flex, Link, Text, Box, Image } from "@chakra-ui/react";
import { themeVariables } from "@/styles/themeVariables";
import { FaTwitter } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";

export const Footer = () => {
  return (
    <Box
      as="footer"
      width="100%"
      py={3}
      bg={themeVariables.light}
      border={"1px solid #eee"}
      mt="auto"
    >
      <Box maxWidth="1200px" width="100%" margin="0 auto" px={4} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Text fontSize="md" fontWeight="medium" className="courier-prime">
            <Flex align="center">
              <span>Made with </span>
              <Box ml={1} mt="2px">
                <Image src={"/favicon.svg"} height={10} alt="Nouns Glasses" />
              </Box>
            </Flex>
          </Text>
        </Box>

        <Flex direction="row" gap={4}>
          <Link
            href="https://twitter.com/nouns"
            target="_blank"
            aria-label="X (Twitter)"
          >
            <Box
              as={FaTwitter}
              boxSize="20px"
              color="black"
              _hover={{ color: "#1DA1F2" }}
            />
          </Link>
          <Link
            href="https://warpcast.com/"
            target="_blank"
            aria-label="Farcaster"
          >
            <Box
              as={SiFarcaster}
              boxSize="20px"
              color="black"
              _hover={{ color: "#8A63D2" }}
            />
          </Link>
        </Flex>
      </Box>
    </Box>
  );
};
