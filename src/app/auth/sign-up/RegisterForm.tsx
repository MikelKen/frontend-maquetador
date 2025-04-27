"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth_store";
import { API_ROUTES } from "@/lib/api.routes";
import Image from "next/image";

export function SignUpForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const setResgisterSuccessMessage = useAuthStore((state) => state.setRegisterSuccessMessage);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ROUTES.SIGN_UP.url, {
        method: API_ROUTES.SIGN_UP.method,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.detail || "Error al registrarse");
        return;
      }
      console.log(response);
      setResgisterSuccessMessage("Registro exitoso. Inicia sesion");
      router.push("/auth/sign-in");
    } catch (err) {
      console.error("Error:", err);
      alert("Ocurrion un error");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome</h1>
                <p className="text-muted-foreground text-balance">Create your account</p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  placeholder="User Name"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-700 to-blue-600 hover:from-cyan-600 hover:to-blue-500 text-white font-semibold rounded-md shadow-md transition-all duration-300"
              >
                Sign UP
              </Button>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">Or continue with</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" type="button" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/sign-in" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
          <div className="relative hidden md:block overflow-hidden rounded-md">
            <Image
              src="/assets/image3.jpg"
              alt="Image"
              width={1000}
              height={1000}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
