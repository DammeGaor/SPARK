import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">

      {/* Left Panel - UP Maroon */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #6b0f24 0%, #8f1535 40%, #5a0c1c 100%)" }}>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #faf3e0 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Green accent bar top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-upgreen-500" />

        {/* Glowing orbs */}
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full blur-[100px]"
          style={{ background: "rgba(143, 21, 53, 0.6)" }} />
        <div className="absolute bottom-1/4 right-0 w-60 h-60 rounded-full blur-[80px]"
          style={{ background: "rgba(46, 125, 50, 0.2)" }} />

        {/* Logo — dark variant for maroon background */}
        <div className="relative z-10">
          <Image
            src="/spark-logo-dark.svg"
            alt="SPARK"
            width={220}
            height={70}
            priority
          />
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="w-10 h-0.5 bg-upgreen-400 mb-6" />
          <blockquote className="font-serif text-2xl text-parchment-100 leading-relaxed mb-5">
            "Honor and Excellence in the Service of the Nation!"
          </blockquote>
          <cite className="text-parchment-400 text-xs not-italic tracking-widest uppercase">
            University of the Philippines
          </cite>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-upgreen-400" />
          <p className="text-parchment-400 text-xs">
            An Undergraduate Special Problem by Sheyn Jenelle E. Briones
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-parchment-50">

        {/* Mobile header */}
        <div className="lg:hidden mb-10 text-center">
          <Image
            src="/spark-logo.svg"
            alt="SPARK"
            width={180}
            height={56}
            priority
            className="mx-auto"
          />
        </div>

        <div className="w-full max-w-md">{children}</div>

        {/* UP footer */}
        <div className="mt-10 flex items-center gap-2 opacity-40">
          <div className="w-3 h-3 rounded-full bg-maroon-600" />
          <div className="w-3 h-3 rounded-full bg-upgreen-600" />
          <span className="text-xs text-maroon-600 tracking-widest uppercase ml-1">University of the Philippines</span>
        </div>
      </div>

    </div>
  );
}