"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        await signIn("google", {
            callbackUrl: "/dashboard",
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-6 bg-gray-200">
            <div className={"flex w-full max-w-md flex-col gap-6"}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Sign in</CardTitle>
                        <CardDescription>
                            Sign in with your organisation Google account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <Button
                                onClick={handleGoogleSignIn}
                                className="w-full flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                {/* Google icon */}
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="
                                            M21.35 11.1h-9.18v2.92h5.3c-.23 1.25-1.42 3.67-5.3 3.67
                                            -3.19 0-5.79-2.64-5.79-5.9s2.6-5.9 5.79-5.9c1.82 0 3.05.78
                                            3.75 1.45l2.56-2.48C16.97 3.5 14.8 2.5 12.17 2.5
                                            6.93 2.5 2.75 6.74 2.75 12s4.18 9.5 9.42 9.5
                                            c5.43 0 9.02-3.82 9.02-9.2 0-.62-.07-1.1-.16-1.6z
                                        "
                                    />
                                </svg>

                                {isLoading ? "Redirecting..." : "Continue with Google"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}