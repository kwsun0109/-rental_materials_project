import { useState } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
} from "@mui/material";

function Table({ columns, rows, rowsPerPage = 10 }) {
  const [page, setPage] = useState(0);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const pagedRows = rows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: "transparent",
        overflow: "hidden",
        width: "100%", // 폭을 100%로 설정
      }}
    >
      {/* 폭 제한을 없애고 전체 영역을 쓰도록 수정 */}
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <MuiTable 
          size="small" 
          sx={{ 
            width: "100%", // 테이블 자체도 100%로 확장
            "& th, & td": {
              whiteSpace: "nowrap", 
              px: 1,
              py: 1,
            }
          }}
        >
          <TableHead sx={{ backgroundColor: "action.hover" }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 700, color: "text.primary" }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              pagedRows.map((row, idx) => (
                <TableRow 
                  key={row.id ?? idx}
                  sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} sx={{ color: "text.secondary" }}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {rows.length > 0 && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          labelRowsPerPage=""
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} / 총 ${count}건`}
        />
      )}
    </Paper>
  );
}

export default Table;