"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { getAuthenticatedPath } from "@/lib/role-utils"
import { AuthSession } from "@/types/auth.type"


type UserRole = "CUSTOMER" | "SELLER"

type SignupExtras = {
  role: UserRole
  phone: string
  status: "ACTIVE"
}

type FormData = {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
  agreeTerms: boolean
}

/* ------------------ Component ------------------ */

export function RegisterForm(props: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
    agreeTerms: false
  })

  /* -------- Google Signup -------- */
  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true)
      toast.loading("Connecting to Google...")
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/api/auth/callback/google",
      })
      
      // Get user session to determine role
      const session = (await authClient.getSession()) as AuthSession

      if (session.data?.user?.role) {
        const dashboardPath = getAuthenticatedPath(session.data.user.role)
        router.push(dashboardPath)
      } else {
        router.push("/")
      }
      
      toast.success("Google sign up successful!")
    } catch (error) {
      console.error("Google sign up failed:", error)
      toast.error("Google sign up failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  /* -------- Handle Input Change -------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }))
    } else if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value as UserRole
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  /* -------- Reset Form -------- */
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "CUSTOMER",
      agreeTerms: false
    })
    setShowPassword(false)
  }

  /* -------- Handle Submit -------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.agreeTerms) {
      toast.error("You must agree to the Terms & Conditions")
      return
    }

    setIsLoading(true)
    
    // Show loading toast
    const loadingToast = toast.loading("Creating your account...")

    const extras = {
      role: formData.role,
      phone: formData.phone,
      status: "ACTIVE",
    } satisfies SignupExtras

    try {
      await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        ...extras,
      })

      // Success - Get user session to determine role and redirect
      const session = (await authClient.getSession()) as AuthSession

      
      toast.dismiss(loadingToast)
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Account Created Successfully!</p>
          <p className="text-sm">We have sent a verification email to <strong>{formData.email}</strong></p>
          <p className="text-xs text-muted-foreground">Please check your inbox and verify your email.</p>
        </div>,
        {
          duration: 6000, // Show longer
          position: "top-center",
        }
      )

      // Reset form and redirect to dashboard based on role
      resetForm()
      
      if (session.data?.user?.role) {
        const dashboardPath = getAuthenticatedPath(session.data.user.role)
        setTimeout(() => router.push(dashboardPath), 2000)
      } else {
        setTimeout(() => router.push("/"), 2000)
      }

    } catch (error: unknown) { // Changed from 'any' to 'unknown'
      console.error("Registration failed:", error)
      
      toast.dismiss(loadingToast)
      
      // Handle specific errors with type checking
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      
      if (errorMessage.toLowerCase().includes("email already exists") || 
          errorMessage.toLowerCase().includes("email already in use")) {
        toast.error(
          <div>
            <p>Email already registered</p>
            <p className="text-sm">Try <Link href="/login" className="underline">logging in</Link> instead</p>
          </div>,
          { duration: 5000 }
        )
      } else if (errorMessage.toLowerCase().includes("password")) {
        toast.error("Password must be at least 8 characters")
      } else if (errorMessage.toLowerCase().includes("email")) {
        toast.error("Please enter a valid email address")
      } else {
        toast.error("Registration failed. Please try again.")
      }
      
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card {...props} className="border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Join <span className="font-medium text-emerald-600">MediStore</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role */}
          <div>
            <p className="text-sm mb-2">Register as</p>
            <div className="flex gap-2">
              {(["CUSTOMER", "SELLER"] as const).map((r) => (
                <label key={r} className="flex-1">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={formData.role === r}
                    onChange={handleInputChange}
                    className="peer hidden"
                    disabled={isLoading}
                  />
                  <div className="cursor-pointer rounded-md border px-3 py-2 text-center peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-colors hover:bg-gray-50">
                    {r === "CUSTOMER" ? "Customer" : "Seller"}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <Input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />

          <Input
            name="phone"
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />

          {/* Password */}
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              minLength={8}
              required
              className="pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              required
              className="mt-1"
              disabled={isLoading}
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" className="text-emerald-600 hover:underline">
                Terms & Conditions
              </Link>
            </span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2">OR</span>
            </div>
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleRegister}
            disabled={isLoading}
          >
            Continue with Google
          </Button>

          {/* Login */}
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}