import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip, Stack, TextField } from "@mui/material";
import Table from "../components/Table";
import { getSettlements, markSettlementComplete, unmarkSettlementComplete } from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function Settlements() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 검색어 상태 추가

  const load = () => {
    getSettlements().then((res) => setRows(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (id) => {
    await markSettlementComplete(id);
    load();
  };

  // 정산 취소 함수 (백엔드에 uncomplete API를 만들었다면 사용)
  const handleUncomplete = async (id) => {
    await unmarkSettlementComplete(id);
    load();
  };

  // 🔍 회사명 기준으로 실시간 필터링
  const filteredRows = rows.filter((row) => {
    const companyName = (row.company_name || "").toLowerCase();
    return companyName.includes(searchTerm.toLowerCase());
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "company_name", label: "거래처명" }, // 👈 거래처 ID -> 거래처명으로 변경
    { key: "period_start", label: "시작일" },
    { key: "period_end", label: "종료일" },
    { key: "amount", label: "금액" },
    {
      key: "status",
      label: "상태",
      render: (row) => (
        <Chip
          label={row.status}
          color={row.status === "정산완료" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      key: "action",
      label: "처리",
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {row.status === "정산완료" ? (
            <Button 
              size="small" 
              variant="outlined" 
              color="error" 
              onClick={() => handleUncomplete(row.id)}
            >
              정산 취소
            </Button>
          ) : (
            <Button 
              size="small" 
              variant="outlined" 
              color="primary" 
              onClick={() => handleComplete(row.id)}
            >
              정산 완료
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 상단 타이틀과 우측 검색 입력창 배치 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <PageHeader title="정산 관리" description="거래처별 정산 내역을 확인하고 처리하세요." />
        
        <TextField
          size="small"
          label="거래처명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="회사명 입력"
          sx={{ width: "220px" }}
        />
      </Box>

      <Table columns={columns} rows={filteredRows} />
    </PageContainer>
  );
}

export default Settlements;