"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import HotelRecommendations from "@/components/HotelRecommendations";
import AirportPickupSection from "@/components/AirportPickupSection";
import VehicleRentalSection from "@/components/VehicleRentalSection";
import TourGuideSection from "@/components/TourGuideSection";
import AddonModal from "@/components/AddonModal";
import { useSettings } from "@/context/SettingsContext";

export default function Home() {
  const router = useRouter();
  const { t } = useSettings();

  // Addon states
  const [addonModalOpen, setAddonModalOpen] = useState(false);
  const [addonType, setAddonType] = useState("");
  const [addonData, setAddonData] = useState(null);

  const handleOpenAddon = (type, data) => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.dispatchEvent(
        new CustomEvent("open-auth-modal", { detail: { mode: "login" } })
      );
      return;
    }
    setAddonType(type);
    setAddonData(data);
    setAddonModalOpen(true);
  };

  // Helper to format date strings
  const getTodayString = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  // State management for the search card
  const [checkIn, setCheckIn] = useState(getTodayString(0));
  const [checkOut, setCheckOut] = useState(getTodayString(1));
  const [guests, setGuests] = useState("2");

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to /hotels with search parameters
    router.push(`/hotels?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans bg-slate-950 text-white">
      
      {/* Transparent Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full min-h-screen flex flex-col justify-center items-center">
        {/* Background Image overlay - limited to Hero, set to z-0 and bg-right */}
        <div
          className="absolute inset-0 bg-cover bg-right z-0"
          style={{
            backgroundImage: `url('https://asset.kompas.com/crops/uVCLNqwvzBhqC1r_xEfYqKcsP7s=/50x0:1000x633/1200x800/data/photo/2020/11/06/5fa4e37d84b13.jpg')`,
          }}
        />
        {/* Dark overlay that fades into the dark slate background, set to z-10 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/60 to-slate-950 z-10" />

        {/* Hero Content Container, set to relative z-20 */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 pt-32 pb-20">
          {/* Left Side: Elegant Heading & copy (Revisions to typography) */}
          <div className="flex-1 text-left flex flex-col gap-6 max-w-2xl text-white">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md">
              {t("heroTitle")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                {t("heroSubtitle")}
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed max-w-lg">
              {t("heroDesc")}
            </p>
          </div>

          {/* Right Side: Search Card */}
          <div className="w-full max-w-[340px] bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl p-4 md:p-5 shadow-2xl border border-white/20 transition-all duration-300 hover:shadow-blue-500/10">
            <div className="mb-4 text-left">
              <h2 className="font-display text-lg md:text-xl font-bold text-slate-900">
                {t("searchCardTitle")}
              </h2>
              <p className="text-slate-500 text-[10px] md:text-xs mt-0.5">
                {t("searchCardSub")}
              </p>
            </div>

            <form onSubmit={handleSearch} className="space-y-3">
              {/* Lokasi (Static text input) */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t("searchLocationLabel")}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={t("searchLocationVal")}
                    disabled
                    className="w-full bg-slate-100/80 text-slate-700 text-xs border border-slate-200 rounded-xl py-2 pl-9 pr-4 font-medium select-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Check-In & Check-Out (Side-by-side) */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t("searchCheckIn")}
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={getTodayString(0)}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        // Automatically adjust checkout to day after checkin
                        const checkInDate = new Date(e.target.value);
                        checkInDate.setDate(checkInDate.getDate() + 1);
                        const month = String(checkInDate.getMonth() + 1).padStart(2, "0");
                        const day = String(checkInDate.getDate()).padStart(2, "0");
                        const year = checkInDate.getFullYear();
                        setCheckOut(`${year}-${month}-${day}`);
                      }
                    }}
                    className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl py-2 px-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {t("searchCheckOut")}
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl py-2 px-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Guests count */}
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t("searchGuestsLabel")}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs border border-slate-200 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="1">{t("searchGuests1")}</option>
                    <option value="2">{t("searchGuests2")}</option>
                    <option value="3">{t("searchGuests3")}</option>
                    <option value="4">{t("searchGuests4")}</option>
                    <option value="5">{t("searchGuests5")}</option>
                  </select>
                  <span className="absolute right-3.5 text-slate-400 pointer-events-none">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold rounded-xl py-2.5 px-4 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200 mt-2 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
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
                {t("searchBtn")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <main className="w-full bg-slate-950">
        <HotelRecommendations />
        <AirportPickupSection onBook={(data) => handleOpenAddon("shuttle", data)} />
        <VehicleRentalSection onBook={(data) => handleOpenAddon("vehicle", data)} />
        <TourGuideSection onBook={(data) => handleOpenAddon("tourGuide", data)} />
      </main>

      {/* Addon Modal */}
      <AddonModal
        isOpen={addonModalOpen}
        onClose={() => setAddonModalOpen(false)}
        type={addonType}
        data={addonData}
      />

      {/* Footer copyright */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 relative z-10 bg-slate-950 border-t border-slate-900/60">
        &copy; {new Date().getFullYear()} labuan bajo●com. All rights reserved.
      </footer>
    </div>
  );
}

