"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Send, MessageCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppData } from "@/context/AppContext";
import Loading from "@/components/Loading";

const LoginPage = () => {
  const { isAuth, loading: userLoading } = useAppData();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/login`,
        {
          email: email,
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Verification code sent successfully! Check your email.");
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        const errorMessage = response.data.message || "Something went wrong";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send verification code. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return <Loading />;
  }

  if (isAuth) {
    router.push("/chat");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <Card className="w-full shadow-2xl border-border bg-card">
          <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card-foreground">
              Welcome to ChatApp
            </CardTitle>
            <CardDescription className="text-sm sm:text-lg text-muted-foreground">
              Enter your email to continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm sm:text-base font-medium text-card-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-3 sm:space-y-4 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span className="hidden sm:inline">
                    Sending Verification Code...
                  </span>
                  <span className="sm:hidden">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">
                    Send Verification Code
                  </span>
                  <span className="sm:hidden">Send Code</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
