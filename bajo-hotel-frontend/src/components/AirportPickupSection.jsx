"use client";

import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Plane, Ship, MapPin, Check } from "lucide-react";

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
];

export default function AirportPickupSection({ onBook }) {
  const { t, formatPrice, language } = useSettings();
  const [shuttles, setShuttles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/extras/shuttle-services`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data layanan antar-jemput");
        return res.json();
      })
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          // Group by hotel to show airport pickup and harbor drop side by side
          const hotelGroups = {};
          result.data.forEach((item) => {
            const hotelId = item.hotelId;
            if (!hotelGroups[hotelId]) {
              hotelGroups[hotelId] = {
                hotelName: item.hotel?.name,
                hotelAddress: item.hotel?.address,
                airportPickup: null,
                harborDrop: null
              };
            }
            if (item.type === "AIRPORT_PICKUP") {
              hotelGroups[hotelId].airportPickup = item;
            } else if (item.type === "HARBOR_DROP") {
              hotelGroups[hotelId].harborDrop = item;
            }
          });
          setShuttles(Object.values(hotelGroups));
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

  return (
    <section className="w-full py-16 bg-slate-950 border-t border-slate-900">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-left">
            <span className="text-blue-400 font-semibold text-sm tracking-wider uppercase">
              ✈️ {language === "ENG" ? "Airport Pick-up" : "Penjemputan Bandara"}
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-1">
              {t("addonShuttleTitle")}
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl font-light">
              {t("addonShuttleDesc")}
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
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
        {!loading && !error && shuttles.length === 0 && (
          <div className="text-slate-400 py-10 text-center border border-dashed border-slate-800 rounded-2xl">
            {language === "ENG" ? "No shuttle services available currently" : "Tidak ada layanan antar-jemput tersedia saat ini"}
          </div>
        )}

        {/* Grid of Shuttle Services by Hotel */}
        {!loading && shuttles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shuttles.map((group, idx) => (
              <div
                key={idx}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-slate-700/80 transition-all duration-300 group text-left"
              >
                {/* Visual support image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={HOTEL_IMAGES[idx % HOTEL_IMAGES.length]}
                    alt={group.hotelName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {/* Hotel Identity */}
                    <div>
                      <h3 className="font-display font-bold text-base md:text-lg text-white group-hover:text-blue-400 transition-colors leading-snug">
                        {group.hotelName}
                      </h3>
                      <div className="flex items-start gap-1.5 text-slate-450 text-xs mt-1.5 font-light leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 text-slate-400">{group.hotelAddress}</span>
                      </div>
                    </div>

                    <hr className="border-slate-800/60" />

                    {/* Shuttle types prices */}
                    <div className="space-y-2.5">
                      {group.airportPickup && (
                        <div className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.08] p-3 rounded-xl transition-all duration-300">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                              <Plane className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {language === "ENG" ? "Airport Pick-up" : "Penjemputan Bandara"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-light block">Komodo Int. Airport</span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-450">
                            {formatPrice(Number(group.airportPickup.price))}
                          </span>
                        </div>
                      )}

                      {group.harborDrop && (
                        <div className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-white/[0.08] p-3 rounded-xl transition-all duration-300 opacity-80 hover:opacity-100">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                              <Ship className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                {language === "ENG" ? "Harbor Dropoff" : "Pengantaran Pelabuhan"}
                              </span>
                              <span className="text-[10px] text-slate-400 font-light block">Labuan Bajo Harbor</span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-emerald-450">
                            {formatPrice(Number(group.harborDrop.price))}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Facilities bullet points */}
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/[0.05]">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/20 text-[10px] text-slate-300 border border-slate-800/80">
                        <Check className="w-2.5 h-2.5 text-blue-400" />
                        {language === "ENG" ? "Private air-conditioned car" : "Mobil AC Pribadi"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/20 text-[10px] text-slate-300 border border-slate-800/80">
                        <Check className="w-2.5 h-2.5 text-blue-400" />
                        {language === "ENG" ? "Professional chauffeur" : "Pengemudi Profesional"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/20 text-[10px] text-slate-300 border border-slate-800/80">
                        <Check className="w-2.5 h-2.5 text-blue-400" />
                        {language === "ENG" ? "No hidden fees, tolls included" : "Tanpa biaya tersembunyi, tol & parkir"}
                      </span>
                    </div>
                  </div>

                  {/* Confirm Action button */}
                  {group.airportPickup && (
                    <button
                      onClick={() => onBook(group.airportPickup)}
                      className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white font-semibold rounded-full py-2.5 text-xs transition-all duration-300 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer mt-4"
                    >
                      {t("addonPickupBtn")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
