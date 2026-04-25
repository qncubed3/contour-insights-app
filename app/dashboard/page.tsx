import QuickLinkHeader from "@/components/QuickLinkHeader";
import QuickLinkCard from "@/components/QuickLinkCard";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  const name =
    session?.user?.name ??
    session?.user?.email?.split("@")[0] ??
    "there";

  return (
    <main className="min-h-screen bg-gray-200 px-6 py-10 text-black">
      <div className="mx-auto w-full max-w-4xl">
        <section className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[rgb(35,51,92)]">
            Welcome back,{" "}
            <span className="font-semibold">{name}</span>
          </h1>

        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <QuickLinkHeader />

          <div className="p-6">
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
              

              <QuickLinkCard
                href="/dashboard/map"
                title="Spatiotemporal map"
                subtitle="Interactive map of student enrolments over time"
                colorClass="bg-[rgb(0,88,200)]"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-white"
                  >
                    {/* Map pin */}
                    <path d="M12 21s-6-5.5-6-10a6 6 0 1 1 12 0c0 4.5-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2" />

                    {/* Data points */}
                    <circle cx="5" cy="6" r="1" />
                    <circle cx="19" cy="7" r="1" />
                    <circle cx="17" cy="18" r="1" />
                  </svg>
                }
              />
              <QuickLinkCard
                href="#"
                title="Book Trial"
                subtitle="Schedule a free trial session"
                colorClass="bg-[rgb(255,167,55)]"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-white"
                  >
                    <path d="M12 7v14" />
                    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}