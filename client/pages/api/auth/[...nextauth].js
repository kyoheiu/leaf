import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				id: { label: "id", type: "text" },
				password: { label: "password", type: "password" },
			},
			async authorize(credentials, _req) {
				if (
					credentials &&
					credentials.id === process.env.CREDENTIALS_ID &&
					credentials.password === process.env.CREDENTIALS_PASSWORD
				) {
					return {
						isLoggedIn: true,
					};
				} else {
					return null;
				}
			},
		}),
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		}),
	],
	session: { strategy: "jwt" },
	secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
