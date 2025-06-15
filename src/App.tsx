import "bootstrap/scss/bootstrap.scss";
import { WalletConnector } from "./components/WalletConnect";
import { TopNavigation } from "./components/TopNavigation";
import { Footer } from "./components/Footer";
import { MintForm } from "./components/MintForm";
import { MySubnames } from "./components/MySubnames";
import { useState } from "react";
import { Flex, Box, Spinner } from "@chakra-ui/react";
import { themeVariables } from "./styles/themeVariables";
import { ReferralProvider } from "./components/ReferralContext";
import { AppContextProvider, useAppConfig } from "./components/AppConfigContext";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <ReferralProvider>
      <WalletConnector>
        <AppContextProvider>
          <AppContainer/>
        </AppContextProvider>
        <ToastContainer/>
      </WalletConnector>
    </ReferralProvider>
  );
}

const AppContainer = () => {
  const [view, setView] = useState("mint");
  const state = useAppConfig()

  if (state.isLoading) {
    return   <Flex flex="1" height="100vh" width="100%" alignItems="center" justifyContent="center">
        <Spinner color="blue.400" size="xl"/>
      </Flex>
  }

  if (state.isError) {
    return <div>Something went wrong</div>
  }

  return (
    <Flex
      minHeight="100vh"
      flexDirection="column"
      bg={themeVariables.main}
    >
      <Box>
        <TopNavigation setView={setView} />
      </Box>
      <Box className="ticker" width="100%" p="15px" bg="#f1f1f1" borderBottom="1px solid #e0e0e0" overflowX="auto" whiteSpace="nowrap">
        <Box as="div" display="inline">
          <span>12,384 🧠-🧩 names minted and counting...</span>
          <span style={{marginLeft: '20px'}}>harsh.🧠🧩.eth</span>
          <span style={{marginLeft: '20px'}}>123.🧠🧩.eth</span>
          <span style={{marginLeft: '20px'}}>🔥🔥🔥.🧠🧩.eth</span>
          <span style={{marginLeft: '20px'}}>volky.🧠🧩.eth</span>
          <span style={{marginLeft: '20px'}}>4156.🧠🧩.eth</span>
          <span style={{marginLeft: '20px'}}>echo.🧠🧩.eth</span>
        </Box>
      </Box>
      <Flex flex="1" width="100%" alignItems="center" justifyContent="center">
        {view === "mint" ? <MintForm /> : <MySubnames setView={setView} />}
      </Flex>
      <Footer />
    </Flex>
  );
};

export default App;
