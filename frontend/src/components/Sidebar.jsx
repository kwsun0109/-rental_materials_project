import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

const menuItems = [
  { label: "반입/반출 등록", path: "/", icon: <AssignmentIcon fontSize="small" /> },
  { label: "재고 현황", path: "/inventory", icon: <Inventory2Icon fontSize="small" /> },
  { label: "반납 알림", path: "/alerts", icon: <NotificationsActiveIcon fontSize="small" /> },
  { label: "정산 관리", path: "/settlements", icon: <PaymentsIcon fontSize="small" /> },
  { label: "분실/파손 이력", path: "/damage", icon: <ReportProblemIcon fontSize="small" /> },
];

function Sidebar() {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: 240, 
          boxSizing: "border-box",
          borderRight: "none", // <-- 이 코드가 사이드바 오른쪽의 세로선을 없애줍니다!
        },
      }}
    >
      <Toolbar sx={{ py: 2 }}>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, color: "primary.dark", lineHeight: 1.3 }}
          >
            🏗️ 자재 관리
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Rental Materials
          </Typography>
        </Box>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{ mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: 14 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;