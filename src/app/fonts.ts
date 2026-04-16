import { DM_Sans, DM_Serif_Display } from "next/font/google";

export const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-dm-serif",
});
