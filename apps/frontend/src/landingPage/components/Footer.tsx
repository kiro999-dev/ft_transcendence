
import { FaDiscord } from "react-icons/fa";

const DISCORD_URL = "https://discord.gg/NXFgq5n28w";

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Main footer */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.6fr_0.7fr_0.7fr] lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-extrabold text-(--color-primary)">
              Auto Estate
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
              AI-powered lead qualification, customer management, and
              appointment booking for real estate agencies.
            </p>
          </div>

          {/* Legal */}
          <nav aria-label="Legal">
            <h4 className="text-sm font-semibold text-slate-900">Legal</h4>
            <ul className="mt-4 flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-(--color-primary)"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Support</h4>
            <p className="mt-1 text-sm text-slate-500">Reach us on Discord</p>

            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join the Auto Estate Discord server"
              className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-(--color-primary) hover:text-(--color-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
             <FaDiscord/>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Auto Estate. All rights reserved.</p>
          <p>Developed by the Auto Estate Team</p>
        </div>
      </div>
    </footer>
  );
}