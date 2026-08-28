import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip, Stack, TextField } from "@mui/material";
import Table from "../components/Table";
import { getDueSoon, markReturned, unmarkReturned } from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function ReturnAlerts() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 검색어 상태 추가

  const load = () => {
    getDueSoon().then((res) => setRows(res.data));
  };

  useEffect(() => { load(); }, []);

  // 반납 처리
  const handleReturn = async (id) => {
    await markReturned(id);
    load();
  };

  // 반납 취소
  const handleUnreturn = async (id) => {
    await unmarkReturned(id);
    load();
  };

  // 🔍 자재명 또는 회사명에 검색어가 포함되어 있는지 필터링
  const filteredRows = rows.filter((row) => {
    const materialName = (row.material_name || "").toLowerCase();
    const companyName = (row.company_name || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    return materialName.includes(term) || companyName.includes(term);
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "material_name", label: "자재명" },
    { key: "company_name", label: "거래처명" },
    { key: "qty", label: "수량" },
    { key: "rental_due_date", label: "반납 예정일" },
    {
      key: "status",
      label: "상태",
      render: (row) =>
        row.returned_at ? (
          <Chip label="반납 임박" color="success" size="small" />
        ) : (
          <Chip label="반납 완료" color="warning" size="small" />
        ),
    },
    {
      key: "action",
      label: "처리",
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {row.returned_at ? (
            <Button 
              size="small" 
              variant="outlined" 
              color="error" 
              onClick={() => handleUnreturn(row.id)}
            >
              반납 취소
            </Button>
          ) : (
            <Button 
              size="small" 
              variant="outlined" 
              color="primary" 
              onClick={() => handleReturn(row.id)}
            >
              반납 처리
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
        <PageHeader title="반납 알림 (3일 이내)" description="반납 예정일이 임박한 건을 확인하세요." />
        
        <TextField
          size="small"
          label="자재명 또는 회사명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색어 입력"
          sx={{ width: "240px" }}
        />
      </Box>

      {/* 필터링된 결과(filteredRows)를 테이블에 전달 */}
      <Table columns={columns} rows={filteredRows} />
    </PageContainer>
  );
}

export default ReturnAlerts;