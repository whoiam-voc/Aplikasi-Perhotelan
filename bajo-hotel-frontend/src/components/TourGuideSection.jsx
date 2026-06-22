"use client";

import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Star, Shield, Users, MessageSquare } from "lucide-react";

export default function TourGuideSection({ onBook }) {
  const { t, formatPrice, language } = useSettings();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/v1/extras/tour-guides")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data pemandu wisata");
        return res.json();
      })
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setGuides(result.data);
          setError(null);
        } else {
          throw new Error(result.message || "Gagal mengambil data");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Standard avatar selection based on guide name
  const getGuideAvatar = (name, index) => {
    const avatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300"
    ];
    return avatars[index % avatars.length];
  };

  // Clean raw names from seed data (e.g. "Guide The - Yansen" -> "Yansen")
  const formatGuideName = (rawName) => {
    if (rawName.includes("-")) {
      return rawName.split("-")[1].trim();
    }
    return rawName;
  };

  return (
    <section className="w-full py-16 bg-slate-900/10 border-t border-slate-900">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-left">
            <span className="text-emerald-400 font-semibold text-sm tracking-wider uppercase">
              🧭 {language === "ENG" ? "Tour Pemandu" : "Tour Guide"}
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-1">
              {t("addonGuideTitle")}
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl font-light">
              {t("addonGuideDesc")}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-red-400 py-10 px-4 text-center border border-dashed border-red-900/50 bg-red-950/10 rounded-2xl max-w-2xl mx-auto">
            <p className="font-semibold">{error}</p>
            <p className="text-xs text-slate-400 mt-2">
              {language === "ENG" 
                ? "Please make sure your database server is running and reachable by the backend." 
                : "Pastikan server database Anda aktif dan dapat dijangkau oleh backend."}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && guides.length === 0 && (
          <div className="text-slate-400 py-10 text-center border border-dashed border-slate-800 rounded-2xl">
            {language === "ENG" ? "No tour guides available currently" : "Tidak ada tour guide tersedia saat ini"}
          </div>
        )}

        {/* Grid of Tour Guides */}
        {!loading && guides.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {guides.map((guide, idx) => {
              const displayRating = (4.7 + (idx % 4) * 0.1).toFixed(1);
              return (
                <div
                  key={guide.id}
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-slate-700/80 transition-all duration-300 group"
                >
                  <div className="space-y-4 text-left">
                    {/* Top Row: Avatar & Rating */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30 group-hover:border-emerald-500 transition-colors shrink-0">
                        <img
                          src={getGuideAvatar(guide.name, idx)}
                          alt={guide.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-base text-white group-hover:text-emerald-400 transition-colors leading-snug">
                          {formatGuideName(guide.name)}
                        </h3>
                        <div className="flex items-center gap-1 mt-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg w-fit text-[10px] font-bold text-emerald-400">
                          <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                          <span>{displayRating}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-light leading-relaxed">
                      {language === "ENG" 
                        ? `Certified guide affiliated with ${guide.hotel?.name || "local agency"}. Specialist in islands and custom Komodo itinerary mapping.`
                        : `Pemandu bersertifikat terafiliasi dengan ${guide.hotel?.name || "agen lokal"}. Spesialis pulau dan rute kustom Komodo.`}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>IDN, ENG {idx % 2 === 0 ? ", DEU" : ""}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Max 6 {t("resultsGuests")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Komodo Certified</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-slate-800/80 mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] text-slate-400 font-light">{language === "ENG" ? "Rate / Hour" : "Tarif / Jam"}</span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        {formatPrice(Number(guide.pricePerHour))}
                      </span>
                    </div>

                    <button
                      onClick={() => onBook(guide)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold rounded-xl py-2 text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                    >
                      {t("addonBookBtn")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
