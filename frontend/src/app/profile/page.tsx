"use client";
import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Save, User, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const ProfilePage = () => {
  const { user, isAuth, loading, setUser } = useAppData();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState<string | undefined>("");

  const router = useRouter();

  const editHandler = () => {
    setIsEdit(!isEdit);
    setName(user?.name);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = Cookies.get("token");
    try {
      const { data } = await axios.patch(
        `${process.env.NEXT_PUBLIC_USER_SERVICE_URL}/update/user`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      toast.success("Name updated successfully");
      setUser(data.user);
      setIsEdit(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Error occurred while updating name"
      );
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) router.push("/login");
  }, [isAuth, loading, router]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/chat")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  {user?.name}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  Active now
                </p>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Display Name
                </label>
                {isEdit ? (
                  <form onSubmit={submitHandler} className="space-y-4">
                    <div className="relative">
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="pl-10"
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={editHandler}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <span className="text-card-foreground">
                      {user?.name || "Not set"}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={editHandler}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
