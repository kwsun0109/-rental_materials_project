import { useState, useEffect } from "react";
import { Box, Typography, TextField, LinearProgress, Chip } from "@mui/material";
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
      // 기존: 자재마다 별도 API 호출 (N+1) -> 한 번의 호출로 통합
      const { data } = await getAllMaterialsInventory();
      setRows(data);
    };
    load();
  }, []);

  const filteredRows = rows.filter((row) =>
    (row.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "name", label: "자재명" },
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

        <TextField
          size="small"
          label="자재명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색할 자재명 입력"
          sx={{ width: "220px" }}
        />
      </Box>

      <Table columns={columns} rows={filteredRows} />
    </PageContainer>
  );
}

export default InventoryStatus;
