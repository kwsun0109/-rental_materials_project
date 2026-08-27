import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import Table from "../components/Table";
import { getSettlements, markSettlementComplete } from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function Settlements() {
  const [rows, setRows] = useState([]);

  const load = () => {
    getSettlements().then((res) => setRows(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (id) => {
    await markSettlementComplete(id);
    load();
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "company_id", label: "거래처 ID" },
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
      render: (row) =>
        row.status !== "정산완료" && (
          <Button size="small" variant="outlined" onClick={() => handleComplete(row.id)}>
            정산 완료
          </Button>
        ),
    },
  ];

  return (
    <PageContainer>
        <PageHeader title="정산 관리" description="거래처별 정산 내역을 확인하고 처리하세요." />
        <Table columns={columns} rows={rows} />
    </PageContainer>
  );
}

export default Settlements;