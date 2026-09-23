import React from "react";

export const Hero = () => {
  return (
    <div>
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col items-center justify-center gap-12 px-6 py-16 sm:px-8 lg:flex-row lg:gap-16 lg:py-20">
        <div className="w-full max-w-2xl text-center lg:text-left">
          <h1 className="mb-6 text-4xl font-extrabold leading-[1.15] tracking-[-0.02em] text-(--color-heading) sm:text-5xl lg:text-5xl">
            Turn WhatsApp Leads Into{" "}
            <span className="text-(--color-primary)">Booked Visits</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-[1.6] text-(--color-body) sm:text-lg lg:mx-0">
            Auto Estate AI talks with your leads, collects their information,
            qualifies their interest, and books property visits automatically.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <button className="w-full rounded-lg bg-(--color-primary) px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-(--color-primary-hover) hover:shadow-md sm:w-auto">
              Get Started
            </button>

            <button className="w-full rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 sm:w-auto">
              See How It Works
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-(--color-muted) lg:justify-start">
            <span className="text-(--color-primary)">✓</span>
            Automate your leads. Book more visits.
          </div>
        </div>

        <div className="relative w-full max-w-xl">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-(--color-primary-light) blur-2xl" />

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <img
              src="/heroImg.png"
              alt="Auto Estate AI dashboard"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section>
        <h1 className="flex justify-center text-2xl text-black font-extrabold ">Everything You Need to Convert More Leads</h1>
        <div>

        </div>
      </section>
    </div>
  );
};
