import { RouterProvider } from "react-router";
import { router } from "../routes";
import { Toaster } from "./components/UI/sonner";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
        <Toaster />
      </LanguageProvider>
    </AuthProvider>
  );
}