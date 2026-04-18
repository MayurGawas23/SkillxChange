import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="relative z-10 custom-shadow rounded-[2rem] bg-surface-container-lowest border ghost-border p-4">
        <SignUp 
          routing="path" 
          path="/sign-up"
          fallbackRedirectUrl="/explore"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
