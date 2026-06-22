"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext(null);

const translations = {
  IDN: {
    // Navbar
    navSearchPlaceholder: "Cari destinasi...",
    navLogin: "Masuk",
    navRegister: "Daftar",
    navLogout: "Keluar",
    navHello: "Halo",
    // Auth Modal
    authWelcome: "Selamat Datang",
    authCreateAccount: "Buat Akun Baru",
    authLoginSubtitle: "Masuk untuk memesan hotel di Labuan Bajo",
    authRegisterSubtitle: "Daftar untuk menikmati kemudahan pemesanan akomodasi",
    authFullName: "Nama Lengkap",
    authPhone: "Nomor Telepon",
    authPhoneOptional: "Nomor Telepon (Opsional)",
    authEmail: "Email",
    authPassword: "Password",
    authLoginBtn: "Masuk Sekarang",
    authRegisterBtn: "Daftar Akun",
    authNoAccount: "Belum punya akun?",
    authHaveAccount: "Sudah punya akun?",
    authRegisterHere: "Daftar di sini",
    authLoginHere: "Masuk di sini",
    authSuccessRegister: "Registrasi berhasil! Silakan masuk menggunakan akun baru Anda.",
    // Home Page
    heroTitle: "Petualangan Eksotis di",
    heroSubtitle: "Labuan Bajo",
    heroDesc: "Cari dan pesan hotel terbaik untuk petualangan tak terlupakan Anda di dekat habitat Komodo, pulau eksotis, dan pantai pasir merah muda. Nikmati perjalanan impian Anda sekarang.",
    searchCardTitle: "Cari Hotel & Akomodasi",
    searchCardSub: "Dapatkan harga terbaik untuk liburan impian Anda",
    searchLocationLabel: "Lokasi Tujuan",
    searchLocationVal: "Labuan Bajo, Indonesia",
    searchCheckIn: "Check-In",
    searchCheckOut: "Check-Out",
    searchGuestsLabel: "Jumlah Kamar & Tamu",
    searchGuests1: "1 Tamu, 1 Kamar",
    searchGuests2: "2 Tamu, 1 Kamar",
    searchGuests3: "3 Tamu, 2 Kamar",
    searchGuests4: "4 Tamu, 2 Kamar",
    searchGuests5: "5+ Tamu, Rombongan",
    searchBtn: "Cari Hotel",
    // Recommendations
    recLabel: "Rekomendasi Kami",
    recTitle: "Rekomendasi Akomodasi Terbaik di Labuan Bajo",
    recDesc: "Pilihan hotel dan resort terbaik dengan kenyamanan maksimal, pemandangan laut yang indah, serta akses mudah ke destinasi wisata populer.",
    recEstPrice: "Estimasi Harga",
    recPerNight: "/ malam",
    recViewDetail: "Lihat Detail",
    recFacilities: "Fasilitas Utama",
    // Facilities Translation
    facilityWifi: "Wifi",
    facilityAc: "AC",
    facilityTv: "TV",
    facilityBathroom: "Kamar Mandi Dalam",
    facilityJetty: "Dermaga Pribadi",
    facilityPool: "Kolam Renang",
    facilityInfinityPool: "Infinity Pool",
    facilityMarinaView: "Marina View",
    facilityPrivateBeach: "Pantai Pribadi",
    facilitySnorkeling: "Snorkeling",
    facilityFloatingVilla: "Vila Terapung",
    facilityButler: "Butler Service",
    facilityJoglo: "Joglo Villa",
    // Search Results Page
    resultsLocation: "Labuan Bajo, Indonesia",
    resultsGuests: "Tamu",
    resultsGuestsMore: "5+ Tamu",
    resultsChangeSearch: "Ubah Pencarian",
    resultsLoading: "Mencari akomodasi terbaik di Labuan Bajo...",
    resultsErrorTitle: "Terjadi Kesalahan",
    resultsTryAgain: "Coba Lagi",
    resultsBack: "Kembali",
    resultsNotFound: "Hasil Pencarian Tidak Ditemukan",
    resultsNoRooms: "Tidak Ada Kamar Tersedia",
    resultsNotFoundDesc: "Tidak ditemukan kamar atau hotel yang cocok dengan kata kunci untuk tanggal yang Anda pilih. Silakan cari kata kunci lain atau ubah tanggal pencarian.",
    resultsNoRoomsDesc: "Maaf, seluruh akomodasi di Labuan Bajo telah penuh untuk tanggal yang Anda pilih. Silakan coba pilih tanggal check-in atau check-out lainnya.",
    resultsClearSearch: "Hapus Pencarian",
    resultsChangeParams: "Ubah Parameter",
    resultsShowRoomsSearch: "Menampilkan {count} tipe kamar untuk pencarian \"{query}\"",
    resultsShowRoomsAvailable: "Menampilkan {count} tipe kamar tersedia",
    resultsSortRec: "Diurutkan berdasarkan rekomendasi",
    resultsOnlyRoomsLeft: "Tersisa {count} kamar saja!",
    resultsRoomsAvailable: "Tersedia {count} kamar",
    resultsBookNow: "Pesan Sekarang",
    // Booking Modal
    bookConfirmTitle: "Konfirmasi Pemesanan",
    bookConfirmSub: "Silakan atur tanggal check-in, check-out, jumlah kamar, dan tamu secara manual di bawah ini.",
    bookLabelAcc: "Akomodasi",
    bookLabelRoomType: "Tipe Kamar",
    bookLabelMaxCap: "Kapasitas Maksimal",
    bookLabelCheckIn: "Tanggal Check-In",
    bookLabelCheckOut: "Tanggal Check-Out",
    bookLabelRooms: "Jumlah Kamar",
    bookLabelGuests: "Total Tamu",
    bookLabelCostDetails: "Rincian Biaya",
    bookCostCalc: "{price} x {nights} malam {roomsMultiplier}",
    bookLabelPayment: "Metode Pembayaran",
    bookSimulateBtn: "Simulasikan Pembayaran Sekarang",
    bookPaymentLoading: "Memproses Pembayaran...",
    bookPaymentSuccess: "Pembayaran Berhasil Disimulasikan!",
    bookPaymentSuccessMethod: "Pembayaran Berhasil Disimulasikan! (Metode: {method})",
    bookCancel: "Batal",
    bookConfirmPay: "Konfirmasi & Bayar",
    // Booking Success Modal
    successTitle: "Booking Berhasil!",
    successSub: "Terima kasih! Pemesanan kamar hotel Anda telah berhasil dikonfirmasi oleh sistem.",
    successTxId: "ID Transaksi",
    successStatus: "Status Pembayaran",
    successCheckIn: "Check-in",
    successCheckOut: "Check-out",
    successRoomsCount: "Jumlah Kamar",
    successTotalCost: "Total Harga",
    successDone: "Selesai",
    // Homepage Addons
    addonShuttleTitle: "Penjemputan Bandara Nyaman",
    addonShuttleDesc: "Mulai perjalanan Anda tanpa hambatan dengan layanan penjemputan bandara langsung ke hotel Anda.",
    addonVehicleTitle: "Jelajahi Labuan Bajo dengan Bebas",
    addonVehicleDesc: "Sewa motor atau mobil terbaik untuk perjalanan mandiri Anda.",
    addonGuideTitle: "Pemandu Wisata Lokal Berpengalaman",
    addonGuideDesc: "Dapatkan pengalaman liburan mendalam dengan panduan dari tour guide lokal pilihan.",
    addonBookBtn: "Pesan Sekarang",
    addonSewaBtn: "Sewa Sekarang",
    addonPickupBtn: "Pesan Penjemputan",
    addonModalTitle: "Layanan Tambahan Akomodasi",
    addonModalSelectBooking: "Pilih Booking Kamar Anda",
    addonModalNoBooking: "Tidak Ada Booking Aktif",
    addonModalNoBookingDesc: "Anda tidak memiliki booking kamar aktif. Silakan lakukan pemesanan kamar hotel terlebih dahulu.",
    addonModalDates: "Tanggal Sewa",
    addonModalHours: "Durasi (Jam)",
    addonModalNote: "Catatan Tambahan",
    addonModalTotal: "Total Biaya Layanan",
    addonModalConfirm: "Konfirmasi & Tambahkan",
    addonModalCancel: "Batal",
    // Payment Methods
    paymentDebit: "💳 Kartu Debit",
    paymentCredit: "💳 Kartu Kredit",
    paymentPaypal: "PayPal",
    paymentEwallet: "E-Wallet",
    paymentCash: "Tunai di Hotel",
    paymentCardNumber: "Nomor Kartu (16-digit)",
    paymentExpiry: "MM/YY",
    paymentCvv: "CVV",
    paymentEwalletPhone: "Nomor Handphone (Gopay/OVO/Dana)",
    paymentPaypalEmail: "Alamat Email PayPal",
    paymentCashDesc: "Silakan selesaikan transaksi tunai Anda saat check-in."
  },
  ENG: {
    // Navbar
    navSearchPlaceholder: "Search destination...",
    navLogin: "Login",
    navRegister: "Register",
    navLogout: "Logout",
    navHello: "Hello",
    // Auth Modal
    authWelcome: "Welcome Back",
    authCreateAccount: "Create New Account",
    authLoginSubtitle: "Login to book hotels in Labuan Bajo",
    authRegisterSubtitle: "Register to enjoy easy accommodation booking",
    authFullName: "Full Name",
    authPhone: "Phone Number",
    authPhoneOptional: "Phone Number (Optional)",
    authEmail: "Email",
    authPassword: "Password",
    authLoginBtn: "Login Now",
    authRegisterBtn: "Register Account",
    authNoAccount: "Don't have an account?",
    authHaveAccount: "Already have an account?",
    authRegisterHere: "Register here",
    authLoginHere: "Login here",
    authSuccessRegister: "Registration successful! Please login using your new account.",
    // Home Page
    heroTitle: "Exotic Adventures in",
    heroSubtitle: "Labuan Bajo",
    heroDesc: "Find and book the best hotels for your unforgettable adventure near Komodo habitats, exotic islands, and pink sand beaches. Enjoy your dream trip now.",
    searchCardTitle: "Search Hotels & Accommodations",
    searchCardSub: "Get the best price for your dream vacation",
    searchLocationLabel: "Destination Location",
    searchLocationVal: "Labuan Bajo, Indonesia",
    searchCheckIn: "Check-In",
    searchCheckOut: "Check-Out",
    searchGuestsLabel: "Rooms & Guests Count",
    searchGuests1: "1 Guest, 1 Room",
    searchGuests2: "2 Guests, 1 Room",
    searchGuests3: "3 Guests, 2 Rooms",
    searchGuests4: "4 Guests, 2 Rooms",
    searchGuests5: "5+ Guests, Group",
    searchBtn: "Search Hotel",
    // Recommendations
    recLabel: "Our Recommendations",
    recTitle: "Best Accommodations in Labuan Bajo",
    recDesc: "Top selection of hotels and resorts with maximum comfort, gorgeous sea views, and easy access to popular tourist destinations.",
    recEstPrice: "Estimated Price",
    recPerNight: "/ night",
    recViewDetail: "View Details",
    recFacilities: "Main Facilities",
    // Facilities Translation
    facilityWifi: "Wifi",
    facilityAc: "AC",
    facilityTv: "TV",
    facilityBathroom: "Ensuite Bathroom",
    facilityJetty: "Private Jetty",
    facilityPool: "Swimming Pool",
    facilityInfinityPool: "Infinity Pool",
    facilityMarinaView: "Marina View",
    facilityPrivateBeach: "Private Beach",
    facilitySnorkeling: "Snorkeling",
    facilityFloatingVilla: "Floating Villa",
    facilityButler: "Butler Service",
    facilityJoglo: "Joglo Villa",
    // Search Results Page
    resultsLocation: "Labuan Bajo, Indonesia",
    resultsGuests: "Guests",
    resultsGuestsMore: "5+ Guests",
    resultsChangeSearch: "Change Search",
    resultsLoading: "Searching for the best accommodations in Labuan Bajo...",
    resultsErrorTitle: "An Error Occurred",
    resultsTryAgain: "Try Again",
    resultsBack: "Back",
    resultsNotFound: "Search Results Not Found",
    resultsNoRooms: "No Rooms Available",
    resultsNotFoundDesc: "No rooms or hotels matched your search query for the selected dates. Please try another search term or change search dates.",
    resultsNoRoomsDesc: "Sorry, all accommodations in Labuan Bajo are fully booked for your selected dates. Please try other check-in or check-out dates.",
    resultsClearSearch: "Clear Search",
    resultsChangeParams: "Change Parameters",
    resultsShowRoomsSearch: "Showing {count} room types for search \"{query}\"",
    resultsShowRoomsAvailable: "Showing {count} available room types",
    resultsSortRec: "Sorted by recommendation",
    resultsOnlyRoomsLeft: "Only {count} rooms left!",
    resultsRoomsAvailable: "{count} rooms available",
    resultsBookNow: "Book Now",
    // Booking Modal
    bookConfirmTitle: "Confirm Booking",
    bookConfirmSub: "Please manually set check-in date, check-out date, number of rooms, and guests below.",
    bookLabelAcc: "Accommodation",
    bookLabelRoomType: "Room Type",
    bookLabelMaxCap: "Maximum Capacity",
    bookLabelCheckIn: "Check-In Date",
    bookLabelCheckOut: "Check-Out Date",
    bookLabelRooms: "Rooms Count",
    bookLabelGuests: "Total Guests",
    bookLabelCostDetails: "Cost Details",
    bookCostCalc: "{price} x {nights} nights {roomsMultiplier}",
    bookLabelPayment: "Payment Method",
    bookSimulateBtn: "Simulate Payment Now",
    bookPaymentLoading: "Processing Payment...",
    bookPaymentSuccess: "Payment Simulated Successfully!",
    bookPaymentSuccessMethod: "Payment Simulated Successfully! (Method: {method})",
    bookCancel: "Cancel",
    bookConfirmPay: "Confirm & Pay",
    // Booking Success Modal
    successTitle: "Booking Successful!",
    successSub: "Thank you! Your hotel room booking has been successfully confirmed by the system.",
    successTxId: "Transaction ID",
    successStatus: "Payment Status",
    successCheckIn: "Check-in",
    successCheckOut: "Check-out",
    successRoomsCount: "Rooms Count",
    successTotalCost: "Total Cost",
    successDone: "Done",
    // Homepage Addons
    addonShuttleTitle: "Comfortable Airport Pick-up",
    addonShuttleDesc: "Start your journey seamlessly with an airport pick-up service directly to your hotel.",
    addonVehicleTitle: "Explore Labuan Bajo Freely",
    addonVehicleDesc: "Rent the best motorcycle or car for your independent adventures.",
    addonGuideTitle: "Experienced Local Tour Guides",
    addonGuideDesc: "Get a deeper vacation experience guided by selected local tour guides.",
    addonBookBtn: "Book Now",
    addonSewaBtn: "Rent Now",
    addonPickupBtn: "Book Pick-up",
    addonModalTitle: "Additional Accommodation Services",
    addonModalSelectBooking: "Choose Your Room Booking",
    addonModalNoBooking: "No Active Booking",
    addonModalNoBookingDesc: "You don't have an active room booking. Please book a hotel room first.",
    addonModalDates: "Rental Dates",
    addonModalHours: "Duration (Hours)",
    addonModalNote: "Additional Notes",
    addonModalTotal: "Total Service Cost",
    addonModalConfirm: "Confirm & Add Service",
    addonModalCancel: "Cancel",
    // Payment Methods
    paymentDebit: "💳 Debit Card",
    paymentCredit: "💳 Credit Card",
    paymentPaypal: "PayPal",
    paymentEwallet: "E-Wallet",
    paymentCash: "Pay at Hotel",
    paymentCardNumber: "Card Number (16-digit)",
    paymentExpiry: "MM/YY",
    paymentCvv: "CVV",
    paymentEwalletPhone: "Phone Number (Gopay/OVO/Dana)",
    paymentPaypalEmail: "PayPal Email Address",
    paymentCashDesc: "Please settle your cash payment at the hotel during check-in."
  }
};

