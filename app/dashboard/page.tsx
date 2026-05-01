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
    <main className="min-h-screen bg-gray-100 px-6 py-10 text-black">
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
            <div className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <QuickLinkCard
                  href="/dashboard/map"
                  title="Spatiotemporal Map"
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
              </div>

              <div className="sm:col-span-2">
                <QuickLinkCard
                  href="/dashboard/attendance"
                  title="Attendance Insights"
                  subtitle="Explore factors affecting student attendance"
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
                      <path d="M3 3v18h18" />
                      <path d="M7 16l4-4 3 3 5-7" />
                      <path d="M7 16h.01" />
                      <path d="M11 12h.01" />
                      <path d="M14 15h.01" />
                      <path d="M19 8h.01" />
                    </svg>
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <QuickLinkCard
                  href="/dashboard/implementation"
                  title="Implementation Details"
                  subtitle="Pipeline, Snowflake, auth, and dashboard architecture"
                  colorClass="bg-[rgb(35,51,92)]"
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
                      <path d="M4 7h16" />
                      <path d="M4 12h16" />
                      <path d="M4 17h16" />
                      <circle cx="8" cy="7" r="1" />
                      <circle cx="8" cy="12" r="1" />
                      <circle cx="8" cy="17" r="1" />
                    </svg>
                  }
                />
              </div>

              <QuickLinkCard
                href="https://github.com/qncubed3/contour-data-pipeline"
                title="Data Pipeline"
                subtitle="GitHub repository"
                colorClass="bg-gray-900"
                newTab
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-white"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.41 7.86 10.94.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.2-3.07-.12-.29-.52-1.46.11-3.03 0 0 .98-.31 3.2 1.17a11.1 11.1 0 0 1 5.83 0c2.22-1.48 3.2-1.17 3.2-1.17.63 1.57.23 2.74.11 3.03.75.8 1.2 1.82 1.2 3.07 0 4.4-2.69 5.37-5.25 5.65.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                  </svg>
                }
              />

              <QuickLinkCard
                href="https://github.com/qncubed3/contour-insights-app"
                title="Dashboard App"
                subtitle="GitHub repository"
                colorClass="bg-gray-900"
                newTab
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5 text-white"
                  >
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.41 7.86 10.94.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.73 1.27 3.4.97.1-.75.41-1.27.74-1.56-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.2-3.07-.12-.29-.52-1.46.11-3.03 0 0 .98-.31 3.2 1.17a11.1 11.1 0 0 1 5.83 0c2.22-1.48 3.2-1.17 3.2-1.17.63 1.57.23 2.74.11 3.03.75.8 1.2 1.82 1.2 3.07 0 4.4-2.69 5.37-5.25 5.65.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                  </svg>
                }
              />
            </div>

            <div className="pt-6 pb-2 text-center text-gray-500 text-sm text-muted-foreground">
              More insights coming soon
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}