"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Mail, Lock, Eye, EyeOff, NotepadText } from "lucide-react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client" // Ensure this path matches your project structure

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast.error(error.message || "Invalid email or password")
        return
      }

      // Optional: Check if user object exists immediately
      if (!data) {
         toast.error("Login failed. Please try again.")
         return
      }

      toast.success("Welcome back!")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border/50 shadow-xl bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <CardHeader className="space-y-1 text-center">
        {/* Brand Logo - Matching Navbar Style */}
        <div className="flex justify-center mb-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20">
              <NotepadText className="h-5 w-5" />
            </div>
            <span className="text-2xl">Time Arena</span>
          </Link>
        </div>
        
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="name@example.com" 
                        className="pl-10 bg-background/50" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    {/* Optional: Add Forgot Password link here later */}
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="pl-10 pr-10 bg-background/50" 
                        {...field} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">Toggle password visibility</span>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full font-semibold shadow-sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}