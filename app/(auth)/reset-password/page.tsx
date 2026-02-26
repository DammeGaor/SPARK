"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

type Input = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Input>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: Input) {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Password updated successfully.");
    router.push("/login");
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-maroon-800 mb-1">New password</h1>
        <p className="text-maroon-400 text-sm">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-maroon-700 mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full px-4 py-2.5 pr-10 rounded-lg border border-maroon-200 bg-white text-maroon-900 text-sm
                focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-300 hover:text-maroon-600 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-maroon-700 mb-1.5">
            Confirm new password
          </label>
          <input
            id="confirm_password"
            type="password"
            {...register("confirm_password")}
            className="w-full px-4 py-2.5 rounded-lg border border-maroon-200 bg-white text-maroon-900 text-sm
              focus:outline-none focus:ring-2 focus:ring-maroon-600 focus:border-transparent transition-all"
          />
          {errors.confirm_password && <p className="mt-1.5 text-xs text-red-600">{errors.confirm_password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
            text-parchment-50 text-sm font-medium transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #8f1535 0%, #6b0f24 100%)" }}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
          {isLoading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
