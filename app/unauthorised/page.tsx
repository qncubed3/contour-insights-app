import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-6 bg-gray-200 text-black">
            <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8">
                <h1 className="text-2xl font-semibold text-center text-red-500">
                    Access denied
                </h1>

                <p className="mt-3 text-sm text-gray-600 text-center">
                    This app is only available to users with an approved organisation Google account.
                </p>

                <p className="mt-2 text-sm text-gray-600 text-center">
                    Please sign in using your organisation email address.
                </p>

                <Link
                    href="/login"
                    className="mt-6 block w-full text-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700/80"
                >
                    Back to sign in
                </Link>
            </div>
        </main>
    );
}