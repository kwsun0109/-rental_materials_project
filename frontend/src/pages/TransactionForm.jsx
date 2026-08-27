import { useState, useEffect } from "react";
import {
  Box, Typography, TextField, MenuItem, Button, Stack, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getMaterials, getCompanies, createTransaction,
  getTransactions, updateTransaction, deleteTransaction,
} from "../api";
import PageContainer from "../components/PageContainer";
import PageHeader from "../components/PageHeader";
import Table from "../components/Table";

const emptyForm = {
  material_id: "",
  company_id: "",
  type: "반입",
  qty: "",
  rental_start_date: "",
  rental_due_date: "",
  note: "",
};

function TransactionForm() {
  const [materials, setMaterials] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState("");

  const loadAll = async () => {
    try {
      const [mRes, cRes, tRes] = await Promise.all([
        getMaterials(),
        getCompanies(),
        getTransactions(),
      ]);
      setMaterials(mRes.data || []);
      setCompanies(cRes.data || []);
      setTransactions(tRes.data || []);
    } catch (err) {
      setError("데이터를 불러오는 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const materialName = (materialId) => {
    const found = materials.find((m) => Number(m.id) === Number(materialId));
    return found ? found.name : materialId;
  };

  const companyName = (companyId) => {
    const found = companies.find((c) => Number(c.id) === Number(companyId));
    return found ? found.name : companyId;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createTransaction({
        ...form,
        material_id: Number(form.material_id),
        company_id: Number(form.company_id),
        qty: Number(form.qty),
        rental_start_date: form.rental_start_date || null,
        rental_due_date: form.rental_due_date || null,
      });
      setSuccess("등록되었습니다.");
      setForm(emptyForm);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEdit = (row) => {
    setEditForm({
      id: row.id,
      material_id: row.material_id,
      company_id: row.company_id,
      type: row.type,
      qty: row.qty,
      rental_start_date: row.rental_start_date ?? "",
      rental_due_date: row.rental_due_date ?? "",
      note: row.note ?? "",
    });
    setEditError("");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditForm(null);
  };

  const handleEditChange = (field) => (e) => {
    setEditForm({ ...editForm, [field]: e.target.value });
  };

  const handleEditSave = async () => {
    setEditError("");
    try {
      await updateTransaction(editForm.id, {
        material_id: Number(editForm.material_id),
        company_id: Number(editForm.company_id),
        type: editForm.type,
        qty: Number(editForm.qty),
        rental_start_date: editForm.rental_start_date || null,
        rental_due_date: editForm.rental_due_date || null,
        note: editForm.note,
      });
      closeEdit();
      loadAll();
    } catch (err) {
      setEditError(err.message);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`#${row.id} 내역을 삭제할까요?`)) return;
    try {
      await deleteTransaction(row.id);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  // 💡 드롭다운 목록이 딱 10개 정도 높이까지만 보이고 스크롤바가 생기도록 설정하는 스타일
  const menuPropsStyle = {
    MenuProps: {
      PaperProps: {
        style: {
          maxHeight: "360px", // 높이 제한 (항목 약 10개 분량)
          border: "1px solid #e5e4e7",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        },
      },
    },
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "material_id", label: "자재", render: (row) => materialName(row.material_id) },
    { key: "company_id", label: "거래처", render: (row) => companyName(row.company_id) },
    { key: "type", label: "구분" },
    { key: "qty", label: "수량" },
    { key: "rental_start_date", label: "시작일", render: (row) => row.rental_start_date ?? "-" },
    { key: "rental_due_date", label: "반납예정일", render: (row) => row.rental_due_date ?? "-" },
    { key: "returned_at", label: "반납일", render: (row) => row.returned_at ? row.returned_at.slice(0, 10) : "-" },
    {
      key: "actions",
      label: "관리",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader 
        title="반입 / 반출 등록" 
        description="자재 반입·반출 내역을 등록하고 관리하세요." 
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ display: "flex", gap: 3, alignItems: "stretch", width: "100%" }}>
        
        {/* 왼쪽: 신규 등록 폼 */}
        <Box sx={{ width: "400px", flexShrink: 0, display: "flex" }}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              p: 3.5, 
              backgroundColor: "background.paper",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                신규 등록
              </Typography>
              <form onSubmit={handleSubmit}>
                <Stack spacing={2.2}>
                  <TextField
                    select fullWidth label="자재 *" value={form.material_id}
                    onChange={handleChange("material_id")} required size="small"
                    SelectProps={menuPropsStyle.MenuProps}
                  >
                    {materials.map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select fullWidth label="거래처 *" value={form.company_id}
                    onChange={handleChange("company_id")} required size="small"
                    SelectProps={menuPropsStyle.MenuProps}
                  >
                    {companies.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select fullWidth label="구분 *" value={form.type}
                    onChange={handleChange("type")} required size="small"
                  >
                    <MenuItem value="반입">반입</MenuItem>
                    <MenuItem value="반출">반출</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth label="수량 *" type="number" value={form.qty}
                    onChange={handleChange("qty")} required size="small"
                  />

                  {form.type === "반출" && (
                    <>
                      <TextField
                        fullWidth label="임대 시작일" type="date" value={form.rental_start_date}
                        onChange={handleChange("rental_start_date")}
                        InputLabelProps={{ shrink: true }} size="small"
                      />
                      <TextField
                        fullWidth label="반납 예정일" type="date" value={form.rental_due_date}
                        onChange={handleChange("rental_due_date")}
                        InputLabelProps={{ shrink: true }} size="small"
                      />
                    </>
                  )}

                  <TextField
                    fullWidth label="비고" multiline rows={13} value={form.note}
                    onChange={handleChange("note")} size="small"
                  />
                </Stack>
              </form>
            </Box>

            <Box sx={{ pt: 3 }}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                size="large" 
                onClick={handleSubmit}
                sx={{ py: 1.2, fontWeight: 600 }}
              >
                등록하기
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* 오른쪽: 등록 내역 리스트 */}
        <Box sx={{ flexGrow: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, height: "32px" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              등록 내역 ({transactions.length}건)
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Table columns={columns} rows={transactions} />
          </Box>
        </Box>

      </Box>

      {/* 수정 다이얼로그 */}
      <Dialog open={editOpen} onClose={closeEdit} fullWidth maxWidth="xs">
        <DialogTitle>거래 내역 수정 (#{editForm?.id})</DialogTitle>
        <DialogContent>
          {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
          {editForm && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select label="자재" value={editForm.material_id}
                onChange={handleEditChange("material_id")} required size="small"
                SelectProps={menuPropsStyle.MenuProps}
              >
                {materials.map((m) => (
                  <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select label="거래처" value={editForm.company_id}
                onChange={handleEditChange("company_id")} required size="small"
                SelectProps={menuPropsStyle.MenuProps}
              >
                {companies.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select label="구분" value={editForm.type}
                onChange={handleEditChange("type")} size="small"
              >
                <MenuItem value="반입">반입</MenuItem>
                <MenuItem value="반출">반출</MenuItem>
              </TextField>

              <TextField
                label="수량" type="number" value={editForm.qty}
                onChange={handleEditChange("qty")} size="small"
              />

              <TextField
                label="임대 시작일" type="date" value={editForm.rental_start_date}
                onChange={handleEditChange("rental_start_date")}
                InputLabelProps={{ shrink: true }} size="small"
              />
              <TextField
                label="반납 예정일" type="date" value={editForm.rental_due_date}
                onChange={handleEditChange("rental_due_date")}
                InputLabelProps={{ shrink: true }} size="small"
              />

              <TextField
                label="비고" multiline rows={2} value={editForm.note}
                onChange={handleEditChange("note")} size="small"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>취소</Button>
          <Button variant="contained" onClick={handleEditSave}>저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TransactionForm;