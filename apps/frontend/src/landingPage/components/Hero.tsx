import { Public } from "../../const";
import { Link } from "react-router";
interface FeatureCardProps {
  imgSrc: string;
  header: string;
  paragraph: string;
  className?: string;
}

interface StepsProps {
  stepNumber: string;
  stepString: string;
  isLast?: boolean;
}

const stepsData = [
  { stepNumber: "01", stepString: "Lead Messages" },
  { stepNumber: "02", stepString: "AI Collects Information" },
  { stepNumber: "03", stepString: "AI Qualifies the Lead" },
  { stepNumber: "04", stepString: "Visit Is Booked" },
  { stepNumber: "05", stepString: "Agency Gets the Lead" },
];

const featuresData = [
  {
    imgSrc: Public.icons.chatIcon,
    header: "24/7 WhatsApp Assistant",
    paragraph:
      "Engage leads instantly at any time of day, right where they already are.",
  },
  {
    imgSrc: Public.icons.tasks,
    header: "Automatic Lead Qualification",
    paragraph:
      "Qualify leads automatically and identify the prospects most likely to convert.",
  },
  {
    imgSrc: Public.icons.ai,
    header: "AI Property Assistant",
    paragraph: "Answer client questions instantly using your property data.",
  },
  {
    imgSrc: Public.icons.calander,
    header: "Smart Scheduling",
    paragraph: "Book property visits automatically without manual follow-up.",
  },
  {
    imgSrc: Public.icons.profileLead,
    header: "Lead Profiles",
    paragraph: "Keep track of every lead and their interaction history.",
  },
  {
    imgSrc: Public.icons.autoLeads,
    header: "Automated Follow-ups",
    paragraph: "Nurture leads automatically and never miss an opportunity.",
  },
];

// One shared rhythm for every section below the hero
const sectionSpacing = "px-6 py-20 sm:py-24 lg:py-28";
const sectionTitle ="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl";

const FeatureCard = ({
  imgSrc,
  header,
  paragraph,
  className = "",
}: FeatureCardProps) => {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      <img src={imgSrc} alt="" className="mb-5 h-8 w-8" />

      <h3 className="mb-2 text-lg font-bold text-slate-900">{header}</h3>

      <p className="text-sm leading-6 text-slate-600">{paragraph}</p>
    </div>
  );
};

const Step = ({ stepNumber, stepString, isLast }: StepsProps) => {
  return (
    <div className="relative flex flex-1 items-start">
      <div className="flex w-full flex-col items-center sm:w-auto">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-(--color-primary)">
          <p className="font-bold text-white">{stepNumber}</p>
        </div>

        <h3 className="mt-3 max-w-35 text-center text-sm font-bold text-black sm:text-base">
          {stepString}
        </h3>
      </div>

      {!isLast && (
        <div className="mt-6 hidden h-0.5 min-w-8 flex-1 bg-slate-300 sm:block" />
      )}
    </div>
  );
};

export const Hero = () => {
  return (
    <div>
      {/* Hero */}
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
            <Link to="/sign-up">
                <button className="w-full rounded-lg bg-(--color-primary) px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-(--color-primary-hover) hover:shadow-md sm:w-auto">
                Get Started
              </button>
            </Link>

            <a href="#how-it-works">
              <button className="w-full rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 sm:w-auto">
                See How It Works
              </button>
            </a>
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
              src={Public.image.heroimg}
              alt="Auto Estate AI dashboard"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className={`${sectionSpacing}`}
      >
        <div className="mx-auto max-w-6xl">
          <h2 className={`mb-12 ${sectionTitle}`}>
            Everything You Need to Convert More Leads
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <FeatureCard
                key={feature.header}
                imgSrc={feature.imgSrc}
                header={feature.header}
                paragraph={feature.paragraph}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className={`bg-white ${sectionSpacing}`}
      >
        <div className="mx-auto max-w-6xl">
          <h2 className={`mb-14 ${sectionTitle}`}>How It Works</h2>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-0">
            {stepsData.map((step, index) => (
              <Step
                key={step.stepNumber}
                stepNumber={step.stepNumber}
                stepString={step.stepString}
                isLast={index === stepsData.length - 1}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};