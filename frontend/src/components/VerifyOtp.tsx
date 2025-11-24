"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import Cookies from "js-cookie";
import { useAppData } from "@/context/AppContext";
import Loading from "./Loading";

const VerifyOtp = () => {
  const {
    isAuth,
    setIsAuth,
    setUser,
    loading: userLoading,
    fetchChats,
    fetchUsers,
  } = useAppData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [showTimer, setShowTimer] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = numericValue;
    setOtp(newOtp);

    // Auto-focus to next input
    if (numericValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtp(newOtp);
      // Focus the last filled input or first empty one
      const lastFilledIndex = Math.min(pastedData.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      setIsVerifying(true);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/verify`,
          {
            email: email,
            otp: otpString,
          }
        );

        if (response.status === 200 || response.status === 201) {
          // Store token in cookies
          if (response.data.token) {
            Cookies.set("token", response.data.token, { expires: 15 }); // Expires in 15 days
            toast.success("Verification successful!");
            setIsAuth(true);
            fetchChats();
            fetchUsers();
            setUser(response.data.user);
            // Redirect to chat page or dashboard
            router.push("/chat");
          } else {
            console.error("No token received from server");
          }
        } else {
          toast.error("Verification failed. Please try again.");
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage =
          error.response?.data?.message ||
          "Verification failed. Please try again.";
        toast.error(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) {
      // Show countdown message with current timer
      setShowTimer(true);
    } else {
      // Handle resend code API call here
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/login`,
          {
            email: email,
          }
        );

        if (response.status === 200 || response.status === 201) {
          toast.success("OTP sent successfully!");
          // Reset timer
          setTimer(60);
          setShowTimer(false);
        } else {
          toast.error("Failed to send OTP. Please try again.");
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const errorMessage =
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.";
        toast.error(errorMessage);
      }
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  // Handle navigation when user is authenticated
  useEffect(() => {
    if (isAuth) {
      router.push("/chat");
    }
  }, [isAuth, router]);

  if (userLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <Card className="w-full shadow-2xl border-border bg-card relative">
          {/* Back Arrow */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 p-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card-foreground">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-sm sm:text-lg text-muted-foreground">
              We have sent a 6-digit code to <br />
              <span className="italic text-primary">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Please check your inbox or spam folder and enter the code.
              </p>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-2 sm:gap-3 mb-6">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    placeholder=""
                  />
                ))}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isOtpComplete || isVerifying}
                className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </Button>

              {/* Resend Code Section */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn&apos;t receive the code?
                </p>
                <Button
                  variant="link"
                  disabled={timer > 0 && showTimer}
                  className={`text-sm font-medium p-0 h-auto ${
                    timer > 0 && showTimer
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-primary hover:text-primary/80"
                  }`}
                  onClick={handleResendCode}
                >
                  {timer > 0 && showTimer
                    ? `Resend code in ${timer}s`
                    : "Resend code"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOtp;
