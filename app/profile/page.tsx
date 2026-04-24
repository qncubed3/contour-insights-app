
import { auth, signIn, signOut } from "@/auth"

export default async function SignIn() {
    const session = await auth();
    const user = session?.user
    console.log(session)
    
    return user ? 
    (
        <>
            <h1 className="text-2xl">
                Welcome {user.name}
            </h1>
            <form
                action={async () => {
                    "use server"
                    await signOut()
                }}
            >
                <button className="p-2 border-2 bg-blue-400">
                    Sign Out
                </button>
            </form>
        </>
    )
    :
    (
        <>
            <h1 className="text-xl">You are not authenticated. Click below.</h1>
            <form
                action={async () => {
                    "use server"
                    await signIn("google")
                }}
            >
                <button className="p-2 border-2 bg-blue-400">Signin with Google</button>
            </form>
        </>
    )
} 