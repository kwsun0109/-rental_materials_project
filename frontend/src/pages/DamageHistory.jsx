import { useState, useEffect } from "react";
import { 
  Box, Typography, Button, Chip, Stack, TextField, 
  Dialog, DialogTitle, DialogContent, DialogActions, Autocomplete, MenuItem 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Table from "../components/Table";
import { 
  getDamageList, createDamage, updateDamage, deleteDamage, 
  resolveDamage, unresolveDamage, getTransactions 
} from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";

function DamageHistory() {
  const [rows, setRows] = useState([]);
  const [transactions, setTransactions] = useState([]); // 👈 사고 등록/수정 시 선택할 거래 내역 목록
  const [searchTerm, setSearchTerm] = useState(""); 

  // 팝업(다이얼로그) 및 입력 폼 상태 (등록/수정 공용)
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    transaction_id: "",
    type: "분실", // '분실' 또는 '파손'
    description: "",
    responsible_party: ""
  });

  const load = async () => {
    try {
      const [dRes, tRes] = await Promise.all([
        getDamageList(),
        getTransactions() // 거래 내역 선택을 위해 함께 로드
      ]);
      setRows(dRes.data);
      setTransactions(tRes.data || []);
    } catch (err) {
      console.error("데이터를 불러오지 못했습니다.", err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id) => {
    await resolveDamage(id);
    load();
  };

  const handleUnresolve = async (id) => {
    await unresolveDamage(id);
    load();
  };

  // 🗑️ 삭제 기능 추가
  const handleDelete = async (id) => {
    if (window.confirm("정말 이 분실/파손 이력을 삭제하시겠습니까?")) {
      try {
        await deleteDamage(id);
        load();
      } catch (err) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // ➕ 신규 등록 팝업 열기
  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setForm({ transaction_id: "", type: "분실", description: "", responsible_party: "" });
    setOpen(true);
  };

  // ✏️ 수정 팝업 열기
  const handleOpenEdit = (row) => {
    setIsEdit(true);
    setEditId(row.id);
    setForm({
      transaction_id: row.transaction_id,
      type: row.type || "분실",
      description: row.description || "",
      responsible_party: row.responsible_party || ""
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // 💾 저장 (등록 또는 수정 처리)
  const handleSave = async () => {
    if (!form.transaction_id || !form.type) {
      alert("관련 거래 내역과 구분을 선택해주세요.");
      return;
    }

    try {
      const payload = {
        transaction_id: Number(form.transaction_id),
        type: form.type,
        description: form.description,
        responsible_party: form.responsible_party
      };

      if (isEdit) {
        await updateDamage(editId, payload);
        alert("수정되었습니다.");
      } else {
        await createDamage(payload);
        alert("등록되었습니다.");
      }

      handleClose();
      load();
    } catch (err) {
      console.error(err);
      alert(isEdit ? "수정 중 오류가 발생했습니다." : "등록 중 오류가 발생했습니다.");
    }
  };

  // 자재명 또는 회사명 기준으로 실시간 필터링
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
    { 
      key: "type", 
      label: "구분",
      render: (row) => (
        <Chip 
          label={row.type} 
          color={row.type === "분실" ? "error" : "warning"} 
          size="small" 
        />
      )
    },
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
      label: "관리",
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {/* ✏️ 수정 버튼 추가 */}
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={() => handleOpenEdit(row)}
          >
            수정
          </Button>

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

          {/* 🗑️ 삭제 버튼 추가 */}
          <Button 
            size="small" 
            color="error" 
            onClick={() => handleDelete(row.id)}
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <PageContainer>
      {/* 상단 타이틀, 검색창, 신규 등록 버튼 배치 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <PageHeader title="분실 / 파손 이력" description="분실 및 파손 이력을 조회하고 관리하세요." />
        
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            label="자재명 또는 회사명 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="검색어 입력"
            sx={{ width: "240px" }}
          />
          <Button 
            variant="contained" 
            color="error"
            startIcon={<AddIcon />} 
            onClick={handleOpenCreate}
            sx={{ height: "40px" }}
          >
            사고 등록
          </Button>
        </Stack>
      </Box>

      <Table columns={columns} rows={filteredRows} />

      {/* 팝업 다이얼로그 (등록 / 수정 공용) */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? "분실/파손 이력 수정" : "신규 분실/파손 등록"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.2} sx={{ mt: 1 }}>
            
            {/* 어떤 거래 내역에서 발생한 건지 선택 */}
            <Autocomplete
              options={transactions}
              getOptionLabel={(option) => 
                `[${option.type}] 거래처: ${option.company_name || ""} / 자재: ${option.material_name || ""} (${option.qty}개)`
              }
              value={transactions.find(t => t.id === form.transaction_id) || null}
              onChange={(e, newValue) => {
                setForm(f => ({ ...f, transaction_id: newValue ? newValue.id : "" }));
              }}
              renderInput={(params) => <TextField {...params} label="관련 거래 내역 선택 *" size="small" />}
            />

            <TextField
              select
              label="구분 *"
              value={form.type}
              onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
              size="small"
            >
              <MenuItem value="분실">분실</MenuItem>
              <MenuItem value="파손">파손</MenuItem>
            </TextField>

            <TextField
              label="책임 소재"
              value={form.responsible_party}
              onChange={(e) => setForm(f => ({ ...f, responsible_party: e.target.value }))}
              size="small"
            />

            <TextField
              label="설명"
              multiline
              rows={3}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>취소</Button>
          <Button variant="contained" color="error" onClick={handleSave}>
            {isEdit ? "수정" : "등록"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default DamageHistory;