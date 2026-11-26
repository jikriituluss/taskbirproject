<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Taskbir - Manajemen Proyek & Tugas Tim',
  meta: [
    {
      name: 'description',
      content:
        'Taskbir adalah aplikasi manajemen proyek dan tugas modern untuk freelancer, agensi, dan tim kecil: Kanban, kalender, laporan, dan kolaborasi tim dalam satu tempat.'
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <LandingNavbar />
    <main>
      <LandingHero />
      <LandingStats />
      <LandingProblems />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingAudience />
      <LandingFaq />
      <LandingFinalCta />
    </main>
    <LandingFooter />
  </div>
</template>
