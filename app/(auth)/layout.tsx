export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 bg-[#0d1b2e] px-12 py-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C9.5 2 7.5 3.5 7 5.5C6.5 4 5 3 3.5 3C2 3 1 4.5 1.5 6.5C2 8.5 3.5 10 5 11C5.5 13 6 16 7 18C7.5 19.5 8.5 22 10 22C11 22 11.5 21 12 19.5C12.5 21 13 22 14 22C15.5 22 16.5 19.5 17 18C18 16 18.5 13 19 11C20.5 10 22 8.5 22.5 6.5C23 4.5 22 3 20.5 3C19 3 17.5 4 17 5.5C16.5 3.5 14.5 2 12 2Z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">DentalRelay</span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Dental referrals,<br />done right.
            </h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              HIPAA-compliant referral management built for modern dental practices. Send, receive, and track patient referrals in one secure platform.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'Secure, HIPAA-compliant messaging',
              'Real-time referral status tracking',
              'Digital treatment outcome letters',
              'In-platform document signing',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-xs">© 2026 DentalRelay. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
