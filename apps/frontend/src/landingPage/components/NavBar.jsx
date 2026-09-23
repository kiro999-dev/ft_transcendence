"use client";

import { useState } from "react";

export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Logo */}
        <div>
          <h1 className="text-2xl font-extrabold text-(--color-primary)">
            Auto Estate
          </h1>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-(--color-primary)"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-(--color-primary)"
          >
            How It Works
          </a>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900">
            Log In
          </button>

          <button className="rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--color-primary-hover)">
            Get Started
          </button>
        </div>

    
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (

            <img src="/burger-icon.svg" alt="Menu" className="h-6 w-6" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-200 px-6 py-5 md:hidden">
          <div className="flex flex-col gap-5">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-slate-600 hover:text-(--color-primary)"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-slate-600 hover:text-(--color-primary)"
            >
              How It Works
            </a>

            <div className="h-px bg-slate-200" />

            <button className="text-left text-sm font-semibold text-slate-700 hover:text-slate-900">
              Log In
            </button>

            <button className="rounded-lg bg-(--color-primary) px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--color-primary-hover)">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
