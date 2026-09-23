import { Public } from "../../const";
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
  {
    stepNumber: '01',
    stepString: 'Lead Messages'
  },
  {
    stepNumber: '02',
    stepString: 'AI Collects Information'
  },
  {
    stepNumber: '03',
    stepString: 'AI Qualifies the Lead'
  },
  {
    stepNumber: '04',
    stepString: 'Visit Is Booked'
  },
  {
    stepNumber: '05',
    stepString: 'Agency Gets the Lead'
  },
]
const FeatureCard = ({ imgSrc, header, paragraph, className = "" }: FeatureCardProps) => {
  return (
    <div
      className={`rounded-2xl bg-white p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      <img
        src={imgSrc}
        alt=""
        className="mb-5 h-8 w-8"
      />

      <h2 className="mb-2 text-lg font-bold text-slate-900">
        {header}
      </h2>

      <p className="text-sm leading-6 text-slate-600">
        {paragraph}
      </p>
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

        <h1 className="mt-3 max-w-35 text-center text-sm font-bold text-black sm:text-base">
          {stepString}
        </h1>
      </div>

      {!isLast && (
        <>
         
          <div className="mt-6 hidden h-0.5 min-w-8 flex-1 bg-slate-300 sm:block" />

          
          
        </>
      )}
    </div>
  );
};




export const Hero = () => {
  return (
    <div>
      <section  className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col items-center justify-center gap-12 px-6 py-16 sm:px-8 lg:flex-row lg:gap-16 lg:py-20">
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
              src={Public.image.heroimg}
              alt="Auto Estate AI dashboard"
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          {/* Section heading */}
          <h1 className="mb-10 text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Everything You Need to Convert More Leads
          </h1>

          {/* Cards */}
          <div id="features" className=" grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              imgSrc={Public.icons.chatIcon}
              header="24/7 WhatsApp Assistant"
              paragraph="Engage leads instantly at any time of day, right where they already are."
            />

            <FeatureCard
              imgSrc={Public.icons.tasks}
              header="Automatic Lead Qualification"
              paragraph="Engage leads instantly at any time of day, right where they already are."
            />

            <FeatureCard
              imgSrc={Public.icons.ai}
              header="AI Property Assistant"
              paragraph="Answer client questions instantly using your property data."
            />

            <FeatureCard
              imgSrc={Public.icons.calander}
              header="Smart Scheduling"
              paragraph="Book property visits automatically without manual follow-up."
            />

            <FeatureCard
              imgSrc={Public.icons.profileLead}
              header="Lead Profiles"
              paragraph="Keep track of every lead and their interaction history."
            />
            <FeatureCard
              imgSrc={Public.icons.autoLeads}
              header="Automated Follow-ups"
              paragraph="Nurture leads automatically and never miss an opportunity."
            />
          </div>
        </div>
      </section>
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20 ">
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
      </section>
    </div>
  );
};
