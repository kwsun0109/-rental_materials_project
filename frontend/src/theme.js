import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#aa3bff",
      light: "#c084fc",
      dark: "#7b1fa2",
      contrastText: "#fff",
    },
    background: {
      default: "#faf8ff",
      paper: "#ffffff",
    },
    text: {
      primary: "#2b2233",
      secondary: "#6b6375",
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: `"Pretendard", system-ui, "Segoe UI", Roboto, sans-serif`,
    h5: {
      letterSpacing: "-0.3px",
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#f4edff",
          // 사이드바 우측에 생기던 세로 경계선을 주석 처리하여 없앱니다
          borderRight: "1px solid #e5d9ff",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          "&.Mui-selected": {
            backgroundColor: "rgba(170, 59, 255, 0.15)",
            color: "#7b1fa2",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "rgba(170, 59, 255, 0.25)",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(170, 59, 255, 0.08)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: "#7b1fa2",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(170, 59, 255, 0.04)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "14px",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "14px",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          fontSize: "14px",
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: "14px",
        },
      },
    },
  },
});

export default theme;
