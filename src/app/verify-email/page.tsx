"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus("error");
                return;
            }

            try {
                const response = await fetch("https://medi-store-api.vercel.app/api/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (data.success) {
                    setStatus("success");
                    // ✅ CHANGED: Redirect to /login
                    setTimeout(() => router.push("/login"), 3000);
                } else {
                    setStatus("error");
                }

            } catch (error) {
                setStatus("error");
            }
        };

        verifyEmail();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                
                {status === "loading" && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                        <h1 className="text-xl font-bold">Verifying Email</h1>
                        <p className="text-gray-600">Please wait...</p>
                    </>
                )}
                
                {status === "success" && (
                    <>
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                        <p className="text-gray-600">Redirecting to login...</p>
                        <div className="mt-4 h-1 w-32 bg-gray-200 rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-green-500 animate-progress"></div>
                        </div>
                    </>
                )}
                
                {status === "error" && (
                    <>
                        <div className="text-red-500 text-5xl mb-4">✗</div>
                        <h1 className="text-2xl font-bold mb-2">Failed</h1>
                        <p className="text-gray-600 mb-4">Verification failed</p>
                        <button
                            onClick={() => router.push("/login")} 
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Go to Login
                        </button>
                    </>
                )}
                
            </div>
        </div>
    );
}