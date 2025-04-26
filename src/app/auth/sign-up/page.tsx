"use client";
import React from "react";
import { SignUpForm } from "./RegisterForm";
import BackgroundLayout from "@/components/BackgroundLayout";

function SignUp() {
  return (
    <BackgroundLayout>
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <SignUpForm />
        </div>
      </div>
    </BackgroundLayout>
  );
}

export default SignUp;
