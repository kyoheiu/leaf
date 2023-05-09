export { default } from "next-auth/middleware";

const matcher = ["/((?!api/health|api/create).*)"];

export const config = { matcher: matcher};
