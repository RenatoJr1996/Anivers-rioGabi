import { RsvpForm } from "@/app/components/RsvpForm";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

export default async function Home() {
  const sessionId = await getSessionId();
  logger.info(
    "homePage",
    sessionId,
    "Starting public invitation page loading flow",
  );
  logger.info(
    "homePage",
    sessionId,
    "Public invitation page loaded successfully",
  );

  return (
    <main className="public-page">
      <section className="invitation-card" aria-label="Convite de aniversário">
        <div className="gold-frame">
          <p className="invitation-overline">
            Você é meu convidado para comemorar meu
          </p>
          <div className="ornament" aria-hidden="true">
            <span />
            <strong>♥</strong>
            <span />
          </div>
          <h1>Aniversário!</h1>
          <p className="age-line">26 anos</p>
        </div>
      </section>
      <section
        className="flex w-full items-center justify-center rounded-lg bg-[#fff8ea] px-2 py-5 shadow-[0_18px_50px_rgba(20,57,39,0.1)]"
        aria-label="Detalhes do evento"
      >
        <div className="grid w-full max-w-3xl grid-cols-3 divide-x divide-[#b984226b]">
          {/* DIA */}
          <div className="flex flex-col items-center px-2 text-center">
            <div className="mb-3 flex h-8 items-center justify-center">
              <svg
                viewBox="0 0 48 48"
                focusable="false"
                className="h-6 w-6 fill-none stroke-black stroke-[2.5]"
              >
                <rect x="10" y="12" width="28" height="28" rx="4" />
                <path d="M16 8v8M32 8v8M10 20h28M24 29l-3-3a4 4 0 0 0-6 6l9 8 9-8a4 4 0 0 0-6-6l-3 3Z" />
              </svg>
            </div>

            <div className="flex min-h-[72px] flex-col items-center justify-start">
              <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-black sm:text-sm">
                Dia
              </p>

              <strong className="font-serif text-2xl leading-none text-black sm:text-3xl">
                24
              </strong>

              <small className="mt-1 font-serif text-sm font-bold uppercase text-black sm:text-base">
                de maio
              </small>
            </div>
          </div>

          {/* HORÁRIO */}
          <div className="flex flex-col items-center px-2 text-center">
            <div className="mb-3 flex h-8 items-center justify-center">
              <svg
                viewBox="0 0 48 48"
                focusable="false"
                className="h-6 w-6 fill-none stroke-black stroke-[2.5]"
              >
                <circle cx="24" cy="24" r="16" />
                <path d="M24 14v11l7 5" />
              </svg>
            </div>

            <div className="flex min-h-[72px] flex-col items-center justify-start">
              <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-black sm:text-sm">
                Horário
              </p>

              <strong className="font-serif text-2xl leading-none text-black sm:text-3xl">
                19h
              </strong>
            </div>
          </div>

          {/* LOCAL */}
          <div className="flex flex-col items-center px-2 text-center">
            <div className="mb-3 flex h-8 items-center justify-center">
              <svg
                viewBox="0 0 48 48"
                focusable="false"
                className="h-6 w-6 fill-none stroke-black stroke-[2.5]"
              >
                <path d="M24 6 10 19v21h28V19L24 6Z" />
                <path d="M19 40V28h10v12" />
              </svg>
            </div>

            <div className="flex min-h-[72px] flex-col items-center justify-start">
              <p className="mb-1 text-xs font-extrabold uppercase tracking-wider text-black sm:text-sm">
                Local
              </p>

              <strong className="font-serif text-sm italic leading-tight text-black sm:text-2xl">
                Pizzaria Tomatelli
              </strong>
            </div>
          </div>
        </div>
      </section>

      <RsvpForm />
    </main>
  );
}
