import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'shadow-none bg-transparent p-0',
          headerTitle: 'text-slate-900 text-2xl font-bold',
          headerSubtitle: 'text-slate-500',
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm',
          formFieldInput: 'border-slate-200 rounded-lg text-sm focus:ring-blue-500',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
          dividerLine: 'bg-slate-200',
          dividerText: 'text-slate-400 text-xs',
          socialButtonsBlockButton: 'border-slate-200 text-slate-700 hover:bg-slate-50',
        },
      }}
    />
  );
}
