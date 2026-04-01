import Link from "next/link";

const FOOTER_LINKS = {
  Tools: [
    { label: "Visa Checker", href: "/visa-checker" },
    { label: "Cost Calculator", href: "/cost-calculator" },
    { label: "City Explorer", href: "/cities" },
    { label: "Job Board", href: "/jobs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Disclaimer", href: "/disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
                style={{ background: "linear-gradient(135deg, #6366F1, #A78BFA)" }}>
                N
              </div>
              <span className="font-black text-lg text-text-primary tracking-tight">Nomadly</span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-5">
              Built for Indian tech workers who want to live and work from anywhere in the world.
            </p>
            <p className="text-text-muted text-xs flex items-center gap-1.5">
              <span>Made with</span>
              <span className="text-danger">♥</span>
              <span>for Indian nomads</span>
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-text-secondary font-semibold text-xs uppercase tracking-widest mb-4">
                {category}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-text-muted text-sm hover:text-text-primary transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs">© 2025 Nomadly. All rights reserved.</p>
          <p className="text-text-muted text-xs text-center">
            Visa data is verified but{" "}
            <Link href="/disclaimer" className="text-primary/80 hover:text-primary transition-colors">
              always verify with the official embassy
            </Link>{" "}
            before travel.
          </p>
        </div>
      </div>
    </footer>
  );
}
