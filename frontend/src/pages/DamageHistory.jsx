import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip, Stack, TextField } from "@mui/material";
import Table from "../components/Table";
import { getDamageList, resolveDamage, unresolveDamage } from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function DamageHistory() {
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 검색어 상태 추가

  const load = () => {
    getDamageList().then((res) => setRows(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    await resolveDamage(id);
    load();
  };

  // 처리 취소 함수
  const handleUnresolve = async (id) => {
    await unresolveDamage(id);
    load();
  };

  // 🔍 자재명 또는 회사명 기준으로 실시간 필터링
  const filteredRows = rows.filter((row) => {
    const materialName = (row.material_name || "").toLowerCase();
    const companyName = (row.company_name || "").toLowerCase();
    const term = searchTerm.toLowerCase();

    return materialName.includes(term) || companyName.includes(term);
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "material_name", label: "자재명" },     // 👈 거래 ID 대신 자재명 표시
    { key: "company_name", label: "거래처명" },   // 👈 거래처명 함께 표시
    { key: "type", label: "구분" },
    { key: "description", label: "설명" },
    { key: "responsible_party", label: "책임 소재" },
    {
      key: "resolved",
      label: "처리 여부",
      render: (row) => (
        <Chip
          label={row.resolved ? "처리완료" : "미처리"}
          color={row.resolved ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      key: "action",
      label: "처리",
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {row.resolved ? (
            <Button 
              size="small" 
              variant="outlined" 
              color="error" 
              onClick={() => handleUnresolve(row.id)}
            >
              처리 취소
            </Button>
          ) : (
            <Button 
              size="small" 
              variant="outlined" 
              color="primary" 
              onClick={() => handleResolve(row.id)}
            >
              처리 완료
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
        <PageHeader title="분실 / 파손 이력" description="분실 및 파손 이력을 조회하고 관리하세요." />
        
        <TextField
          size="small"
          label="자재명 또는 회사명 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="검색어 입력"
          sx={{ width: "240px" }}
        />
      </Box>

      <Table columns={columns} rows={filteredRows} />
    </PageContainer>
  );
}

export default DamageHistory;