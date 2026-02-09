import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const PersonDetailsModal = ({ open, onClose, person, title }) => {
  const isTechnician = title.includes("Technician");

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "600px" },
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 4,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {person ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">{person.name}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{person.email}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">{person.phone}</Typography>
            </Box>

            {isTechnician ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Specialization
                </Typography>
                <Typography variant="body1">{person.specialization}</Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">{person.address}</Typography>
              </Box>
            )}

            {isTechnician && person.experience && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Experience
                </Typography>
                <Typography variant="body1">{person.experience}</Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={onClose}>
                Close
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography>
            No {isTechnician ? "technician" : "client"} information available
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default PersonDetailsModal;
