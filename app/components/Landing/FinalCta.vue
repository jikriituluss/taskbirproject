<template>
  <section id="mulai" class="scroll-mt-20 bg-slate-50 pt-4 pb-16 sm:pb-24">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 px-6 py-14 text-center shadow-2xl shadow-slate-900/20 sm:px-12 sm:py-16"
      >
        <div class="relative mx-auto max-w-lg">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Siap rapikan kerja tim?
          </h2>
          <p class="mt-3 text-sm text-indigo-100 sm:text-base">
            Buat workspace gratis, tim Anda bisa mulai dalam hitungan menit.
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
              variant="ghost"
              size="lg"
              class="border border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              Sudah punya akun
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
