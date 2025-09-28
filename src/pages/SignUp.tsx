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
    <div className="shadow-input mx-auto w-full max-w-2xl rounded-none p-4 md:rounded-2xl md:p-8">
      <h2 className="text-xl font-bold text-blue-200 mt-36">
        Welcome! Create your account below.
      </h2>
      <div className="my-8 flex flex-col md:flex-row md:space-x-8">
        <form className="flex-1" onSubmit={handleSubmit}>
          <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <LabelInputContainer>
              <Label htmlFor="firstname">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstname"
                name="firstname"
                placeholder="Tyler"
                type="text"
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastname"
                name="lastname"
                placeholder="Durden"
                type="text"
                required
              />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              placeholder="projectmayhem@fc.com"
              type="email"
              required
              className="focus:outline-none focus:ring-0"
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              required
              className="focus:outline-none focus:ring-0"
            />
          </LabelInputContainer>

          {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
          <button
            className=" relative block h-10 w-full rounded-md font-medium text-white border border-blue-200 hover:bg-blue-200 hover:text-black duration-300"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
            <BottomGradient />
          </button>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500" />
    </>
  );
};

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
