import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Thiệp Cưới Studio",
  description: "Thiết kế, lưu và xuất bản thiệp cưới online."
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="vi"><body>{children}</body></html>;
}
