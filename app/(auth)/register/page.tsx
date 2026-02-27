"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterInput } from "@/lib/utils/validators";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][passwordStrength];
  const strengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-upgreen-400",
    "bg-upgreen-600",
  ][passwordStrength];

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          department: data.department,
          student_id: data.student_id || null,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  }

  if (isSuccess) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-upgreen-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} className="text-upgreen-600" />
        </div>
        <h1 className="font-serif text-2xl text-maroon-800 mb-2">Check your email</h1>
        <p className="text-maroon-500 text-sm mb-6 leading-relaxed">
          We have sent a confirmation link to your email. Please verify your account before signing in.
        </p>
        <Link href="/login"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg
            text-parchment-50 text-sm font-medium transition-all"
          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-maroon-800 mb-1">Create account</h1>
        <p className="text-maroon-400 text-sm">Join the SPARK academic repository.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-maroon-700 mb-1.5">
            Full name
          </label>
          <input
            id="full_name"
            type="text"
            autoComplete="name"
            placeholder="Juan dela Cruz"
            {...register("full_name")}
            className="w-full px-4 py-2.5 rounded-lg border border-maroon-200 bg-white text-maroon-900
              placeholder-maroon-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
          />
          {errors.full_name && (
            <p className="mt-1.5 text-xs text-red-600">{errors.full_name.message}</p>
          )}
        </div>

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
              focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Department + Student ID */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-maroon-700 mb-1.5">
              Department
            </label>
            <input
              id="department"
              type="text"
              placeholder="e.g. DCSC"
              {...register("department")}
              className="w-full px-4 py-2.5 rounded-lg border border-maroon-200 bg-white text-maroon-900
                placeholder-maroon-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
            />
            {errors.department && (
              <p className="mt-1.5 text-xs text-red-600">{errors.department.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="student_id" className="block text-sm font-medium text-maroon-700 mb-1.5">
              Student No. <span className="text-maroon-400 font-normal">(optional)</span>
            </label>
            <input
              id="student_id"
              type="text"
              placeholder="2024-00001"
              {...register("student_id")}
              className="w-full px-4 py-2.5 rounded-lg border border-maroon-200 bg-white text-maroon-900
                placeholder-maroon-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-maroon-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register("password")}
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-maroon-200 bg-white text-maroon-900
                placeholder-maroon-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-300 hover:text-maroon-600 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= passwordStrength ? strengthColor : "bg-maroon-100"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-maroon-400">{strengthLabel}</p>
            </div>
          )}
          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-maroon-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register("confirm_password")}
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-maroon-200 bg-white text-maroon-900
                placeholder-maroon-300 text-sm
                focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-300 hover:text-maroon-600 transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password && (
            <p className="mt-1.5 text-xs text-red-600">{errors.confirm_password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg mt-2
            text-parchment-50 text-sm font-medium
            transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
            shadow-sm hover:shadow-md active:scale-[0.99]"
          style={{ background: isLoading ? "#a01c3a" : "linear-gradient(135deg, #8f1535 0%, #6b0f24 100%)" }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-maroon-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-parchment-50 px-3 text-xs text-maroon-400">
            Already have an account?
          </span>
        </div>
      </div>

      <Link href="/login"
        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg
          border-2 border-upgreen-600 bg-transparent hover:bg-upgreen-50
          text-upgreen-700 text-sm font-medium transition-all duration-150">
        Sign in instead
      </Link>

      <p className="mt-6 text-center text-xs text-maroon-400">
        By creating an account, you agree to our{" "}
        <Link href="/terms?from=/register" className="underline hover:text-maroon-700">terms of use</Link>.
      </p>
    </div>
  );
}
