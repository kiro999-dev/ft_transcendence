
import { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { RxCross2 } from "react-icons/rx";
import { Link } from "react-router-dom";
export const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50  backdrop-blur">
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
          <Link to="/login">
            <button className=" text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900">
              Log In
            </button>
          </Link>

          <Link to="sign-up">
            <button className="rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--color-primary-hover)">
              Get Started
            </button>
          </Link>

        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <RxCross2 className="text-blue-600" /> : <CiMenuBurger className="text-blue-600" />}
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
            <Link to="/login">
              <button className="text-left text-sm font-semibold text-slate-700 hover:text-slate-900">
                Log In
              </button>
            </Link>

            <Link to="/sign-up">
              <button className="rounded-lg bg-(--color-primary) px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--color-primary-hover)">
                Get Started
              </button>
            </Link>

          </div>
        </div>
      )}
    </nav>
  );
};
