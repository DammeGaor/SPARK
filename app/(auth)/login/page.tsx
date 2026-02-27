"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/utils/validators";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-maroon-800 mb-1">Welcome back</h1>
        <p className="text-maroon-400 text-sm">
          Sign in to access the SPARK repository.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-maroon-700 mb-1.5">
            Institutional email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@up.edu.ph"
            {...register("email")}
            className="w-full px-4 py-2.5 rounded-lg border border-maroon-200 bg-white text-maroon-900
              placeholder-maroon-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent
              transition-all duration-150"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-maroon-700">
              Password
            </label>
            <Link href="/forgot-password"
              className="text-xs text-upgreen-600 hover:text-upgreen-800 transition-colors font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register("password")}
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-maroon-200 bg-white
                text-maroon-900 placeholder-maroon-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent
                transition-all duration-150"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-300 hover:text-maroon-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
            text-parchment-50 text-sm font-medium
            transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md active:scale-[0.99]"
          style={{ background: isLoading ? "#a01c3a" : "linear-gradient(135deg, #8f1535 0%, #6b0f24 100%)" }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <LogIn size={16} />
          )}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-maroon-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-parchment-50 px-3 text-xs text-maroon-400">
            New to SPARK?
          </span>
        </div>
      </div>

      <Link href="/register"
        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg
          border-2 border-upgreen-600 bg-transparent hover:bg-upgreen-50
          text-upgreen-700 text-sm font-medium transition-all duration-150">
        Create an account
      </Link>

      <p className="mt-6 text-center text-xs text-maroon-400">
        By signing in, you agree to your institution's{" "}
        <Link href="/terms?from=/login" className="underline hover:text-maroon-700">terms of use</Link>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
