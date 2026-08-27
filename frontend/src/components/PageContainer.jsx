import { Box } from "@mui/material";

function PageContainer({ children }) {
  return (
    <Box sx={{ width: "100%", px: 3, maxWidth: "none" }}>
      {children}
    </Box>
  );
}

export default PageContainer;