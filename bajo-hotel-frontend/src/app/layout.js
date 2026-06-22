import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Labuan Bajo Hotel Booking - labuan bajo●com",
  description: "Temukan hotel terbaik di Labuan Bajo. Nikmati pemandangan komodo yang eksotis dan pantai pasir putih yang indah.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#0f172a] text-slate-100">
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
