import { Box, Button } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <>
      <Box className="login">
        <div className="element-title">acidpaper</div>
        <div className="element-beginning">
          Where you stack every documents.
        </div>
        <Button
          className="login-button"
          variant="contained"
          onClick={() => signIn()}
        >
          <LoginIcon />
        </Button>
      </Box>
    </>
  );
}
