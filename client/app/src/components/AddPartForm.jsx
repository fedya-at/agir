import { useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-hot-toast";

const AddPartForm = ({ parts, onAdd, onCancel, isLoading }) => {
  const [selectedPart, setSelectedPart] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedPart || quantity < 1) {
      toast.error("Please select a part and enter a valid quantity");
      return;
    }

    onAdd({ partId: selectedPart, quantity });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Select
        value={selectedPart}
        onChange={(e) => setSelectedPart(e.target.value)}
        fullWidth
        required
      >
        <MenuItem value="" disabled>
          Select a part
        </MenuItem>
        {parts.map((part) => (
          <MenuItem key={part.id} value={part.id}>
            {part.name} ({part.price} DT) | Quantity: {part.stockQuantity}
          </MenuItem>
        ))}
      </Select>

      <TextField
        type="number"
        label="Quantity"
        value={quantity}
        onChange={(e) =>
          setQuantity(Math.max(1, parseInt(e.target.value) || 1))
        }
        fullWidth
        required
        margin="normal"
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : "Add Part"}
        </Button>
      </Box>
    </form>
  );
};

export default AddPartForm;
