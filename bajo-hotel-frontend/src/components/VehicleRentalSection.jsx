"use client";

import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Car, Bike, ShieldCheck, Key } from "lucide-react";

export default function VehicleRentalSection({ onBook }) {
  const { t, formatPrice, language } = useSettings();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("ALL"); // "ALL" | "MOTOR" | "MOBIL"

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/extras/vehicles`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data kendaraan");
        return res.json();
      })
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setVehicles(result.data);
          setFilteredVehicles(result.data);
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

  useEffect(() => {
    if (filterType === "ALL") {
      setFilteredVehicles(vehicles);
    } else {
      setFilteredVehicles(vehicles.filter((v) => v.type === filterType));
    }
  }, [filterType, vehicles]);

  // Matching local placeholder images based on brand
  const getVehicleImage = (brand) => {
    const name = brand.toLowerCase();
    if (name.includes("nmax") || name.includes("pcx")) {
      return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=400";
    }
    if (name.includes("crf") || name.includes("klx")) {
      return "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=400";
    }
    if (name.includes("beat") || name.includes("adv")) {
      return "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=400";
    }
    if (name.includes("fortuner") || name.includes("hilux")) {
      return "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=400";
    }
    return "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400";
  };

  return (
    <section className="w-full py-16 bg-slate-950 border-t border-slate-900">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="text-left">
            <span className="text-indigo-400 font-semibold text-sm tracking-wider uppercase">
              🚗 {language === "ENG" ? "Vehicle Rental" : "Rental Kendaraan"}
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-1">
              {t("addonVehicleTitle")}
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl font-light">
              {t("addonVehicleDesc")}
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0 self-start md:self-auto shadow-md">
            {[
              { id: "ALL", label: language === "ENG" ? "All" : "Semua" },
              { id: "MOTOR", label: language === "ENG" ? "Scooter / Motorcycle" : "Motor" },
              { id: "MOBIL", label: language === "ENG" ? "Car / SUV" : "Mobil" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filterType === btn.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
        {!loading && !error && filteredVehicles.length === 0 && (
          <div className="text-slate-400 py-10 text-center border border-dashed border-slate-800 rounded-2xl">
            {language === "ENG" ? "No vehicles available currently" : "Tidak ada kendaraan tersedia saat ini"}
          </div>
        )}

        {/* Grid of Vehicles */}
        {!loading && filteredVehicles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-slate-700/80 transition-all duration-300 group"
              >
                {/* Vehicle image */}
                <div className="relative h-36 w-full overflow-hidden bg-slate-800">
                  <img
                    src={getVehicleImage(vehicle.brand)}
                    alt={vehicle.brand}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  {/* Vehicle Type icon badge */}
                  <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-md border border-white/10 p-1.5 rounded-lg text-white shadow-lg">
                    {vehicle.type === "MOTOR" ? (
                      <Bike className="w-3.5 h-3.5 text-indigo-400" />
                    ) : (
                      <Car className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3 text-left">
                  <div>
                    <h3 className="font-display font-bold text-sm md:text-base text-white truncate group-hover:text-indigo-400 transition-colors">
                      {vehicle.brand}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                      {vehicle.type}
                    </span>

                    {/* Specs features */}
                    <div className="flex flex-col gap-1.5 mt-3 text-[11px] text-slate-400 font-light">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{language === "ENG" ? "Full Insurance" : "Asuransi Penuh"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>{language === "ENG" ? "Helmets / Clean interior" : "Helm & Jas Hujan / Kabin Bersih"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3.5 border-t border-slate-800/80 mt-2 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[9px] text-slate-400 font-light">{language === "ENG" ? "Rate / Day" : "Biaya / Hari"}</span>
                      <span className="text-sm font-extrabold text-indigo-400">
                        {formatPrice(Number(vehicle.pricePerDay))}
                      </span>
                    </div>

                    <button
                      onClick={() => onBook(vehicle)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl py-2 text-xs transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      {t("addonSewaBtn")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
