import { Header } from "@/components/Header";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            <main className="pt-20 px-6 py-8">
                <div className="mx-auto w-full max-w-4xl">
                    {children}
                </div>
            </main>
        </div>
    );
}