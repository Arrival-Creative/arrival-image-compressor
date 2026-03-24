import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Website Image Machine | Arrival Creative",
  description: "Compress and resize images in one step.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="text-[#31070d] antialiased">
        {children}
        {/* Iframe height sync: posts document height to parent so the iframe can resize dynamically */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.self === window.top) return;
                function sendHeight() {
                  var h = document.documentElement.scrollHeight;
                  window.parent.postMessage({ type: 'arrival-compressor-height', height: h }, '*');
                }
                sendHeight();
                var ro = new ResizeObserver(sendHeight);
                ro.observe(document.body);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
