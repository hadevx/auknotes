const LOGOS = [
  { src: "/logos/auk.png", alt: "AUK" },
  { src: "/logos/kuniv.png", alt: "KUNIV" },
  { src: "/logos/knpc.png", alt: "KNPC" },
  { src: "/logos/equate.png", alt: "EQUATE" },
  { src: "/logos/network+.png", alt: "NETWORK +" },
  { src: "/logos/security+.png", alt: "SECURITY +" },
];

export default function LogosOnly() {
  return (
    <section className="w-full">
      {/* ✅ clean + modern “logo rail” */}
      <div className="relative rounded-[28px]  px-5 py-6 sm:px-7 sm:py-7">
        {/* top hairline */}
        {/* <div className="absolute left-6 right-6 top-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" /> */}
        {/* bottom hairline */}
        {/* <div className="absolute left-6 right-6 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent" /> */}

        {/* logos container */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-32">
          {LOGOS.map((logo) => (
            <div key={logo.alt} className="relative flex items-center justify-center">
              {/* subtle underline hover */}
              <span className="pointer-events-none absolute -bottom-2 left-1/2 h-px w-0 -translate-x-1/2 bg-zinc-900/60 transition-all duration-300 group-hover:w-full" />

              <div className="group">
                <img
                  src={logo.src}
                  alt={logo.alt}
                  loading="lazy"
                  className="
                    h-20 
                    w-auto object-contain
                    opacity-70 grayscale
                    transition duration-300
                    group-hover:opacity-100 group-hover:grayscale-0
                  "
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
