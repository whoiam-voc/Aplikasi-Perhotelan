"use client";

import React from "react";
import { MapPin, Wifi, Wind, Tv, Bath, Star } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const RECOMMENDATIONS_DATA = [
  {
    id: 1,
    name: "AYANA Komodo Waecicu Beach",
    address: "Pantai Waecicu, Labuan Bajo, Manggarai Barat, Nusa Tenggara Timur",
    rating: 4.9,
    price: 4200000,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    facilities: ["Wifi", "AC", "TV", "Kamar Mandi Dalam", "Dermaga Pribadi", "Kolam Renang"],
  },
  {
    id: 2,
    name: "Meruorah Komodo Labuan Bajo",
    address: "Kawasan Marina, Jl. Soekarno Hatta, Labuan Bajo, Nusa Tenggara Timur",
    rating: 4.8,
    price: 2400000,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd",
    facilities: ["Wifi", "AC", "TV", "Kamar Mandi Dalam", "Infinity Pool", "Marina View"],
  },
  {
    id: 3,
    name: "Sylvia Beach Resort",
    address: "Jl. Pantai Waecicu, Labuan Bajo, Manggarai Barat, Nusa Tenggara Timur",
    rating: 4.2,
    price: 950000,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427",
    facilities: ["Wifi", "AC", "TV", "Kamar Mandi Dalam", "Pantai Pribadi", "Snorkeling"],
  },
  {
    id: 4,
    name: "TA'AKTANA, a Luxury Collection Resort & Spa",
    address: "Pantai Wae Cicu, Labuan Bajo, Nusa Tenggara Timur",
    rating: 5.0,
    price: 8500000,
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000",
    facilities: ["Wifi", "AC", "TV", "Kamar Mandi Dalam", "Vila Terapung", "Butler Service"],
  },
  {
    id: 5,
    name: "Plataran Komodo Resort & Spa",
    address: "Pantai Waecicu, Labuan Bajo, Manggarai Barat, Nusa Tenggara Timur",
    rating: 4.8,
    price: 5500000,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    facilities: ["Wifi", "AC", "TV", "Kamar Mandi Dalam", "Joglo Villa", "Private Beach"],
  },
];

export default function HotelRecommendations() {
  const { t, formatPrice } = useSettings();

  // Helper to match facilities with corresponding icons
  const getFacilityIcon = (facility) => {
    switch (facility.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-3 h-3" />;
      case "ac":
        return <Wind className="w-3 h-3" />;
      case "tv":
        return <Tv className="w-3 h-3" />;
      case "kamar mandi dalam":
        return <Bath className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getFacilityTranslation = (facility) => {
    switch (facility.toLowerCase()) {
      case "wifi":
        return t("facilityWifi");
      case "ac":
        return t("facilityAc");
      case "tv":
        return t("facilityTv");
      case "kamar mandi dalam":
        return t("facilityBathroom");
      case "dermaga pribadi":
        return t("facilityJetty");
      case "kolam renang":
        return t("facilityPool");
      case "infinity pool":
        return t("facilityInfinityPool");
      case "marina view":
        return t("facilityMarinaView");
      case "pantai pribadi":
        return t("facilityPrivateBeach");
      case "snorkeling":
        return t("facilitySnorkeling");
      case "vila terapung":
        return t("facilityFloatingVilla");
      case "butler service":
        return t("facilityButler");
      case "joglo villa":
        return t("facilityJoglo");
      default:
        return facility;
    }
  };

  return (
    <section className="w-full py-16 bg-slate-900/20">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="text-left">
            <span className="text-blue-500 font-semibold text-sm tracking-wider uppercase">
              {t("recLabel")}
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mt-1">
              {t("recTitle")}
            </h2>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl font-light">
              {t("recDesc")}
            </p>
          </div>
        </div>

        {/* Hotel Grid (Responsive layout supporting 5 columns on xl) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {RECOMMENDATIONS_DATA.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-slate-700/80 transition-all duration-300 group"
            >
              {/* Hotel Image with Hover Zoom */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md border border-white/10 px-2 py-1 rounded-xl text-[10px] font-bold text-amber-400 flex items-center gap-1 shadow-lg">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{hotel.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  {/* Hotel Name */}
                  <h3 className="font-display font-bold text-sm md:text-base text-white group-hover:text-blue-400 transition-colors leading-snug text-left line-clamp-1">
                    {hotel.name}
                  </h3>

                  {/* Address with MapPin Icon */}
                  <div className="flex items-start gap-1.5 text-slate-400 text-[11px] text-left font-light leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{hotel.address}</span>
                  </div>

                  <hr className="border-slate-800/80 my-1" />

                  {/* Facilities Badges (limit to 3 for compact look) */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block text-left">
                      {t("recFacilities")}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hotel.facilities.slice(0, 3).map((facility, idx) => {
                        const icon = getFacilityIcon(facility);
                        return (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium"
                          >
                            {icon}
                            <span>{getFacilityTranslation(facility)}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Price & Action Button */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 font-light">{t("recEstPrice")}</span>
                    <div className="text-right">
                      <span className="text-sm md:text-base font-extrabold text-blue-400">
                        {formatPrice(hotel.price)}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-light">{t("recPerNight")}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      // Navigate to hotels list with search param matching the name
                      window.location.href = `/hotels?search=${encodeURIComponent(hotel.name)}`;
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl py-2 text-xs transition-all shadow-md shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {t("recViewDetail")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

