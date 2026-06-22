"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

export default function Navbar() {
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const { language: selectedLang, setLanguage: setSelectedLang, currency: selectedCurr, setCurrency: setSelectedCurr, t } = useSettings();

  // Auth States
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "register"
  
  // Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Loading & Error States
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const langRef = useRef(null);
  const currRef = useRef(null);

  // Sync auth state on load and custom event change
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("user_name");
      if (token && name) {
        setUser({ name });
      } else {
        setUser(null);
      }
    };
    
    checkAuth();
    window.addEventListener("auth-change", checkAuth);
    
    const handleOpenModal = (e) => {
      setAuthModalMode(e.detail?.mode || "login");
      setAuthModalOpen(true);
      setAuthError("");
      setAuthSuccess("");
    };
    window.addEventListener("open-auth-modal", handleOpenModal);
    
    return () => {
      window.removeEventListener("auth-change", checkAuth);
      window.removeEventListener("open-auth-modal", handleOpenModal);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
      if (currRef.current && !currRef.current.contains(event.target)) {
        setCurrOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auth Form Submit Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      if (authModalMode === "login") {
        const res = await fetch("http://localhost:5000/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Gagal masuk");
        }
        
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user_name", result.data.user.fullName);
        localStorage.setItem("user_email", result.data.user.email);
        
        setUser({ name: result.data.user.fullName });
        setAuthModalOpen(false);
        
        // Dispatch global auth change event
        window.dispatchEvent(new Event("auth-change"));
      } else {
        const res = await fetch("http://localhost:5000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, password, phone }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.message || "Gagal mendaftar");
        }
        
        setAuthSuccess(t("authSuccessRegister"));
        setAuthModalMode("login");
        setPassword(""); // Clear password field
      }
    } catch (err) {
      setAuthError(err.message || "Koneksi ke server gagal");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent px-6 py-4 md:px-8 md:py-5 flex items-center justify-between">
      {/* Sisi Kiri: Logo & Search Bar */}
      <div className="flex items-center gap-6 md:gap-8">
        <Link href="/" className="flex items-center tracking-tight font-display text-xl md:text-2xl font-bold select-none transition-transform hover:scale-[1.02]">
          <span className="text-white">labuan bajo</span>
          <span className="text-yellow-400">.</span>
          <span className="text-white">com</span>
        </Link>

        {/* Mini Frosted Glass Search Bar */}
        <React.Suspense fallback={
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 w-40 md:w-52">
            <div className="w-4 h-4 border border-white/30 rounded-full animate-pulse" />
            <div className="h-4 bg-white/20 rounded w-24 animate-pulse" />
          </div>
        }>
          <NavbarSearch />
        </React.Suspense>
      </div>

      {/* Sisi Kanan: Navigation Menu & Dropdowns */}
      <div className="flex items-center gap-4 md:gap-6 font-medium text-sm md:text-base text-white">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-white/85 font-light text-xs md:text-sm bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
              {t("navHello")}, <strong className="text-white font-semibold">{user.name}</strong>!
            </span>
            <button
              onClick={handleLogout}
              className="hover:text-red-300 text-white/95 transition-colors py-1.5 text-xs md:text-sm font-bold"
            >
              {t("navLogout")}
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                setAuthModalMode("login");
                setAuthModalOpen(true);
                setAuthError("");
                setAuthSuccess("");
              }}
              className="hover:text-blue-200 transition-colors py-1.5 cursor-pointer text-xs md:text-sm"
            >
              {t("navLogin")}
            </button>
            <button
              onClick={() => {
                setAuthModalMode("register");
                setAuthModalOpen(true);
                setAuthError("");
                setAuthSuccess("");
              }}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white px-4 py-1.5 rounded-md font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 cursor-pointer text-xs md:text-sm"
            >
              {t("navRegister")}
            </button>
          </>
        )}

        {/* Separator */}
        <span className="text-white/30 select-none">|</span>

        {/* Language Dropdown */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setCurrOpen(false);
            }}
            className="flex items-center gap-1 hover:text-blue-200 transition-colors py-1.5 select-none focus:outline-none text-xs md:text-sm"
          >
            <span>{selectedLang}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                langOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-lg bg-slate-900/95 backdrop-blur-md border border-white/10 p-1 shadow-xl">
              <button
                onClick={() => {
                  setSelectedLang("IDN");
                  setLangOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedLang === "IDN"
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                🇮🇩 IDN
              </button>
              <button
                onClick={() => {
                  setSelectedLang("ENG");
                  setLangOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedLang === "ENG"
                    ? "bg-blue-600 text-white font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                🇺🇸 ENG
              </button>
            </div>
          )}
        </div>

        {/* Currency Dropdown */}
        <div className="relative" ref={currRef}>
          <button
            onClick={() => {
              setCurrOpen(!currOpen);
              setLangOpen(false);
            }}
            className="flex items-center gap-1 hover:text-blue-200 transition-colors py-1.5 select-none focus:outline-none text-xs md:text-sm"
          >
            <span>{selectedCurr}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                currOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {currOpen && (
            <div className="absolute right-0 mt-2 w-32 rounded-lg bg-slate-900/95 backdrop-blur-md border border-white/10 p-1 shadow-xl">
              {["IDR", "USD", "EUR"].map((curr) => (
                <button
                  key={curr}
                  onClick={() => {
                    setSelectedCurr(curr);
                    setCurrOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedCurr === curr
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal Overlay */}
      {authModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setAuthModalOpen(false)}
          />

          {/* Modal Box */}
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl z-10 text-left animate-in zoom-in-95 duration-200 text-slate-100">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-display text-2xl font-bold text-white mb-2">
              {authModalMode === "login" ? t("authWelcome") : t("authCreateAccount")}
            </h3>
            <p className="text-slate-400 text-xs md:text-sm mb-6">
              {authModalMode === "login"
                ? t("authLoginSubtitle")
                : t("authRegisterSubtitle")}
            </p>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 mb-4 font-medium flex items-center gap-2">
                <span>⚠️</span> {authError}
              </div>
            )}

            {authSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl p-3 mb-4 font-medium flex items-center gap-2">
                <span>✅</span> {authSuccess}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authModalMode === "register" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("authFullName")}</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 text-white text-sm transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("authPhone")}</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("authPhoneOptional")}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 text-white text-sm transition-all"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("authEmail")}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 text-white text-sm transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("authPassword")}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 text-white text-sm transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl py-3 px-4 shadow-lg shadow-blue-500/20 transition-all duration-200 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
              >
                {authLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {authModalMode === "login" ? t("authLoginBtn") : t("authRegisterBtn")}
              </button>
            </form>

            <div className="text-center mt-6 text-xs text-slate-400">
              {authModalMode === "login" ? (
                <p>
                  {t("authNoAccount")}{" "}
                  <button
                    onClick={() => {
                      setAuthModalMode("register");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-blue-400 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    {t("authRegisterHere")}
                  </button>
                </p>
              ) : (
                <p>
                  {t("authHaveAccount")}{" "}
                  <button
                    onClick={() => {
                      setAuthModalMode("login");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-blue-400 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    {t("authLoginHere")}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavbarSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useSettings();

  // Sync state with URL search param
  useEffect(() => {
    setSearchTerm(searchParams?.get("search") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");

    // If checkIn/checkOut/guests are not set (e.g. on landing page), use defaults
    if (!params.get("checkIn")) {
      const getTodayString = (offset = 0) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };
      params.set("checkIn", getTodayString(0));
      params.set("checkOut", getTodayString(1));
      params.set("guests", "2");
    }

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }

    router.push(`/hotels?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 transition-all focus-within:border-white/50 focus-within:bg-white/30"
    >
      <button
        type="submit"
        className="text-white hover:scale-110 transition-transform bg-transparent border-none p-0 cursor-pointer flex items-center outline-none"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      <input
        type="text"
        placeholder={t("navSearchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-transparent text-white text-xs md:text-sm outline-none placeholder-white/80 w-32 md:w-44 font-light focus:w-40 md:focus:w-56 transition-all duration-300"
      />
    </form>
  );
}
