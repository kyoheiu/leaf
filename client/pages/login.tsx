import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Login from "../components/Login";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <>Loading...</>;
  }

  if (session) {
    router.push("/");
    router.reload();
  } else {
    return (
      <>
        <Login />
      </>
    );
  }
}
