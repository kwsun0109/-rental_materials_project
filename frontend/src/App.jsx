import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import Sidebar from "./components/Sidebar";
import TransactionForm from "./pages/TransactionForm";
import InventoryStatus from "./pages/InventoryStatus";
import ReturnAlerts from "./pages/ReturnAlerts";
import Settlements from "./pages/Settlements";
import DamageHistory from "./pages/DamageHistory";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          {/* 패딩(p)을 3 또는 2 등으로 줄여서 양옆 여백과 경계 공간을 넓혔습니다 */}
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1, 
              p: 3, 
              backgroundColor: "background.default",
              minWidth: 0
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Routes>
                <Route path="/" element={<TransactionForm />} />
                <Route path="/inventory" element={<InventoryStatus />} />
                <Route path="/alerts" element={<ReturnAlerts />} />
                <Route path="/settlements" element={<Settlements />} />
                <Route path="/damage" element={<DamageHistory />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;