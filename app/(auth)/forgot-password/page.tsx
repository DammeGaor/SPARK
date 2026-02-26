"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ArrowLeft, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});
type Input = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Input) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
        <h1 className="font-serif text-2xl text-maroon-800 mb-2">Email sent</h1>
        <p className="text-maroon-500 text-sm mb-6 leading-relaxed">
          If that email is registered, you will receive a password reset link shortly.
        </p>
        <Link href="/login"
          className="inline-flex items-center gap-2 text-sm text-maroon-600 hover:text-maroon-900 transition-colors">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-maroon-800 mb-1">Reset password</h1>
        <p className="text-maroon-400 text-sm">Enter your email and we will send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-maroon-700 mb-1.5">
            Email address
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
          {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
            text-parchment-50 text-sm font-medium
            transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #8f1535 0%, #6b0f24 100%)" }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {isLoading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login"
          className="inline-flex items-center gap-2 text-sm text-maroon-500 hover:text-maroon-800 transition-colors">
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
