import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import { Mail, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "./UI/button";
import { Input } from "./UI/input";
import { Card } from "./UI/card";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./UI/select";
import { getCountryOptions } from "../data/countries";

export function Auth() {
  const [searchParams] = useSearchParams();
  const getModeFromQuery = (): "login" | "signup" =>
    searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(getModeFromQuery());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [useAnonymous, setUseAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const { login, signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const countryOptions = useMemo(() => getCountryOptions(), []);

  useEffect(() => {
    setMode(getModeFromQuery());
  }, [searchParams]);

  const validatePassword = (password: string): boolean => {
    // Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };
  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleLogin = async () => {
    if (!isValidEmail(loginEmail)) {
      toast.error(t("invalidEmailError"));
      return;
    }

    if (!loginPassword.trim()) {
      toast.error(t("enterPasswordError"));
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message || "Unable to login right now.");
      return;
    }

    toast.success(t("welcomeBack"));
    navigate("/");
  };

  const handleSignup = async () => {
    if (!isValidEmail(signupEmail)) {
      toast.error(t("invalidEmailError"));
      return;
    }

    if (!useAnonymous && (!firstName.trim() || !lastName.trim())) {
      toast.error(t("enterFirstLastError"));
      return;
    }

    if (useAnonymous && !anonymousName.trim()) {
      toast.error(t("enterAnonymousNameError"));
      return;
    }

    if (!validatePassword(signupPassword)) {
      toast.error(t("passwordPolicyError"));
      return;
    }

    if (!regionCode) {
      toast.error("Please select your region/country.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      toast.error(t("passwordsDoNotMatch"));
      return;
    }

    if (!agreedToTerms) {
      toast.error(t("agreeTermsError"));
      return;
    }

    setIsSubmitting(true);
    const result = await signup({
      email: signupEmail.trim(),
      password: signupPassword,
      firstName: useAnonymous ? "Anonymous" : firstName.trim(),
      lastName: useAnonymous ? "User" : lastName.trim(),
      countryCode: regionCode,
      countryName: countryOptions.find((country) => country.code === regionCode)?.name || regionCode,
      nickname: useAnonymous ? anonymousName.trim() : undefined,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.message || "Signup failed. Please try again.");
      return;
    }

    if (!result.sessionEstablished) {
      toast.success(result.message || "Account created. Please confirm your email, then log in.");
      navigate("/auth?mode=login");
      return;
    }

    toast.success(
      <div className="flex flex-col gap-2">
        <p className="font-semibold">{t("welcome")}</p>
        <p className="text-sm">{t("dataSafetyMessage")}</p>
      </div>,
      { duration: 5000 }
    );
    navigate("/");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {mode === "login" ? (
                <Mail className="size-8 text-white" />
              ) : (
                <User className="size-8 text-white" />
              )}
            </div>
            <h2 className="text-3xl mb-2">
              {mode === "login" ? t("login") : t("signup")}
            </h2>
            <p className="text-gray-600">
              {mode === "login"
                ? t("signinSubtitle")
                : t("signupSubtitle")}
            </p>
          </div>

          {mode === "login" ? (
            // Login Form
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleLogin();
              }}
            >
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {t("password")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {t("confidentialityPromise")}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {t("login")}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {t("dontHaveAccount")} {t("signup")}
                </button>
              </div>
            </form>
          ) : (
            // Signup Form
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                handleSignup();
              }}
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 mb-1 block">
                    {t("firstName")}
                  </label>
                <Input
                  type="text"
                  placeholder={t("firstNamePlaceholder")}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={useAnonymous}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 mb-1 block">
                    {t("lastName")}
                  </label>
                <Input
                  type="text"
                  placeholder={t("lastNamePlaceholder")}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={useAnonymous}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-purple-50 dark:bg-slate-800 p-3 rounded-lg border border-purple-100 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={useAnonymous}
                  onChange={(e) => setUseAnonymous(e.target.checked)}
                  className="cursor-pointer"
                />
                <label
                  htmlFor="anonymous"
                  className="text-sm font-medium text-gray-800 dark:text-white cursor-pointer"
                >
                  {t("useAnonymousName")}
                </label>
              </div>

              {useAnonymous && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm text-gray-600 mb-1 block">
                    {t("anonymousName")}
                  </label>
                  <Input
                    type="text"
                    placeholder={t("anonymousNamePlaceholder")}
                    value={anonymousName}
                    onChange={(e) => setAnonymousName(e.target.value)}
                    className="w-full"
                  />
                </motion.div>
              )}

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Region / Country
                </label>
                <Select value={regionCode} onValueChange={setRegionCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {t("password")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordRulesHint")}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  {t("confirmPassword")}
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  {t("termsAndConditions")}
                </label>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 flex gap-3">
                <ShieldCheck className="size-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-purple-900">
                  {t("dataSafetyMessage")}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {t("createAccount")}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm text-purple-600 hover:underline"
                >
                  {t("alreadyHaveAccount")} {t("login")}
                </button>
              </div>
            </form>
          )}

          <p className="text-xs text-gray-500 text-center mt-6">
            {t("authPrivacyFooter")}
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
