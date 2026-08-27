import { Box, Typography } from "@mui/material";

function PageHeader({ title, description, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        mb: 4,
        pb: 2,
        // 헤더 아래 실선을 없애려면 아래 두 줄을 주석 처리합니다
        // borderBottom: "1px solid",
        // borderColor: "divider",
        gap: 2,
      }}
    >
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}

export default PageHeader;