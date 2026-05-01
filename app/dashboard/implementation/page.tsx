import QuickLinkHeader from "@/components/QuickLinkHeader";

export default function ImplementationPage() {
    return (
        <main className="min-h-screen bg-gray-100 px-6 py-10 text-black">
            <div className="mx-auto w-full max-w-4xl">
                <section className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-[rgb(35,51,92)]">
                        Implementation
                    </h1>
                </section>

                <div className="space-y-4">
                    <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
                        <div className="p-6">
                            <h2 className="font-poly-sans-bulky text-xl font-bold text-[rgb(35,51,92)]">
                                Data Pipeline
                            </h2>

                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                Data is ingested from operational systems, processed through a
                                Python pipeline, and loaded into Snowflake as the central
                                warehouse. The pipeline handles cleaning, schema standardisation,
                                and enrichment such as geocoding to support downstream analytics.
                            </p>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-2xl bg-white shadow-lg">
                        <div className="p-6">
                            <h2 className="font-poly-sans-bulky text-xl font-bold text-[rgb(35,51,92)]">
                                Dashboard & Access
                            </h2>

                            <p className="mt-3 text-sm leading-relaxed text-gray-600">
                                The dashboard is built with Next.js and TypeScript, with API
                                routes querying Snowflake directly. Access is restricted via
                                Google authentication with domain gating, ensuring only
                                authorised users can view internal data products.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}