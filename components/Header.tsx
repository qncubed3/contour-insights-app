import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function Header() {
    const session = await auth();
    const user = session?.user;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-md flex items-center justify-between px-6">
            {/* Left: Logo */}
            <Link
                href="/dashboard"
                className="text-lg font-extrabold tracking-tight text-black hover:opacity-80 transition cursor-pointer"
                style={{ fontFamily: "'PolySans', sans-serif" }}
            >
                <span className="text-black">Contour</span>
                <span className="text-blue-500"> Insights</span>
            </Link>

            {/* Right: Auth controls */}
            {user ? (
                <div className="flex items-center gap-4">
                    <span className="text-sm text-zinc-600 hidden sm:block">
                        {user.name}
                    </span>

                    <form
                        action={async () => {
                            "use server";
                            await signOut();
                        }}
                    >
                        <button className="px-3 py-1 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-sm text-black">
                            Sign out
                        </button>
                    </form>
                </div>
            ) : null}
        </header>
    );
}