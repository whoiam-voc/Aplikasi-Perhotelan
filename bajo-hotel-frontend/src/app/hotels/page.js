"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/context/SettingsContext";

function HotelSearchResults() {
  const searchParams = useSearchParams();
  const { t, formatPrice, language } = useSettings();

  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "2";
  const search = searchParams.get("search") || "";

  // Data States
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Modals State
  const [activeRoomToBook, setActiveRoomToBook] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  // Interactive Modal Booking States
  const [modalCheckIn, setModalCheckIn] = useState("");
  const [modalCheckOut, setModalCheckOut] = useState("");
  const [modalGuests, setModalGuests] = useState(2);
  const [modalRooms, setModalRooms] = useState(1);

  // Payment Simulation States
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Formatter for readable date display in active Locale
  const formatDate = (dateStr) => {
    if (!dateStr) return language === "ENG" ? "Not selected" : "Belum dipilih";
    try {
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      const dateObj = new Date(dateStr);
      const locale = language === "ENG" ? "en-US" : "id-ID";
      return dateObj.toLocaleDateString(locale, options);
    } catch (e) {
      return dateStr;
    }
  };

  // CRC16 CCITT standard for QRIS (polynomial 0x1021, initialization 0xFFFF)
  const crc16CCITT = (str) => {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      let c = str.charCodeAt(i);
      crc ^= (c << 8);
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  // Generate mathematically and structurally valid dynamic QRIS EMVCo payload
  const generateQRISPayload = (merchantName, city, amount, billNumber) => {
    const fTLV = (tag, val) => {
      const valStr = String(val);
      const len = String(valStr.length).padStart(2, "0");
      return `${tag}${len}${valStr}`;
    };

    const cleanMerchantName = merchantName.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 25);
    const cleanCity = city.toUpperCase().replace(/[^A-Z0-9 ]/g, "").slice(0, 15);
    const cleanBill = billNumber.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);

    let payload = "";
    payload += fTLV("00", "01");
    payload += fTLV("01", "12"); // Dynamic QR
    const merchantInfo = fTLV("00", "ID.CO.QRIS.WWW") + fTLV("01", "936000021234567") + fTLV("02", "12345678");
    payload += fTLV("26", merchantInfo);
    payload += fTLV("52", "7011");
    payload += fTLV("53", "360");
    payload += fTLV("54", Math.round(amount));
    payload += fTLV("58", "ID");
    payload += fTLV("59", cleanMerchantName || "BAJO HOTEL");
    payload += fTLV("60", cleanCity || "LABUAN BAJO");
    payload += fTLV("61", "86754");
    const additionalData = fTLV("01", cleanBill || "BOOKING") + fTLV("07", "RESEPSIONIS");
    payload += fTLV("62", additionalData);
    const partialPayload = payload + "6304";
    const checksum = crc16CCITT(partialPayload);
    return partialPayload + checksum;
  };

  // Format Dynamic Currency
  const formatIDR = (price) => {
    return formatPrice(price);
  };

  // Calculate booking duration nights
  const getTodayString = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const finalCheckIn = checkIn || getTodayString(0);
  const finalCheckOut = checkOut || getTodayString(1);

  const calculateNights = () => {
    const checkInDate = new Date(finalCheckIn);
    const checkOutDate = new Date(finalCheckOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const nightsCount = calculateNights();

  // Encapsulated fetch function to fetch availability
  const fetchAvailability = () => {
    setLoading(true);
    setError(null);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/rooms/availability?checkIn=${finalCheckIn}&checkOut=${finalCheckOut}&guests=${guests}&search=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || "Gagal mengambil data dari server");
          });
        }
        return res.json();
      })
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setRooms(result.data);
        } else {
          throw new Error("Format respon API tidak sesuai");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message || "Gagal tersambung ke API backend. Pastikan server backend Anda menyala.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAvailability();
  }, [checkIn, checkOut, guests, search]);

  // Handler when clicking "Pesan Sekarang" on a room card
  const handlePesanKlik = (room) => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Trigger Navbar auth modal to open in login mode
      window.dispatchEvent(
        new CustomEvent("open-auth-modal", { detail: { mode: "login" } })
      );
      return;
    }
    setBookingError(null);
    setActiveRoomToBook(room);

    // Initialize modal states from URL search params or defaults
    setModalCheckIn(finalCheckIn);
    setModalCheckOut(finalCheckOut);
    setModalGuests(Math.min(parseInt(guests) || 2, room.capacity));
    setModalRooms(1);

    // Reset payment states
    setPaymentMethod("");
    setPaymentSuccess(false);
    setPaymentLoading(false);
  };

  const calculateModalNights = () => {
    if (!modalCheckIn || !modalCheckOut) return 1;
    const checkInDate = new Date(modalCheckIn);
    const checkOutDate = new Date(modalCheckOut);
    const diffTime = checkOutDate - checkInDate;
    if (diffTime <= 0) return 1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const modalNightsCount = calculateModalNights();
  const modalTotalPrice = activeRoomToBook ? activeRoomToBook.pricePerNight * modalNightsCount * modalRooms : 0;

  const handleSimulatePayment = () => {
    setPaymentLoading(true);
    setBookingError(null);
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  // Handler to submit the booking POST to backend API
  const handleConfirmBooking = async () => {
    if (!activeRoomToBook) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Silakan login kembali.");
      setActiveRoomToBook(null);
      return;
    }

    if (!paymentSuccess) {
      setBookingError("Anda wajib menyelesaikan simulasi pembayaran terlebih dahulu sebelum melakukan konfirmasi pemesanan!");
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      let lastResultData = null;
      for (let i = 0; i < modalRooms; i++) {
        const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomId: activeRoomToBook.id,
            checkInDate: modalCheckIn,
            checkOutDate: modalCheckOut,
          }),
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_email");
            window.dispatchEvent(new Event("auth-change"));
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
            throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
          }
          throw new Error(result.message || `Gagal membuat booking kamar ke-${i + 1}`);
        }

        // Update booking status to PAID on backend
        const bookingId = result.data.id;
        const statusRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings/${bookingId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "PAID"
          })
        });

        const statusResult = await statusRes.json();
        if (!statusRes.ok || !statusResult.success) {
          if (statusRes.status === 401 || statusRes.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_email");
            window.dispatchEvent(new Event("auth-change"));
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
            throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
          }
          throw new Error(statusResult.message || "Gagal mengupdate status pembayaran");
        }

        result.data.status = "PAID";
        lastResultData = result.data;
      }

      // Store success data
      const successPayload = {
        ...(lastResultData || {}),
        hotelName: activeRoomToBook.hotel?.name || "Bajo Hotel & Resort",
        hotelAddress: activeRoomToBook.hotel?.address || "Labuan Bajo, NTT",
        roomType: activeRoomToBook.roomType,
        totalPrice: modalTotalPrice,
        multipleRooms: modalRooms > 1 ? modalRooms : null,
        paymentMethod: paymentMethod,
        pricePerNight: activeRoomToBook.pricePerNight,
        nightsCount: modalNightsCount,
        roomsCount: modalRooms,
        guestName: localStorage.getItem("user_name") || "Tamu Bajo Hotel",
        guestEmail: localStorage.getItem("user_email") || "",
      };
      setBookingSuccessData(successPayload);
      
      setActiveRoomToBook(null);

      // Refresh inventory room list
      fetchAvailability();
    } catch (err) {
      setBookingError(err.message || "Koneksi ke server gagal");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDownloadReceipt = (bookingData) => {
    const canvas = document.createElement("canvas");
    canvas.width = 450;
    canvas.height = 960; // Peningkatan tinggi canvas untuk menampung data baru
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative side borders (thermal paper cut style)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    let currentY = 40;

    // QRIS Logo Header Banner
    ctx.fillStyle = "#005a9c"; // Blue
    ctx.fillRect(20, currentY, 40, 12);
    ctx.fillStyle = "#e31d1a"; // Red
    ctx.fillRect(60, currentY, 40, 12);
    ctx.fillStyle = "#f6a700"; // Yellow
    ctx.fillRect(100, currentY, 40, 12);

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px Courier New, Courier, monospace";
    ctx.fillText("QRIS", 155, currentY + 12);
    
    ctx.font = "8px Courier New, Courier, monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Quick Response Code Indonesian Standard", 20, currentY + 26);
    
    currentY += 45;

    // Brand Name
    ctx.textAlign = "center";
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px Courier New, Courier, monospace";
    ctx.fillText("BAJO HOTEL & RESORT", canvas.width / 2, currentY);
    
    currentY += 18;
    ctx.font = "11px Courier New, Courier, monospace";
    ctx.fillStyle = "#475569";
    ctx.fillText("Labuan Bajo, NTT, Indonesia", canvas.width / 2, currentY);
    
    currentY += 14;
    ctx.fillText("Tel: +62 812-3456-7890", canvas.width / 2, currentY);

    currentY += 20;

    // Dashed line helper
    const drawDashedLine = (yPos) => {
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.setLineDash([6, 4]);
      ctx.moveTo(20, yPos);
      ctx.lineTo(canvas.width - 20, yPos);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawDashedLine(currentY);
    currentY += 20;

    // Status Badge
    ctx.fillStyle = "#10b981"; // Emerald green
    const statusText = "SUKSES / PAID";
    ctx.font = "bold 13px Courier New, Courier, monospace";
    const badgeWidth = ctx.measureText(statusText).width + 24;
    const badgeX = (canvas.width - badgeWidth) / 2;
    
    ctx.beginPath();
    ctx.rect(badgeX, currentY - 14, badgeWidth, 22);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(statusText, canvas.width / 2, currentY + 1);

    currentY += 30;

    // Details Block (left-aligned label, right-aligned value)
    ctx.textAlign = "left";
    ctx.fillStyle = "#1e293b";
    
    const drawRow = (label, value) => {
      ctx.font = "bold 12px Courier New, Courier, monospace";
      ctx.fillStyle = "#475569";
      ctx.fillText(label, 25, currentY);
      
      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 12px Courier New, Courier, monospace";
      
      const maxValueWidth = 240;
      let displayVal = value || "-";
      if (ctx.measureText(displayVal).width > maxValueWidth) {
        while (ctx.measureText(displayVal + "...").width > maxValueWidth && displayVal.length > 0) {
          displayVal = displayVal.slice(0, -1);
        }
        displayVal += "...";
      }
      ctx.fillText(displayVal, canvas.width - 25, currentY);
      
      ctx.textAlign = "left"; // reset
      currentY += 18;
    };

    const getReceiptDateFormatted = (dateStr) => {
      if (!dateStr) return "-";
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      } catch (e) {
        return dateStr;
      }
    };

    const timeString = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    drawRow("Waktu Transaksi", timeString);
    
    const shortTxId = bookingData.id ? bookingData.id.toUpperCase() : "N/A";
    const dateFormatted = bookingData.createdAt ? new Date(bookingData.createdAt) : new Date();
    const invoiceNo = `INV/${dateFormatted.getFullYear()}${String(dateFormatted.getMonth() + 1).padStart(2, '0')}${String(dateFormatted.getDate()).padStart(2, '0')}/${shortTxId.slice(0, 8)}`;
    drawRow("Nomor Invoice", invoiceNo);
    
    const formattedPaymentMethod = 
      bookingData.paymentMethod === "debit" ? "KARTU DEBIT" :
      bookingData.paymentMethod === "credit" ? "KARTU KREDIT" :
      bookingData.paymentMethod === "paypal" ? "PAYPAL" :
      bookingData.paymentMethod === "ewallet" ? "QRIS / E-WALLET" : "TUNAI DI HOTEL";
      
    drawRow("Metode Bayar", formattedPaymentMethod);
    
    currentY += 8;
    drawDashedLine(currentY);
    currentY += 20;

    // Guest Info
    drawRow("Nama Tamu", bookingData.guestName);
    drawRow("Email Tamu", bookingData.guestEmail);
    
    currentY += 8;
    drawDashedLine(currentY);
    currentY += 20;

    drawRow("Hotel", bookingData.hotelName);
    drawRow("Tipe Kamar", bookingData.roomType);
    drawRow("Durasi Menginap", `${bookingData.roomsCount || 1} Kamar x ${bookingData.nightsCount || 1} Malam`);
    drawRow("Check-In", getReceiptDateFormatted(bookingData.checkInDate));
    drawRow("Check-Out", getReceiptDateFormatted(bookingData.checkOutDate));

    currentY += 8;
    drawDashedLine(currentY);
    currentY += 20;

    // Subtotal & VAT Breakdown
    const grandTotal = bookingData.totalPrice || 0;
    const subtotal = grandTotal * 100 / 110;
    const vat = grandTotal * 10 / 110;

    drawRow("Subtotal", formatPrice(subtotal));
    drawRow("PPN (10%)", formatPrice(vat));

    currentY += 8;
    drawDashedLine(currentY);
    currentY += 25;

    // Total Price
    ctx.font = "bold 14px Courier New, Courier, monospace";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("TOTAL BAYAR", 25, currentY);

    ctx.textAlign = "right";
    ctx.font = "bold 16px Courier New, Courier, monospace";
    ctx.fillStyle = "#1d4ed8"; // Blue-700
    ctx.fillText(formatPrice(grandTotal), canvas.width - 25, currentY);
    ctx.textAlign = "left";

    currentY += 25;
    drawDashedLine(currentY);
    currentY += 25;

    // Generate Dynamic QRIS Payload
    const qrisPayload = generateQRISPayload(
      "BAJO HOTEL AND RESORT",
      "LABUAN BAJO",
      grandTotal,
      shortTxId.slice(0, 8)
    );

    // Asynchronously load real QR Code
    const qrSize = 140;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = currentY;

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrisPayload)}`;
    
    qrImg.onload = () => {
      // Draw background white for QR code
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
      
      // Draw border
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
      
      // Draw the QR Image
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      
      currentY += qrSize + 25;
      
      ctx.textAlign = "center";
      ctx.fillStyle = "#475569";
      ctx.font = "italic 10px Courier New, Courier, monospace";
      ctx.fillText("Simpan bukti pembayaran ini untuk", canvas.width / 2, currentY);
      currentY += 12;
      ctx.fillText("ditunjukkan kepada Kasir / Resepsionis.", canvas.width / 2, currentY);
      currentY += 18;
      ctx.font = "bold 11px Courier New, Courier, monospace";
      ctx.fillStyle = "#0f172a";
      ctx.fillText("TERIMA KASIH ATAS KUNJUNGAN ANDA", canvas.width / 2, currentY);

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Struk_Booking_${invoiceNo.replace(/\//g, "_")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  return (
    <div className="w-full">
      {/* Search Info Card (Horizontal mini header) */}
      <div className="w-full bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 md:p-6 shadow-xl text-left mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs md:text-sm">
            <span>📍 {t("resultsLocation")}</span>
            <span>•</span>
            <span>👤 {guests === "5" ? t("resultsGuestsMore") : `${guests} ${t("resultsGuests")}`}</span>
          </div>
          <h2 className="font-display text-base md:text-lg font-bold text-white mt-1">
            {formatDate(finalCheckIn)} &mdash; {formatDate(finalCheckOut)}
          </h2>
        </div>
        <Link
          href="/"
          className="bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 font-medium rounded-xl px-5 py-2.5 transition-all text-sm self-stretch md:self-auto text-center cursor-pointer"
        >
          {t("resultsChangeSearch")}
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 text-sm font-medium">{t("resultsLoading")}</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center max-w-xl mx-auto my-10">
          <div className="text-red-400 text-4xl mb-3">⚠️</div>
          <h3 className="text-white font-bold text-lg mb-2">{t("resultsErrorTitle")}</h3>
          <p className="text-slate-300 text-sm mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => fetchAvailability()}
              className="bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all cursor-pointer"
            >
              {t("resultsTryAgain")}
            </button>
            <Link
              href="/"
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all"
            >
              {t("resultsBack")}
            </Link>
          </div>
        </div>
      )}

      {/* No Rooms Available State */}
      {!loading && !error && rooms.length === 0 && (
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto my-10">
          <div className="text-blue-400 text-5xl mb-4">🏨</div>
          <h3 className="text-white font-bold text-xl mb-2">
            {search ? t("resultsNotFound") : t("resultsNoRooms")}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {search ? (
              language === "ENG" ? (
                <>
                  No rooms or hotels matched your search query <span className="text-blue-400 font-semibold">"{search}"</span> for your selected dates. Please try another search term or change search dates.
                </>
              ) : (
                <>
                  Tidak ditemukan kamar atau hotel yang cocok dengan kata kunci <span className="text-blue-400 font-semibold">"{search}"</span> untuk tanggal yang Anda pilih. Silakan cari kata kunci lain atau ubah tanggal pencarian.
                </>
              )
            ) : (
              t("resultsNoRoomsDesc")
            )}
          </p>
          <div className="flex gap-4 justify-center">
            {search && (
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("search");
                  window.location.href = `/hotels?${params.toString()}`;
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl px-6 py-3 text-sm transition-all cursor-pointer"
              >
                {t("resultsClearSearch")}
              </button>
            )}
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-6 py-3 text-sm transition-all shadow-lg shadow-blue-500/25"
            >
              {t("resultsChangeParams")}
            </Link>
          </div>
        </div>
      )}

      {/* Results Listings Grid */}
      {!loading && !error && rooms.length > 0 && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="font-display text-lg md:text-xl font-bold text-white">
              {search ? (
                <>
                  {language === "ENG" ? "Showing" : "Menampilkan"} {rooms.length} {language === "ENG" ? "room types for search" : "tipe kamar untuk pencarian"}{" "}
                  <span className="text-blue-400">"{search}"</span>
                </>
              ) : (
                language === "ENG"
                  ? `Showing ${rooms.length} available room types`
                  : `Menampilkan ${rooms.length} tipe kamar tersedia`
              )}
            </h3>
            <span className="text-xs text-slate-400 font-light">{t("resultsSortRec")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const mainImage = room.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945";
              return (
                <div
                  key={room.id}
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-slate-700/80 transition-all duration-300 group"
                >
                  {/* Image container with hover zoom */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                    <img
                      src={mainImage}
                      alt={room.hotel?.name || "Kamar Hotel"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400 flex items-center gap-1">
                      <span>★</span>
                      <span>{room.hotel?.rating ? room.hotel.rating.toFixed(1) : "4.5"}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      {/* Hotel Name */}
                      <h4 className="font-display font-bold text-lg text-white group-hover:text-blue-400 transition-colors leading-snug">
                        {room.hotel?.name}
                      </h4>
                      {/* Address */}
                      <p className="text-xs text-slate-400 line-clamp-1 font-light">
                        📍 {room.hotel?.address}
                      </p>
                      <hr className="border-slate-800 my-2" />
                      {/* Room Type */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-300 font-medium">{room.roomType}</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          👤 {room.capacity} {t("resultsGuests")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-2">
                        {room.hotel?.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">{language === "ENG" ? "Price / Night" : "Harga / Malam"}</span>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-blue-400">
                            {formatIDR(room.pricePerNight)}
                          </span>
                        </div>
                      </div>

                      {/* Stock availability */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${room.availableInventory <= 3 ? "text-red-400" : "text-emerald-400"}`}>
                          {room.availableInventory <= 3
                            ? t("resultsOnlyRoomsLeft", { count: room.availableInventory })
                            : t("resultsRoomsAvailable", { count: room.availableInventory })}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePesanKlik(room)}
                        className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl py-2.5 text-sm transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                      >
                        {t("resultsBookNow")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {activeRoomToBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setActiveRoomToBook(null)}
          />

          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl z-10 text-left text-slate-100">
            <button
              onClick={() => setActiveRoomToBook(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="font-display text-2xl font-bold text-white mb-2">{t("bookConfirmTitle")}</h3>
            <p className="text-slate-400 text-xs md:text-sm mb-6">
              {t("bookConfirmSub")}
            </p>

            {bookingError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 mb-4 font-medium flex items-center gap-2">
                <span>⚠️</span> {bookingError}
              </div>
            )}

            {/* Room details inside modal */}
            <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-4 space-y-4 text-sm mb-6">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelAcc")}</span>
                <strong className="text-base text-white block mt-0.5">{activeRoomToBook.hotel?.name}</strong>
                <span className="text-xs text-slate-400 block mt-0.5">📍 {activeRoomToBook.hotel?.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-3">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelRoomType")}</span>
                  <span className="font-medium text-slate-200">{activeRoomToBook.roomType}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelMaxCap")}</span>
                  <span className="font-medium text-slate-200">👤 {activeRoomToBook.capacity} {t("resultsGuests")} / {language === "ENG" ? "Room" : "Kamar"}</span>
                </div>
              </div>
              
              {/* Dynamic Date Inputs */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelCheckIn")}</label>
                  <input
                    type="date"
                    value={modalCheckIn}
                    min={getTodayString(0)}
                    onChange={(e) => {
                      setModalCheckIn(e.target.value);
                      if (e.target.value >= modalCheckOut) {
                        const d = new Date(e.target.value);
                        d.setDate(d.getDate() + 1);
                        setModalCheckOut(d.toISOString().split("T")[0]);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm font-medium cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelCheckOut")}</label>
                  <input
                    type="date"
                    value={modalCheckOut}
                    min={modalCheckIn}
                    onChange={(e) => setModalCheckOut(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm font-medium cursor-pointer"
                  />
                </div>
              </div>

              {/* Rooms and Guests selectors */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-850 pt-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelRooms")}</label>
                  <select
                    value={modalRooms}
                    onChange={(e) => setModalRooms(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm font-medium cursor-pointer"
                  >
                    {Array.from({ length: Math.min(activeRoomToBook.availableInventory || 1, 10) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {language === "ENG" ? "Rooms" : "Kamar"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelGuests")}</label>
                  <select
                    value={modalGuests}
                    onChange={(e) => setModalGuests(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm font-medium cursor-pointer"
                  >
                    {Array.from({ length: activeRoomToBook.capacity * modalRooms }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {t("resultsGuests")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelCostDetails")}</span>
                  <span className="text-xs text-slate-400">
                    {t("bookCostCalc", {
                      price: formatIDR(activeRoomToBook.pricePerNight),
                      nights: modalNightsCount,
                      roomsMultiplier: modalRooms > 1 ? `x ${modalRooms} ${language === "ENG" ? "rooms" : "kamar"}` : ""
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-blue-400">{formatIDR(modalTotalPrice)}</span>
                </div>
              </div>

              {/* Payment Gateway Section */}
              <div className="border-t border-slate-850 pt-4 space-y-3">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">{t("bookLabelPayment")}</span>
                
                {/* Payment options grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: "debit", label: t("paymentDebit") },
                    { id: "credit", label: t("paymentCredit") },
                    { id: "paypal", label: t("paymentPaypal") },
                    { id: "ewallet", label: t("paymentEwallet") },
                    { id: "cash", label: t("paymentCash") }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(method.id);
                        setPaymentSuccess(false);
                      }}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                        paymentMethod === method.id
                          ? "bg-blue-600/35 border-blue-500 text-blue-300"
                          : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                {/* Interactive inputs for selected payment method */}
                {paymentMethod && !paymentSuccess && (
                  <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 space-y-3 mt-2 animate-in slide-in-from-top-2 duration-200">
                    {paymentMethod === "credit" || paymentMethod === "debit" ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={t("paymentCardNumber")}
                          maxLength={19}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-blue-500"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder={t("paymentExpiry")}
                            maxLength={5}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            placeholder={t("paymentCvv")}
                            maxLength={3}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ) : paymentMethod === "ewallet" ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder={t("paymentEwalletPhone")}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>
                    ) : paymentMethod === "paypal" ? (
                      <div className="space-y-1">
                        <input
                          type="email"
                          placeholder={t("paymentPaypalEmail")}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">{t("paymentCashDesc")}</p>
                    )}

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={paymentLoading}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl py-2 text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {paymentLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t("bookPaymentLoading")}
                        </>
                      ) : (
                        t("bookSimulateBtn")
                      )}
                    </button>
                  </div>
                )}

                {paymentSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl p-3 font-medium flex items-center gap-2 mt-2 animate-in zoom-in-95">
                    <span>✅</span> {t("bookPaymentSuccessMethod", {
                      method: paymentMethod === "debit" 
                        ? (language === "ENG" ? "Debit Card" : "Kartu Debit")
                        : paymentMethod === "credit" 
                          ? (language === "ENG" ? "Credit Card" : "Kartu Kredit")
                          : paymentMethod === "paypal" 
                            ? "PayPal" 
                            : paymentMethod === "ewallet" 
                              ? "E-Wallet" 
                              : (language === "ENG" ? "Cash" : "Tunai")
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setActiveRoomToBook(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl py-3 text-sm transition-all cursor-pointer text-center"
              >
                {t("bookCancel")}
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {bookingLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {t("bookConfirmPay")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {bookingSuccessData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setBookingSuccessData(null)}
          />

          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[95vh] overflow-y-auto p-6 md:p-8 shadow-2xl z-10 text-center text-slate-100 flex flex-col gap-5">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-1">
                {language === "ENG" ? "Payment Successful!" : "Pembayaran Berhasil!"}
              </h3>
              <p className="text-slate-400 text-xs">
                {language === "ENG"
                  ? "Here is your transaction receipt. You can download it to show the cashier."
                  : "Berikut adalah struk transaksi Anda. Anda dapat mengunduhnya untuk diberikan ke kasir."}
              </p>
            </div>

            {/* Thermal Struk QRIS Visual Preview */}
            <div className="bg-stone-50 text-slate-900 font-mono text-[11px] p-5 rounded-2xl shadow-inner text-left relative overflow-hidden border border-slate-300 shrink-0">
              {/* Decorative Jagged Edges */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200" style={{ clipPath: "polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)" }}></div>
              
              <div className="text-center pt-2 pb-3">
                {/* QRIS Header */}
                <div className="flex justify-center items-center gap-1.5 mb-1.5">
                  <span className="w-6 h-2 bg-blue-600 rounded-sm"></span>
                  <span className="w-6 h-2 bg-red-600 rounded-sm"></span>
                  <span className="w-6 h-2 bg-amber-500 rounded-sm"></span>
                  <span className="font-black text-xs tracking-tighter text-slate-800 font-sans">QRIS</span>
                </div>
                <span className="text-[7px] text-slate-400 uppercase tracking-widest block -mt-1 font-sans">Quick Response Code Indonesian Standard</span>
                
                <h4 className="font-extrabold text-xs text-slate-900 mt-3 tracking-wide">BAJO HOTEL & RESORT</h4>
                <p className="text-[9px] text-slate-500">Labuan Bajo, NTT, Indonesia</p>
              </div>

              <div className="border-b border-dashed border-slate-300 my-2"></div>

              {/* Status */}
              <div className="text-center my-2.5">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded text-[9px] inline-block border border-emerald-200">
                  SUKSES / PAID
                </span>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span>Waktu</span>
                  <span className="font-bold text-slate-900">{new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invoice No</span>
                  <span className="font-bold text-slate-900 font-mono text-[9px]">
                    {`INV/${bookingSuccessData.createdAt ? new Date(bookingSuccessData.createdAt).getFullYear() + String(new Date(bookingSuccessData.createdAt).getMonth() + 1).padStart(2, '0') + String(new Date(bookingSuccessData.createdAt).getDate()).padStart(2, '0') : new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + String(new Date().getDate()).padStart(2, '0')}/${bookingSuccessData.id?.substring(0, 8).toUpperCase()}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Metode Bayar</span>
                  <span className="font-bold text-slate-900">
                    {bookingSuccessData.paymentMethod === 'debit' ? 'KARTU DEBIT' :
                     bookingSuccessData.paymentMethod === 'credit' ? 'KARTU KREDIT' :
                     bookingSuccessData.paymentMethod === 'paypal' ? 'PAYPAL' :
                     bookingSuccessData.paymentMethod === 'ewallet' ? 'QRIS / E-WALLET' : 'TUNAI DI HOTEL'}
                  </span>
                </div>

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                {/* Guest Details */}
                <div className="flex justify-between">
                  <span>Nama Tamu</span>
                  <span className="font-bold text-slate-900">{bookingSuccessData.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">{bookingSuccessData.guestEmail}</span>
                </div>

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                <div className="flex justify-between">
                  <span>Hotel</span>
                  <span className="font-bold text-slate-900 max-w-[180px] truncate">{bookingSuccessData.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipe Kamar</span>
                  <span className="font-bold text-slate-900">{bookingSuccessData.roomType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durasi</span>
                  <span className="font-bold text-slate-900">{`${bookingSuccessData.roomsCount || 1} Kamar x ${bookingSuccessData.nightsCount || 1} Malam`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-In</span>
                  <span className="font-bold text-slate-900">{formatDate(bookingSuccessData.checkInDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-Out</span>
                  <span className="font-bold text-slate-900">{formatDate(bookingSuccessData.checkOutDate)}</span>
                </div>

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                {/* Price Breakdown */}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatIDR(bookingSuccessData.totalPrice * 100 / 110)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN (10%)</span>
                  <span className="font-bold text-slate-900">{formatIDR(bookingSuccessData.totalPrice * 10 / 110)}</span>
                </div>

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-slate-800 text-[10px]">TOTAL BAYAR</span>
                  <span className="font-extrabold text-blue-700 text-sm">{formatIDR(bookingSuccessData.totalPrice)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-3"></div>

              {/* Real QR Code inside Preview */}
              <div className="flex flex-col items-center justify-center py-2 bg-white border border-slate-200 rounded-xl max-w-[160px] mx-auto p-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    generateQRISPayload(
                      "BAJO HOTEL AND RESORT",
                      "LABUAN BAJO",
                      bookingSuccessData.totalPrice,
                      bookingSuccessData.id?.toUpperCase().slice(0, 8)
                    )
                  )}`} 
                  alt="QRIS Code" 
                  className="w-28 h-28 object-contain"
                />
                <span className="text-[7px] text-slate-400 font-mono mt-1 font-bold">QRIS BUKTI SAH</span>
              </div>

              <div className="text-center text-[8px] text-slate-400 italic mt-3 leading-tight">
                Simpan bukti pembayaran ini untuk<br/>ditunjukkan kepada Kasir / Resepsionis.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleDownloadReceipt(bookingSuccessData)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl py-3 text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                📥 {language === "ENG" ? "Download Receipt" : "Unduh Struk"}
              </button>
              <button
                type="button"
                onClick={() => setBookingSuccessData(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl py-3 text-xs transition-all cursor-pointer text-center"
              >
                {t("successDone")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HotelsPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans bg-slate-950 text-white">
      {/* Glow decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Transparent Navbar overlay */}
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center justify-start pt-32 pb-16 min-h-screen">
        <Suspense
          fallback={
            <div className="text-white text-lg animate-pulse py-20">Memuat kriteria pencarian...</div>
          }
        >
          <HotelSearchResults />
        </Suspense>
      </main>

      <footer className="w-full py-6 text-center text-xs text-slate-500 border-t border-slate-900">
        &copy; {new Date().getFullYear()} labuan bajo●com. All rights reserved.
      </footer>
    </div>
  );
}
