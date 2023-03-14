export { default } from "next-auth/middleware";

export const config = {
	matcher: ["/((?!api/health|api/create|manifest.json).*)"],
};
