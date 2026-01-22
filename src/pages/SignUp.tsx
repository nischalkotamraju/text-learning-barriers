"use client";
import React, { useState } from "react";
import { Label } from "../components/Label";
import { Input } from "../components/Input";
import { cn } from "../lib/utils";
import { auth, db } from "../lib/firebaseClient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstname = formData.get("firstname") as string;
    const lastname = formData.get("lastname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optionally update display name
      await updateProfile(user, {
        displayName: `${firstname} ${lastname}`,
      });

      // Store additional user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstname,
        lastname,
        email,
        createdAt: new Date().toISOString(),
      });

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3">
            Create Account
          </h2>
          <p className="text-white/50 text-sm">
            Join us to start transforming your learning experience
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <LabelInputContainer>
              <Label htmlFor="firstname">
                First Name
              </Label>
              <Input
                id="firstname"
                name="firstname"
                placeholder="John"
                type="text"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">
                Last Name
              </Label>
              <Input
                id="lastname"
                name="lastname"
                placeholder="Doe"
                type="text"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </LabelInputContainer>
          </div>
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
              placeholder="Create a secure password"
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          <div className="text-center text-sm text-white/50">
            Already have an account?{" "}
            <a href="/login" className="text-white hover:underline">Log in</a>
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
