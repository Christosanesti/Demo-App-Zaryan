import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background">
      {children}
    </div>
  );
};

export default layout;
