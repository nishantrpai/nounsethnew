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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
      <Box className="ticker-container" width="100%" py="15px" bg="#fff" borderBottom="1px solid #e0e0e0">
        <Box maxWidth="1200px" margin="0 auto" px={4} display="flex" width="100%">
          <Box flex="1" className="counter-section" display="flex" alignItems="center" justifyContent="center">
            <span className="counter-text-desktop">12,384 ⌐◨-◨ names minted and counting...</span>
            <span className="counter-text-mobile">12,384 ⌐◨-◨ names</span>
          </Box>
          <Box className="banner-divider"></Box>
          <Box flex="2" className="address-ticker" overflow="hidden" position="relative">
            <Box className="ticker-content" position="absolute" whiteSpace="nowrap" animation="ticker 20s linear infinite">
              <span className="ticker-item">harsh.⌐◨-◨.eth</span>
              <span className="ticker-item">123.⌐◨-◨.eth</span>
              <span className="ticker-item">🔥🔥🔥.⌐◨-◨.eth</span>
              <span className="ticker-item">volky.⌐◨-◨.eth</span>
              <span className="ticker-item">4156.⌐◨-◨.eth</span>
              <span className="ticker-item">echo.⌐◨-◨.eth</span>
              <span className="ticker-item">harsh.⌐◨-◨.eth</span>
              <span className="ticker-item">123.⌐◨-◨.eth</span>
              <span className="ticker-item">🔥🔥🔥.⌐◨-◨.eth</span>
            </Box>
          </Box>
        </Box>
      </Box>
      <Flex flex="1" width="100%" alignItems="center" justifyContent="center">
        {view === "mint" ? 
          <MintForm onSuccessfulMint={() => {
            setRefreshTrigger(prev => prev + 1);
            setView("mynames");
          }} /> : 
          <MySubnames setView={setView} refreshTrigger={refreshTrigger} />}
      </Flex>
      <Footer />
    </Flex>
  );
};

export default App;