const DEFAULT_RATES = {
  IDR: 1.0,
  USD: 0.0000625, // 1 USD = 16,000 IDR
  EUR: 0.0000571, // 1 EUR = 17,500 IDR
};

export function SettingsProvider({ children }) {
  const [language, setLanguageState] = useState("IDN");
  const [currency, setCurrencyState] = useState("IDR");
  const [rates, setRates] = useState(DEFAULT_RATES);

  // Load from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("selected_lang");
    const savedCurr = localStorage.getItem("selected_curr");
    if (savedLang) setLanguageState(savedLang);
    if (savedCurr) setCurrencyState(savedCurr);

    // Fetch real-time exchange rates
    fetch("https://open.er-api.com/v6/latest/IDR")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch rates");
        return res.json();
      })
      .then((data) => {
        if (data && data.rates) {
          const apiRates = {
            IDR: 1.0,
            USD: data.rates.USD || DEFAULT_RATES.USD,
            EUR: data.rates.EUR || DEFAULT_RATES.EUR,
          };
          setRates(apiRates);
          console.log("Kurs nilai tukar real-time berhasil diperbarui:", apiRates);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil kurs real-time, menggunakan nilai tukar fallback:", err);
      });
  }, []);

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem("selected_lang", lang);
  };

  const setCurrency = (curr) => {
    setCurrencyState(curr);
    localStorage.setItem("selected_curr", curr);
  };

  // Translation helper
  const t = (key, replacements = {}) => {
    const langDict = translations[language] || translations["IDN"];
    let translation = langDict[key] || translations["IDN"][key] || key;

    // Replace templates like {count}
    Object.keys(replacements).forEach((placeholder) => {
      translation = translation.replace(
        `{${placeholder}}`,
        replacements[placeholder]
      );
    });

    return translation;
  };

  // Price conversion and formatting helper
  const formatPrice = (priceInIDR) => {
    let convertedPrice = priceInIDR;
    let localCurrency = "IDR";
    let locale = "id-ID";

    if (currency === "USD") {
      convertedPrice = priceInIDR * rates.USD;
      localCurrency = "USD";
      locale = "en-US";
    } else if (currency === "EUR") {
      convertedPrice = priceInIDR * rates.EUR;
      localCurrency = "EUR";
      locale = "de-DE";
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: localCurrency,
      maximumFractionDigits: localCurrency === "IDR" ? 0 : 2,
    }).format(convertedPrice);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        rates,
        t,
        formatPrice,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
