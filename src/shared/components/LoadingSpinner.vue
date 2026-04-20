<template>
  <div
    role="status"
    aria-live="polite"
    class="flex flex-col items-center justify-center gap-5 min-h-[60vh] text-text-secondary"
  >
    <div
      aria-hidden="true"
      class="w-16 h-16 border-4 border-bg-surface border-t-accent rounded-full animate-spin"
    />
    <p class="sr-only"><slot>Loading...</slot></p>
  </div>
</template>
