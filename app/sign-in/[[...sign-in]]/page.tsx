import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">AdPilot Africa</h1>
          <p className="text-sm text-zinc-400">Sign in to your COD Business Intelligence terminal</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              card: "bg-zinc-900 border border-zinc-800 text-white shadow-xl rounded-xl",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-zinc-400",
              socialButtonsBlockButton: "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-semibold",
              footerActionLink: "text-indigo-400 hover:text-indigo-300",
              formFieldLabel: "text-zinc-300",
              formFieldInput: "bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500 focus:ring-indigo-500",
            },
          }}
        />
      </div>
    </div>
  );
}
