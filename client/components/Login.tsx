import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LoginIcon from "@mui/icons-material/Login";
import { signIn } from "next-auth/react";

export default function Login() {
  return (
    <>
      <Box className="login">
        <div className="element-title">hmstr</div>
        <Button
          className="login-button"
          variant="outlined"
          onClick={() => signIn()}
        >
          Log in
        </Button>
      </Box>
    </>
  );
}
