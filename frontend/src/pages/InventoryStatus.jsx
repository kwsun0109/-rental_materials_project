import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import Table from "../components/Table";
import { getMaterials, getMaterialInventory } from "../api";
import PageHeader from "../components/PageHeader";
import PageContainer from "../components/PageContainer";

function InventoryStatus() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: materials } = await getMaterials();
      const results = await Promise.all(
        materials.map((m) => getMaterialInventory(m.id).then((res) => res.data))
      );
      setRows(results);
    };
    load();
  }, []);

  const columns = [
    { key: "name", label: "자재명" },
    { key: "total_qty", label: "총 보유 수량" },
    { key: "available_qty", label: "가용 수량" },
  ];

  return (
    <PageContainer>
        <PageHeader title="재고 현황" description="자재별 보유/가용 수량을 확인하세요." />
        <Table columns={columns} rows={rows} />
    </PageContainer>
  );
}

export default InventoryStatus;