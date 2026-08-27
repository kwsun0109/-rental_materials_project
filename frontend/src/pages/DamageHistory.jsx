import { useState, useEffect } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import Table from "../components/Table";
import { getDamageList, resolveDamage } from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function DamageHistory() {
  const [rows, setRows] = useState([]);

  const load = () => {
    getDamageList().then((res) => setRows(res.data));
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    await resolveDamage(id);
    load();
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "transaction_id", label: "거래 ID" },
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
      render: (row) =>
        !row.resolved && (
          <Button size="small" variant="outlined" onClick={() => handleResolve(row.id)}>
            처리 완료
          </Button>
        ),
    },
  ];

  return (
    <PageContainer>
        <PageHeader title="분실 / 파손 이력" description="분실 및 파손 이력을 조회하고 관리하세요." />
        <Table columns={columns} rows={rows} />
    </PageContainer>
  );
}

export default DamageHistory;