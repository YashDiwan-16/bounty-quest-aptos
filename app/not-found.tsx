import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]" />
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm" />
      <div className="relative space-y-8 text-center px-4">
        <div className="space-y-2">
          <p className="text-9xl mb-4 select-none">🤔</p>
          <h1 className="text-8xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary/60 bg-clip-text text-transparent animate-gradient">
            404
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight mt-4">
            Oops! Page Not Found
          </h2>
        </div>
        <p className="text-muted-foreground text-lg max-w-[460px] mx-auto">
          We couldn&apos;t find what you were looking for. Perhaps you mistyped
          the URL?
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild variant="default" size="lg">
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
