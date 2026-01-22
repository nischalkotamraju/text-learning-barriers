"use client";
import React, { useState } from "react";
import { Label } from "../components/Label";
import { Input } from "../components/Input";
import { cn } from "../lib/utils";
import { auth } from "../lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";

export function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "/dashboard";
        } catch (err: any) {
            setError(err.message || "Failed to log in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-white mb-3">
                        Welcome Back
                    </h2>
                    <p className="text-white/50 text-sm">
                        Log in to continue to your dashboard
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <LabelInputContainer>
                        <Label htmlFor="email">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="your@email.com"
                            type="email"
                            required
                            className="focus:outline-none focus:ring-0 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                    </LabelInputContainer>
                    <LabelInputContainer>
                        <Label htmlFor="password">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            type="password"
                            required
                            className="focus:outline-none focus:ring-0 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                        />
                    </LabelInputContainer>
                    {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>}
                    <button
                        className="relative block h-12 w-full rounded-full font-semibold text-black bg-white hover:bg-white/90 transition-all duration-300 hover:scale-[1.02]"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging In..." : "Log In"}
                    </button>
                    <div className="text-center text-sm text-white/50">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-white hover:underline">Sign up</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};
