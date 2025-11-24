import React from "react";
import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-card-foreground mb-2">
            Loading...
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Loading;
