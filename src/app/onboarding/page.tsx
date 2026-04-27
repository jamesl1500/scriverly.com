import { createSupabaseClient } from '@/libs/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default async function OnboardingPage() {
  const router = useRouter();
  const supabase = await createSupabaseClient();
  const { data: userSession } = await supabase.auth.getSession();

  if(!userSession)
  {
    router.push('/login');
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col justify-center px-6 py-12">
      <section className="rounded-1xl border border-stone-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
          Welcome to Scriverly
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-tight text-stone-900">
          Your account is verified.
        </h1>
        <p className="mb-8 text-base leading-relaxed text-stone-600">
          You are now signed in. This onboarding flow is scaffolded and ready
          for your next steps, like profile setup, preferences, and first essay
          creation.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
          >
            Continue setup
          </button>
          <Link
            href="/"
            className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-400 hover:text-stone-900"
          >
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
