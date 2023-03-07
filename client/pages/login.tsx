import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import Login from "../components/Login";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <>Loading...</>;
  } else if (session) {
    return (
      <>
        <Link href="/">
          If not automatically redireced, go to the index page from here.
        </Link>
      </>
    );
  } else {
    return (
      <>
        <Login />
      </>
    );
  }
}
