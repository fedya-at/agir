import React, { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const TogglePasswordVisibility = ({ password, setPassword, itemVariants }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <motion.div variants={itemVariants}>
      <TextField
        label="Mot de passe"
        type={showPassword ? "text" : "password"}
        fullWidth
        margin="normal"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={togglePasswordVisibility} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </motion.div>
  );
};

export default TogglePasswordVisibility;
