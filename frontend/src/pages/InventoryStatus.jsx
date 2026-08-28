import { useState, useEffect } from "react";
import { Box, Typography, TextField, LinearProgress, Chip, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Table from "../components/Table";
import { getAllMaterialsInventory } from "../api";
import PageHeader from "../components/PageHeader";
import PageContainer from "../components/PageContainer";

// 가용률(%)에 따른 상태 판정
// - 20% 이하: 부족 (빨강)
// - 50% 이하: 주의 (주황)
// - 그 외: 여유 (초록)
function getAvailabilityStatus(rate) {
  if (rate <= 20) return { label: "부족", color: "error" };
  if (rate <= 50) return { label: "주의", color: "warning" };
  return { label: "여유", color: "success" };
}

function InventoryStatus() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await getAllMaterialsInventory();
      setRows(data);
    };
    load();
  }, []);

  // 🔍 자재명 또는 거래처명으로 필터링
  const filteredRows = rows.filter((row) => {
    const materialName = (row.name || "").toLowerCase();
    const companyName = (row.company_name || "").toLowerCase();
    const keyword = searchTerm.toLowerCase();
    return materialName.includes(keyword) || companyName.includes(keyword);
  });

  const columns = [
    { key: "name", label: "자재명" },
    // 👇 거래처명 컬럼 추가
    { key: "company_name", label: "거래처명", render: (row) => row.company_name ?? "-" },
    { key: "category", label: "카테고리" },
    {
      key: "total_qty",
      label: "총 보유 수량",
      render: (row) => `${row.total_qty}${row.unit ? ` ${row.unit}` : ""}`,
    },
    {
      key: "transit_qty",
      label: "반출중 수량",
      render: (row) => {
        const transit = row.total_qty - row.available_qty;
        return `${transit}${row.unit ? ` ${row.unit}` : ""}`;
      },
    },
    {
      key: "available_qty",
      label: "가용 수량",
      render: (row) => `${row.available_qty}${row.unit ? ` ${row.unit}` : ""}`,
    },
    {
      key: "availability_rate",
      label: "가용률",
      render: (row) => {
        const rate =
          row.total_qty > 0
            ? Math.max(0, Math.min(100, (row.available_qty / row.total_qty) * 100))
            : 0;
        const status = getAvailabilityStatus(rate);
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 140 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={rate}
                color={status.color}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
            <Typography variant="caption" sx={{ minWidth: 36, color: "text.secondary" }}>
              {rate.toFixed(0)}%
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "status",
      label: "상태",
      render: (row) => {
        const rate =
          row.total_qty > 0 ? (row.available_qty / row.total_qty) * 100 : 0;
        const status = getAvailabilityStatus(rate);
        return <Chip label={status.label} color={status.color} size="small" />;
      },
    },
  ];

  return (
    <PageContainer>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <PageHeader title="재고 현황" description="자재별 보유/가용 수량을 확인하세요." />

        {/* 🔍 자재명 또는 거래처명 검색 입력창 */}
        <TextField
          size="small"
          placeholder="자재명 또는 거래처 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: "240px", backgroundColor: "background.paper", borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Table columns={columns} rows={filteredRows} />
    </PageContainer>
  );
}

export default InventoryStatus;