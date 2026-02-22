import { DM_Sans, Marcellus, NTR, Playfair_Display } from "next/font/google";
import "./globals.css";

const marcellus = Marcellus({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const ntr = NTR({
  variable: "--font-telugu",
  subsets: ["telugu"],
  weight: "400",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${marcellus.variable} ${playfair.variable} ${dmSans.variable} ${ntr.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
