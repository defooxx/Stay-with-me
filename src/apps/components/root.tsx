import { Outlet } from "react-router";
import { Navigation } from "./navigation";
import { Footer } from "./footer";

export function Root() {
  const stars = Array.from({ length: 28 }, (_, index) => ({
    id: index,
    left: `${(index * 13) % 100}%`,
    top: `${(index * 29) % 100}%`,
    duration: `${8 + (index % 7)}s`,
    delay: `${(index % 9) * 0.7}s`,
    size: `${2 + (index % 3)}px`,
  }));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-x-hidden">
      <div className="pointer-events-none hidden dark:block fixed inset-0 z-0">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star-particle absolute rounded-full bg-white/80"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
        <span className="shooting-star absolute top-0 left-0 h-[3px] w-56" />
      </div>
      <Navigation />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
