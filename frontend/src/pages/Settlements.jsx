import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Chip, Stack, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Table from "../components/Table";
import { 
  getSettlements, markSettlementComplete, unmarkSettlementComplete, 
  getCompanies, createSettlement, calculatePeriodAmount 
} from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function Settlements() {
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 팝업(다이얼로그) 및 입력 폼 상태
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    company_id: "",
    company_name: "",
    period_start: "",
    period_end: "",
    amount: "",
    status: "미정산"
  });
  const [calcInfo, setCalcInfo] = useState(null); // 기간 내 반출 수량 안내용

  const load = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        getSettlements(),
        getCompanies()
      ]);
      setRows(sRes.data);
      setCompanies(cRes.data || []);
    } catch (err) {
      console.error("데이터를 불러오지 못했습니다.", err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (id) => {
    await markSettlementComplete(id);
    load();
  };

  const handleUncomplete = async (id) => {
    await unmarkSettlementComplete(id);
    load();
  };

  // 기간이나 거래처가 바뀔 때 반출 건수 미리 계산해보기
  const fetchCalcAmount = async (companyId, start, end) => {
    if (companyId && start && end) {
      try {
        const res = await calculatePeriodAmount(companyId, start, end);
        setCalcInfo(res.data); // { total_qty: ..., transaction_count: ... }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpen = () => {
    setForm({ company_id: "", company_name: "", period_start: "", period_end: "", amount: "", status: "미정산" });
    setCalcInfo(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = async () => {
    if (!form.company_id || !form.period_start || !form.period_end || !form.amount) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    try {
      await createSettlement({
        company_id: Number(form.company_id),
        period_start: form.period_start,
        period_end: form.period_end,
        amount: Number(form.amount),
        status: form.status
      });
      handleClose();
      load();
    } catch (err) {
      alert("정산 등록 중 오류가 발생했습니다.");
    }
  };

  const filteredRows = rows.filter((row) => {
    const companyName = (row.company_name || "").toLowerCase();
    return companyName.includes(searchTerm.toLowerCase());
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "company_name", label: "거래처명" },
    { key: "period_start", label: "시작일" },
    { key: "period_end", label: "종료일" },
    { 
      key: "amount", 
      label: "금액", 
      render: (row) => `${Number(row.amount).toLocaleString()} 원` 
    },
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <PageHeader title="정산 관리" description="거래처별 정산 내역을 확인하고 처리하세요." />
        
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            label="거래처명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="회사명 입력"
            sx={{ width: "200px" }}
          />
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleOpen}
            sx={{ height: "40px" }}
          >
            정산 등록
          </Button>
        </Stack>
      </Box>

      <Table columns={columns} rows={filteredRows} />

      {/* 신규 정산 등록 팝업 다이얼로그 */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>신규 정산 등록</DialogTitle>
        <DialogContent>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            <Autocomplete
              options={companies}
              getOptionLabel={(option) => option.name || ""}
              value={companies.find(c => c.id === form.company_id) || null}
              onChange={(e, newValue) => {
                const cId = newValue ? newValue.id : "";
                setForm(f => ({ ...f, company_id: cId }));
                fetchCalcAmount(cId, form.period_start, form.period_end);
              }}
              renderInput={(params) => <TextField {...params} label="거래처 선택 *" size="small" />}
            />

            <TextField
              label="정산 시작일"
              type="date"
              value={form.period_start}
              onChange={(e) => {
                setForm(f => ({ ...f, period_start: e.target.value }));
                fetchCalcAmount(form.company_id, e.target.value, form.period_end);
              }}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            <TextField
              label="정산 종료일"
              type="date"
              value={form.period_end}
              onChange={(e) => {
                setForm(f => ({ ...f, period_end: e.target.value }));
                fetchCalcAmount(form.company_id, form.period_start, e.target.value);
              }}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            {calcInfo && (
              <Typography variant="caption" color="text.secondary">
                💡 해당 기간 반출 건수: {calcInfo.transaction_count}건 / 총 수량: {calcInfo.total_qty || 0}
              </Typography>
            )}

            <TextField
              label="청구 금액 (원) *"
              type="number"
              value={form.amount}
              onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button variant="contained" onClick={handleSave}>등록</Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default Settlements;