import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Login from "../components/Login";

export default function LoginPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <>Loading...</>;
  } else {
    if (!session) {
      return (
        <>
          <Login />
        </>
      );
    } else {
      return (
        <>
          <Link href="/">Go to the index page from here.</Link>
        </>
      );
    }
  }
}
