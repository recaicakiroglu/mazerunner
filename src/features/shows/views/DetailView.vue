<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <BaseButton @click="goBack">
        <ChevronLeft aria-hidden="true" class="w-4 h-4" /> Back
      </BaseButton>

      <BaseButton
        v-if="show?.officialSite"
        variant="filled"
        :href="show.officialSite"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Official site for ${show?.name} (opens in new tab)`"
      >
        Official Site ↗
      </BaseButton>
    </div>

    <LoadingSpinner v-if="loading" />

    <section v-else-if="error" class="text-center py-12 text-text-secondary">
      <p>{{ error }}</p>
      <BaseButton variant="filled" class="mt-4" @click="goBack">Go back</BaseButton>
    </section>

    <ShowDetail v-else-if="show" :show="show" :cast="cast" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { ChevronLeft } from 'lucide-vue-next'
  import { useShowStore } from '@/features/shows/store/shows'
  import { getShowCast } from '@/api/tvmaze'
  import ShowDetail from '@/features/shows/components/ShowDetail.vue'
  import LoadingSpinner from '@/shared/components/LoadingSpinner.vue'
  import BaseButton from '@/shared/components/BaseButton.vue'
  import type { ShowDetail as ShowDetailData, CastMember } from '@/types'

  const props = defineProps<{ id: string }>()
  const router = useRouter()
  const store = useShowStore()

  const show = ref<ShowDetailData | null>(null)
  const cast = ref<CastMember[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function loadShow(id: number) {
    loading.value = true
    error.value = null
    show.value = null
    cast.value = []

    const [result, castResult] = await Promise.all([store.getShowById(id), getShowCast(id)])
    if (result) {
      show.value = result
      cast.value = castResult
    } else {
      error.value = 'Show not found'
    }
    loading.value = false
  }

  watch(
    () => props.id,
    (id) => void loadShow(Number(id)),
    { immediate: true }
  )

  function goBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }
</script>
