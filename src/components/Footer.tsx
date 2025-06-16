import { Flex, Link, Text, Box, Image } from "@chakra-ui/react";
import { themeVariables } from "@/styles/themeVariables";
import { FaTwitter } from "react-icons/fa";
import { SiFarcaster } from "react-icons/si";

export const Footer = () => {
  return (
    <Flex
      as="footer"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      p={3}
      bg={themeVariables.light}
      border={"1px solid #eee"}
      mt="auto"
    >
      <Box ml={4}>
        <Text fontSize="md" fontWeight="medium">
          {/* row flex */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span>Made with </span>
            <span style={{ marginTop: 7 }}>
              <Image src={"/favicon.svg"} height={10} />{" "}
            </span>
          </div>
        </Text>
      </Box>

      <Flex direction="row" gap={4} mr={4}>
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
    </Flex>
  );
};
