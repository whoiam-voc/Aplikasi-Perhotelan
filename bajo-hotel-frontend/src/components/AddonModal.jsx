"use client";

import React, { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import { Calendar, Clock, CreditCard, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AddonModal({ isOpen, onClose, type, data, onSuccess }) {
  const { t, formatPrice, language } = useSettings();

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
    payload += fTLV("59", cleanMerchantName || "BAJO HOTEL SERVICES");
    payload += fTLV("60", cleanCity || "LABUAN BAJO");
    payload += fTLV("61", "86754");
    const additionalData = fTLV("01", cleanBill || "ADDON") + fTLV("07", "RESEPSIONIS");
    payload += fTLV("62", additionalData);
    const partialPayload = payload + "6304";
    const checksum = crc16CCITT(partialPayload);
    return partialPayload + checksum;
  };
  
  // App States
  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Form input states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hours, setHours] = useState(8);
  const [note, setNote] = useState("");
  const [shuttleOption, setShuttleOption] = useState(null);
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Sync dates with selected booking stay duration
  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setPaymentSuccess(false);
      setPaymentMethod("");
      setSuccessData(null);
      setSelectedBookingId("");
      
      const token = localStorage.getItem("token");
      if (!token) {
        // Trigger login modal
        window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
        onClose();
        return;
      }

      // Fetch user bookings
      setLoadingBookings(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then((res) => {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_name");
            localStorage.removeItem("user_email");
            window.dispatchEvent(new Event("auth-change"));
            window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
            throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
          }
          if (!res.ok) throw new Error("Gagal mengambil data pesanan kamar Anda");
          return res.json();
        })
        .then((result) => {
          if (result.success && Array.isArray(result.data)) {
            // Only keep PENDING or PAID bookings
            const activeBookings = result.data.filter(b => b.status !== 'CANCELLED');
            setBookings(activeBookings);
            if (activeBookings.length > 0) {
              setSelectedBookingId(activeBookings[0].id);
            }
          }
          setLoadingBookings(false);
        })
        .catch((err) => {
          setErrorMsg(err.message || "Gagal menghubungi server");
          setLoadingBookings(false);
        });
    }
  }, [isOpen]);

  // Handle shuttle service option lookup when booking changes
  useEffect(() => {
    if (selectedBooking && type === "shuttle") {
      const hotelId = selectedBooking.room?.hotel?.id;
      if (hotelId) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/extras/shuttle-services`)
          .then(res => res.json())
          .then(result => {
            if (result.success && Array.isArray(result.data)) {
              const matchingShuttle = result.data.find(
                s => s.hotelId === hotelId && s.type === "AIRPORT_PICKUP"
              );
              if (matchingShuttle) {
                setShuttleOption(matchingShuttle);
              } else {
                setShuttleOption(null);
                setErrorMsg(language === "ENG" ? "Airport pickup service is not available for this hotel" : "Layanan penjemputan bandara tidak tersedia untuk hotel ini");
              }
            }
          })
          .catch(err => {
            setErrorMsg(err.message || "Gagal menghubungkan ke layanan antar-jemput");
          });
      }
    }
  }, [selectedBookingId, type]);

  // Set default dates based on check-in/out when booking is selected
  useEffect(() => {
    if (selectedBooking) {
      const formatInputDate = (isoStr) => {
        if (!isoStr) return "";
        return isoStr.split("T")[0];
      };
      setStartDate(formatInputDate(selectedBooking.checkInDate));
      setEndDate(formatInputDate(selectedBooking.checkOutDate));
    }
  }, [selectedBookingId]);

  if (!isOpen) return null;

  // Calculate rental days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;
    if (diff <= 0) return 1;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
  };

  const totalDays = calculateDays();

  // Calculate prices
  const getAddonPrice = () => {
    if (type === "vehicle" && data) {
      return Number(data.pricePerDay) * totalDays;
    }
    if (type === "tourGuide" && data) {
      return Number(data.pricePerHour) * hours;
    }
    if (type === "shuttle" && shuttleOption) {
      return Number(shuttleOption.price);
    }
    return 0;
  };

  const totalAddonPrice = getAddonPrice();

  const handleDownloadAddonReceipt = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 450;
    canvas.height = 920; // Increased height to fit new details
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
    ctx.fillText("BAJO HOTEL EXTRA SERVICES", canvas.width / 2, currentY);
    
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

    const timeString = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    drawRow("Waktu Transaksi", timeString);
    
    const addonTxId = (successData?.id || "N/A").toUpperCase();
    const dateFormatted = successData?.createdAt ? new Date(successData.createdAt) : new Date();
    const invoiceNo = `INV/${dateFormatted.getFullYear()}${String(dateFormatted.getMonth() + 1).padStart(2, '0')}${String(dateFormatted.getDate()).padStart(2, '0')}/ADD-${addonTxId.slice(0, 5)}`;
    drawRow("Nomor Invoice", invoiceNo);
    drawRow("ID Booking Kamar", selectedBookingId.toUpperCase());
    
    const formattedPaymentMethod = 
      paymentMethod === "debit" ? "KARTU DEBIT" :
      paymentMethod === "credit" ? "KARTU KREDIT" :
      paymentMethod === "paypal" ? "PAYPAL" :
      paymentMethod === "ewallet" ? "QRIS / E-WALLET" : "TUNAI DI HOTEL";
      
    drawRow("Metode Bayar", formattedPaymentMethod);
    
    currentY += 8;
    drawDashedLine(currentY);
    currentY += 20;

    // Guest details
    const guestName = localStorage.getItem("user_name") || "Tamu Bajo Hotel";
    const guestEmail = localStorage.getItem("user_email") || "";
    drawRow("Nama Tamu", guestName);
    drawRow("Email Tamu", guestEmail);

    currentY += 8;
    drawDashedLine(currentY);
    currentY += 20;

    const displayServiceType = 
      type === "vehicle" ? "SEWA KENDARAAN" :
      type === "tourGuide" ? "TOUR GUIDE" : "PENJEMPUTAN BANDARA";
      
    drawRow("Jenis Layanan", displayServiceType);

    if (type === "vehicle") {
      drawRow("Kendaraan", data?.brand);
      drawRow("Durasi", `${totalDays} Hari`);
    } else if (type === "tourGuide") {
      drawRow("Tour Guide", data?.name);
      drawRow("Durasi", `${hours} Jam`);
    } else if (type === "shuttle") {
      drawRow("Tujuan Hotel", selectedBooking?.room?.hotel?.name);
    }

    currentY += 8;
    drawDashedLine(currentY);
    currentY += 20;

    // Subtotal & VAT Breakdown
    const subtotal = totalAddonPrice * 100 / 110;
    const vat = totalAddonPrice * 10 / 110;
    
    drawRow("Subtotal", formatPrice(subtotal));
    drawRow("PPN (10%)", formatPrice(vat));

    currentY += 8;
    drawDashedLine(currentY);
    currentY += 25;

    // Total Price
    ctx.font = "bold 14px Courier New, Courier, monospace";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("TOTAL BIAYA", 25, currentY);

    ctx.textAlign = "right";
    ctx.font = "bold 16px Courier New, Courier, monospace";
    ctx.fillStyle = "#1d4ed8"; // Blue-700
    ctx.fillText(formatPrice(totalAddonPrice), canvas.width - 25, currentY);
    ctx.textAlign = "left";

    currentY += 25;
    drawDashedLine(currentY);
    currentY += 25;

    // Generate Dynamic QRIS Payload
    const qrisPayload = generateQRISPayload(
      "BAJO HOTEL SERVICES",
      "LABUAN BAJO",
      totalAddonPrice,
      addonTxId.slice(0, 8)
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

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Struk_Layanan_${invoiceNo.replace(/\//g, "_")}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  const handleSimulatePayment = () => {
    setPaymentLoading(true);
    setErrorMsg("");
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const handleConfirmAddon = async () => {
    if (!selectedBookingId) {
      setErrorMsg(t("addonModalSelectBooking"));
      return;
    }

    if (!paymentSuccess) {
      setErrorMsg(language === "ENG" ? "You must simulate payment first!" : "Selesaikan simulasi pembayaran terlebih dahulu!");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const token = localStorage.getItem("token");
    let endpoint = "";
    let body = {};

    if (type === "vehicle") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/extras/bookings/${selectedBookingId}/vehicles`;
      body = {
        vehicleId: data.id,
        totalDays,
        startDate,
        endDate
      };
    } else if (type === "tourGuide") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/extras/bookings/${selectedBookingId}/tour-guides`;
      body = {
        tourGuideId: data.id,
        totalHours: hours,
        note
      };
    } else if (type === "shuttle") {
      if (!shuttleOption) {
        setErrorMsg(language === "ENG" ? "No airport pickup option available" : "Layanan penjemputan bandara tidak tersedia");
        setSubmitting(false);
        return;
      }
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/extras/bookings/${selectedBookingId}/shuttle`;
      body = {
        shuttleServiceId: shuttleOption.id
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
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
        throw new Error(result.message || "Gagal memesan layanan tambahan");
      }

      setSuccessData(result.data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content container */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl z-10 text-left text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* SUCCESS STATE */}
        {successData ? (
          <div className="text-center flex flex-col gap-4 py-2">
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-1">
                {language === "ENG" ? "Layanan Berhasil Dipesan!" : "Layanan Berhasil Dipesan!"}
              </h3>
              <p className="text-slate-400 text-xs">
                {language === "ENG" 
                  ? "Your additional service is booked. Here is your transaction receipt." 
                  : "Layanan tambahan berhasil dipesan. Berikut struk transaksi Anda."}
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
                
                <h4 className="font-extrabold text-xs text-slate-900 mt-3 tracking-wide">BAJO HOTEL EXTRA SERVICES</h4>
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
                    {`INV/${successData?.createdAt ? new Date(successData.createdAt).getFullYear() + String(new Date(successData.createdAt).getMonth() + 1).padStart(2, '0') + String(new Date(successData.createdAt).getDate()).padStart(2, '0') : new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + String(new Date().getDate()).padStart(2, '0')}/ADD-${(successData?.id || "N/A").toUpperCase().substring(0, 5)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>ID Booking Kamar</span>
                  <span className="font-bold text-slate-900 font-mono text-[9px]">{selectedBookingId.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode Bayar</span>
                  <span className="font-bold text-slate-900">
                    {paymentMethod === 'debit' ? 'KARTU DEBIT' :
                     paymentMethod === 'credit' ? 'KARTU KREDIT' :
                     paymentMethod === 'paypal' ? 'PAYPAL' :
                     paymentMethod === 'ewallet' ? 'QRIS / E-WALLET' : 'TUNAI DI HOTEL'}
                  </span>
                </div>

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                {/* Guest details */}
                <div className="flex justify-between">
                  <span>Nama Tamu</span>
                  <span className="font-bold text-slate-900">{localStorage.getItem("user_name") || "Tamu Bajo Hotel"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">{localStorage.getItem("user_email") || ""}</span>
                </div>

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                <div className="flex justify-between">
                  <span>Jenis Layanan</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {type === "vehicle" ? (language === "ENG" ? "Vehicle Rental" : "Sewa Kendaraan") :
                     type === "tourGuide" ? "Tour Guide" : (language === "ENG" ? "Airport Pickup" : "Penjemputan Bandara")}
                  </span>
                </div>
                
                {type === "vehicle" && (
                  <>
                    <div className="flex justify-between">
                      <span>Kendaraan</span>
                      <span className="font-bold text-slate-900">{data?.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durasi</span>
                      <span className="font-bold text-slate-900">{totalDays} {language === "ENG" ? "Days" : "Hari"}</span>
                    </div>
                  </>
                )}

                {type === "tourGuide" && (
                  <>
                    <div className="flex justify-between">
                      <span>Tour Guide</span>
                      <span className="font-bold text-slate-900">{data?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durasi</span>
                      <span className="font-bold text-slate-900">{hours} {language === "ENG" ? "Hours" : "Jam"}</span>
                    </div>
                  </>
                )}

                {type === "shuttle" && (
                  <div className="flex justify-between">
                    <span>Tujuan Hotel</span>
                    <span className="font-bold text-slate-900 truncate max-w-[180px]">{selectedBooking?.room?.hotel?.name}</span>
                  </div>
                )}

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                {/* Subtotal & VAT Breakdown */}
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">{formatPrice(totalAddonPrice * 100 / 110)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN (10%)</span>
                  <span className="font-bold text-slate-900">{formatPrice(totalAddonPrice * 10 / 110)}</span>
                </div>

                <div className="border-b border-dashed border-slate-300 my-2"></div>

                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-slate-800 text-[10px]">TOTAL BIAYA</span>
                  <span className="font-extrabold text-blue-700 text-sm">{formatPrice(totalAddonPrice)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-3"></div>

              {/* Real QR Code inside Preview */}
              <div className="flex flex-col items-center justify-center py-2 bg-white border border-slate-200 rounded-xl max-w-[160px] mx-auto p-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    generateQRISPayload(
                      "BAJO HOTEL SERVICES",
                      "LABUAN BAJO",
                      totalAddonPrice,
                      (successData?.id || "N/A").toUpperCase().substring(0, 8)
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
                onClick={handleDownloadAddonReceipt}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold rounded-xl py-3 text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                📥 {language === "ENG" ? "Download Receipt" : "Unduh Struk"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl py-3 text-xs transition-all cursor-pointer text-center"
              >
                {t("successDone")}
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-2">{t("addonModalTitle")}</h3>
            <p className="text-slate-400 text-xs md:text-sm mb-6">
              {language === "ENG" 
                ? "Configure your additional service parameters and link it to your reservation." 
                : "Atur parameter layanan tambahan dan tautkan ke pesanan kamar hotel Anda."}
            </p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 mb-4 font-medium flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loadingBookings ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-6 space-y-4">
                <p className="text-slate-400 text-sm">{t("addonModalNoBookingDesc")}</p>
                <button
                  onClick={() => {
                    onClose();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-2.5 px-6 text-sm transition-all cursor-pointer"
                >
                  {language === "ENG" ? "Book Room Now" : "Pesan Kamar Sekarang"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-sm mb-6">
                {/* Product Summary */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      {type === "vehicle" ? (language === "ENG" ? "Vehicle selected" : "Kendaraan dipilih") :
                       type === "tourGuide" ? (language === "ENG" ? "Guide selected" : "Guide dipilih") :
                       (language === "ENG" ? "Shuttle selected" : "Layanan dipilih")}
                    </span>
                    <strong className="text-white text-sm">
                      {type === "shuttle" ? (language === "ENG" ? "Airport pickup service" : "Penjemputan Bandara") :
                       data?.brand || data?.name}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">
                      {type === "vehicle" ? `${formatPrice(data?.pricePerDay)}/${language === "ENG" ? "day" : "hari"}` :
                       type === "tourGuide" ? `${formatPrice(data?.pricePerHour)}/${language === "ENG" ? "hour" : "jam"}` :
                       shuttleOption ? `${formatPrice(shuttleOption.price)}` : "-"}
                    </span>
                  </div>
                </div>

                {/* Dropdown to select Booking */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    {t("addonModalSelectBooking")}
                  </label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 text-white font-medium cursor-pointer"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.room?.hotel?.name} ({b.room?.roomType}) • {new Date(b.checkInDate).toLocaleDateString(language === "ENG" ? "en-US" : "id-ID", { month: 'short', day: 'numeric' })} - {new Date(b.checkOutDate).toLocaleDateString(language === "ENG" ? "en-US" : "id-ID", { month: 'short', day: 'numeric', year: 'numeric' })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form based on Type */}
                {type === "vehicle" && (
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-850/80 pt-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        {language === "ENG" ? "Start Date" : "Mulai Sewa"}
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        min={selectedBooking ? selectedBooking.checkInDate.split("T")[0] : ""}
                        max={selectedBooking ? selectedBooking.checkOutDate.split("T")[0] : ""}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (e.target.value >= endDate) {
                            setEndDate(e.target.value);
                          }
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        {language === "ENG" ? "End Date" : "Selesai Sewa"}
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={selectedBooking ? selectedBooking.checkOutDate.split("T")[0] : ""}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {type === "tourGuide" && (
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-850/80 pt-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        {t("addonModalHours")}
                      </label>
                      <select
                        value={hours}
                        onChange={(e) => setHours(parseInt(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm cursor-pointer"
                      >
                        {[2, 4, 6, 8, 12, 24].map((h) => (
                          <option key={h} value={h}>
                            {h} {language === "ENG" ? "Hours" : "Jam"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        {t("addonModalNote")}
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Pulau Komodo, Pink Beach"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 outline-none focus:border-blue-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Total Cost details */}
                <div className="border-t border-slate-850 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase block">
                      {t("addonModalTotal")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {type === "vehicle" && `${formatPrice(data?.pricePerDay)} x ${totalDays} ${language === "ENG" ? "days" : "hari"}`}
                      {type === "tourGuide" && `${formatPrice(data?.pricePerHour)} x ${hours} ${language === "ENG" ? "hours" : "jam"}`}
                      {type === "shuttle" && shuttleOption && `${formatPrice(shuttleOption.price)} (flat)`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-blue-400">{formatPrice(totalAddonPrice)}</span>
                  </div>
                </div>

                {/* Payment gateway */}
                <div className="border-t border-slate-850 pt-4 space-y-3">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                    {t("bookLabelPayment")}
                  </span>
                  
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
                        className={`py-2 px-3 text-[10px] font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                          paymentMethod === method.id
                            ? "bg-blue-600/35 border-blue-500 text-blue-300"
                            : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {paymentMethod && !paymentSuccess && (
                    <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-3 space-y-3 mt-2">
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
            )}

            {bookings.length > 0 && (
              <div className="flex gap-4 border-t border-slate-850 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl py-3 text-sm transition-all cursor-pointer text-center"
                >
                  {t("addonModalCancel")}
                </button>
                <button
                  onClick={handleConfirmAddon}
                  disabled={submitting || !paymentSuccess}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {t("addonModalConfirm")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
