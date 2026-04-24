import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Google],
    pages: {
        signIn: "/login",
        error: "/unauthorised",
    },
    callbacks: {
        async signIn({ user }) {
            const email = user.email ?? ""
            if (!email.endsWith(`@${allowedDomain}`)) {
                return false
            } 
            return true
        }
    }
})