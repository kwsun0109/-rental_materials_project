import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import Table from "../components/Table";
import { getDueSoon, markReturned } from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function ReturnAlerts() {
  const [rows, setRows] = useState([]);

  const load = () => {
    getDueSoon().then((res) => setRows(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleReturn = async (id) => {
    await markReturned(id);
    load();
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "material_id", label: "자재 ID" },
    { key: "company_id", label: "거래처 ID" },
    { key: "qty", label: "수량" },
    { key: "rental_due_date", label: "반납 예정일" },
    {
      key: "status",
      label: "상태",
      render: () => <Chip label="반납 임박" color="warning" size="small" />,
    },
    {
      key: "action",
      label: "처리",
      render: (row) => (
        <Button size="small" variant="outlined" onClick={() => handleReturn(row.id)}>
          반납 처리
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
        <PageHeader title="반납 알림 (3일 이내)" description="반납 예정일이 임박한 건을 확인하세요." />
        <Table columns={columns} rows={rows} />
    </PageContainer>
  );
}

export default ReturnAlerts;