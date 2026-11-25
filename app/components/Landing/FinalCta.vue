<template>
  <section id="mulai" class="scroll-mt-20 bg-slate-50 pt-4 pb-16 sm:pb-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-14 text-center shadow-2xl shadow-indigo-500/25 sm:px-12 sm:py-16"
      >
        <div
          class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          class="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-400/20 blur-2xl"
          aria-hidden="true"
        />

        <div class="relative mx-auto max-w-lg">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Siap rapikan kerja tim?
          </h2>
          <p class="mt-3 text-sm text-indigo-100 sm:text-base">
            Buat workspace gratis — tim Anda bisa mulai dalam hitungan menit.
          </p>
          <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
            <UButton
              to="/register"
              color="neutral"
              size="lg"
              trailing-icon="i-lucide-arrow-right"
              class="bg-white text-indigo-700 hover:bg-indigo-50"
            >
              Mulai Gratis
            </UButton>
            <UButton
              to="/login"
              color="neutral"
              variant="outline"
              size="lg"
              class="border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              Sudah punya akun
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
