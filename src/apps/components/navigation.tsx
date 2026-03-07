import { Link, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Heart, Globe, LogOut, User } from "lucide-react";
import { Button } from "./UI/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./UI/select";

export function Navigation() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Heart className="size-8 text-pink-500 fill-pink-500" />
            </motion.div>
            <span className="text-2xl font-light tracking-wide">
              {t("appName")}
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-gray-600" />
              <Select
                value={language}
                onValueChange={(val: any) => setLanguage(val)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="es">ES</SelectItem>
                  <SelectItem value="fr">FR</SelectItem>
                  <SelectItem value="de">DE</SelectItem>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="pt">PT</SelectItem>
                  <SelectItem value="hi">HI</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="ne">नेपाली</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Info */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
                  <User className="size-4 text-purple-600" />
                  <span className="text-sm text-purple-600">
                    {user?.nickname}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4 mr-2" />
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/auth?mode=login")}
                >
                  {t("login")}
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate("/auth?mode=signup")}
                >
                  {t("signup")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}