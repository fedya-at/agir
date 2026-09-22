/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  useTheme,
  Alert,
  TablePagination,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllHistory,
  exportHistoryPdf,
  exportHistoryExcel,
  exportHistoryCsv,
  clearHistory,
  resetHistoryStatus,
} from "../store/historySlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-hot-toast";
import {
  fetchHumanReadableNames,
  fetchUserName,
  formatAction,
  enhanceChanges,
} from "../services/history";

const EXPORT_OPTIONS = [
  { label: "PDF", value: "pdf" },
  { label: "Excel", value: "excel" },
  { label: "CSV", value: "csv" },
];

const HistoryScreen = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const {
    items = [],
    totalCount = 0,
    pageNumber = 1,
    pageSize = 100,
    status = "idle",
    error = null,
  } = useSelector((state) => state.history) || {};

  const [enhancedItems, setEnhancedItems] = useState([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [exportType, setExportType] = useState("");
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const loadHistory = useCallback(() => {
    dispatch(fetchAllHistory({ pageNumber: 1, pageSize: 100 }));
  }, [dispatch]);

  useEffect(() => {
    loadHistory();
    dispatch(resetHistoryStatus());
  }, [dispatch, loadHistory]);

  useEffect(() => {
    const enhanceItems = async () => {
      if (!items.length) {
        setEnhancedItems([]);
        return;
      }

      setIsEnhancing(true);
      try {
        const enhanced = await Promise.all(
          items.map(async (item) => {
            const normalizedUserId = item.userId?.startsWith("user-")
              ? item.userId
              : `user-${item.userId}`;

            return {
              ...item,
              displayEntityName: await fetchHumanReadableNames(
                item.entityName,
                item.entityId
              ),
              displayUserName: await fetchUserName(normalizedUserId),
              displayAction: formatAction(item.action),
              displayChanges: await enhanceChanges(
                item.changes,
                item.entityName,
                dispatch
              ),
            };
          })
        );
        setEnhancedItems(enhanced);
      } catch (error) {
        console.error("Error enhancing items:", error);
        setEnhancedItems(items);
      } finally {
        setIsEnhancing(false);
      }
    };

    enhanceItems();
  }, [items, dispatch]);

  // Paginated data
  const paginatedItems = enhancedItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = async (type) => {
    setExportType(type);
    try {
      let action;
      let mimeType;
      let fileExtension;

      // Determine the appropriate action and file settings
      switch (type) {
        case "pdf":
          action = exportHistoryPdf();
          mimeType = "application/pdf";
          fileExtension = "pdf";
          break;
        case "excel":
          action = exportHistoryExcel();
          mimeType =
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          fileExtension = "xlsx";
          break;
        case "csv":
          action = exportHistoryCsv();
          mimeType = "text/csv";
          fileExtension = "csv";
          break;
        default:
          throw new Error("Unsupported export type");
      }

      // Dispatch the action and wait for the response
      const response = await dispatch(action).unwrap();

      // Create a Blob from the response
      const blob = new Blob([response], { type: mimeType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `history_export.${fileExtension}`);

      // Append to DOM and trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`Export ${type.toUpperCase()} téléchargé !`);
      }, 100);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Échec de l'export ${type.toUpperCase()}: ${error.message}`);
    }
  };

  const handleClear = () => {
    dispatch(clearHistory());
    toast.success("Display cleared", { icon: "🗑️" });
  };

  const handleRefresh = () => {
    loadHistory();
    toast.loading("Refreshing history...", { icon: "🔄" });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Box
        sx={{
          flex: 1,
          p: { xs: 1, md: 4 },
          maxWidth: 1400,
          mx: "auto",
          width: "100%",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight={700}>
            Action History
          </Typography>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          mb={2}
          alignItems="center"
        >
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="export-select-label">Export</InputLabel>
            <Select
              labelId="export-select-label"
              id="export-select"
              value={exportType}
              label="Export"
              onChange={(e) => handleExport(e.target.value)}
              startAdornment={<DownloadIcon sx={{ mr: 1 }} />}
            >
              {EXPORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleClear}
          >
            Clear Display
          </Button>
        </Stack>

        {status === "loading" || isEnhancing ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={200}
          >
            <CircularProgress />
            <Typography variant="body1" ml={2}>
              {status === "loading"
                ? "Loading history..."
                : "Enhancing data..."}
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">
              Error loading history: {error}
              <Button onClick={loadHistory} sx={{ ml: 2 }}>
                Retry
              </Button>
            </Alert>
          </Box>
        ) : (
          <Paper elevation={2} sx={{ width: "100%", overflow: "auto" }}>
            <TableContainer>
              <Table
                stickyHeader
                size="medium"
                sx={{
                  minWidth: 1200,
                  "& th, & td": {
                    fontSize: "1.1rem",
                    padding: "16px 18px",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        backgroundColor: "#667eea",
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #ffffff",
                      }}
                    >
                      Date
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#667eea",
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #ffffff",
                      }}
                    >
                      Action
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#667eea",
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #ffffff",
                      }}
                    >
                      Entity
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#667eea",
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #ffffff",
                      }}
                    >
                      User
                    </TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: "#667eea",
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        borderBottom: "2px solid #ffffff",
                      }}
                    >
                      Changes
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedItems.length > 0 ? (
                    paginatedItems.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.timestamp
                            ? new Date(row.timestamp).toLocaleString()
                            : row.createdAt
                            ? new Date(row.createdAt).toLocaleString()
                            : row.startDate
                            ? new Date(row.startDate).toLocaleString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{row.displayAction}</TableCell>
                        <TableCell>
                          <Tooltip
                            title={`${row.entityName} (${row.entityId})`}
                          >
                            <span>{row.displayEntityName}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={`User ID: ${row.userId}`}>
                            <span>{row.displayUserName}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: "pre-wrap",
                            fontSize: "1em",
                            maxWidth: "400px",
                          }}
                        >
                          {row.displayChanges.split("\n").map((line, i) => {
                            if (line.includes("Technician:")) {
                              return (
                                <div
                                  key={i}
                                  style={{
                                    color: "#1976d2",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {line}
                                </div>
                              );
                            }
                            if (line.includes("Client:")) {
                              return (
                                <div
                                  key={i}
                                  style={{
                                    color: "#388e3c",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {line}
                                </div>
                              );
                            }
                            if (
                              line.includes("Date:") &&
                              !line.includes("None")
                            ) {
                              return (
                                <div
                                  key={i}
                                  style={{
                                    color: "#8d6e63",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {line}
                                </div>
                              );
                            }
                            return <div key={i}>{line}</div>;
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No history records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination Component */}
            <TablePagination
              rowsPerPageOptions={[6, 12, 25, 50]}
              component="div"
              count={enhancedItems.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`
              }
              sx={{
                borderTop: "1px solid rgba(224, 224, 224, 1)",
                "& .MuiTablePagination-toolbar": {
                  paddingLeft: 2,
                  paddingRight: 2,
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#667eea",
                },
                "& .MuiTablePagination-actions button": {
                  color: "#667eea",
                  "&:hover": {
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                  },
                  "&.Mui-disabled": {
                    color: "rgba(0, 0, 0, 0.26)",
                  },
                },
                "& .MuiSelect-select": {
                  "&:focus": {
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                  },
                },
              }}
            />
          </Paper>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default HistoryScreen;
