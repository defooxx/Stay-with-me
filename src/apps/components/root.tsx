import { Outlet } from "react-router";
import { Navigation } from "./navigation";
import { Footer } from "./footer";

export function Root() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
