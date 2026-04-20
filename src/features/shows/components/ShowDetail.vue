<template>
  <article class="grid grid-cols-1 md:grid-cols-[3fr_8fr] gap-10 md:gap-14 max-w-7xl">
    <!-- Poster -->
    <div class="w-full max-w-65 mx-auto md:max-w-none relative group">
      <img
        v-if="show.image"
        :src="show.image.original"
        :alt="show.name"
        class="w-full aspect-2/3 rounded-2xl object-cover shadow-2xl"
      />
      <div
        v-else
        class="w-full aspect-2/3 rounded-2xl bg-linear-to-br from-bg-surface to-bg-surface-hover flex items-center justify-center text-text-muted"
      >
        No image available
      </div>
      <FavoriteButton :show="show" size="lg" always-visible class="absolute top-3 left-3" />
    </div>

    <!-- Info -->
    <div class="flex flex-col gap-6">
      <!-- Title + meta row + rating -->
      <div>
        <div class="flex items-center justify-between gap-4 mb-2">
          <h1 class="text-[2rem] md:text-[2.6rem] font-bold leading-tight">{{ show.name }}</h1>
          <RatingBadge :rating="show.rating.average" size="lg" />
        </div>
        <div class="flex items-center gap-2 text-[0.85rem] text-text-muted mb-3">
          <span v-if="year">{{ year }}</span>
          <span v-if="year && show.language" class="opacity-40">|</span>
          <span v-if="show.language">{{ show.language }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div>
        <div role="tablist" class="flex gap-6 border-b border-white/10 mb-5">
          <button
            v-for="tab in tabs"
            :id="`tab-${tab}`"
            :key="tab"
            role="tab"
            :aria-selected="activeTab === tab"
            :aria-controls="`tabpanel-${tab}`"
            :tabindex="activeTab === tab ? 0 : -1"
            class="pb-2.5 text-[0.85rem] font-semibold uppercase tracking-widest transition-colors duration-150 cursor-pointer border-b-2 -mb-px"
            :class="
              activeTab === tab
                ? 'text-text-primary border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            "
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Overview -->
        <div
          v-if="activeTab === 'Overview'"
          id="tabpanel-Overview"
          role="tabpanel"
          aria-labelledby="tab-Overview"
          tabindex="0"
        >
          <p v-if="summary" class="leading-[1.8] text-text-secondary text-[0.95rem]">
            {{ summary }}
          </p>
          <p v-else class="leading-[1.8] text-text-muted italic text-[0.95rem]">
            No summary available.
          </p>

          <dl v-if="overviewFields.length" class="mt-5 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2">
            <template v-for="field in overviewFields" :key="field.label">
              <dt class="text-text-muted text-[0.78rem] uppercase tracking-widest">
                {{ field.label }}
              </dt>
              <dd class="text-text-secondary text-[0.9rem]">{{ field.value }}</dd>
            </template>
          </dl>
        </div>

        <!-- Cast -->
        <div
          v-else-if="activeTab === 'Cast'"
          id="tabpanel-Cast"
          role="tabpanel"
          aria-labelledby="tab-Cast"
          tabindex="0"
        >
          <div v-if="cast.length" class="grid grid-cols-2 gap-2">
            <div
              v-for="{ person, character } in cast.slice(0, 8)"
              :key="person.id"
              class="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-bg-surface-hover"
            >
              <img
                v-if="person.image"
                :src="person.image.medium"
                :alt="person.name"
                class="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <div
                v-else
                class="w-11 h-11 rounded-full bg-bg-surface shrink-0 flex items-center justify-center text-text-muted text-[0.65rem]"
              >
                ?
              </div>
              <div class="min-w-0">
                <p class="text-[0.88rem] font-medium text-text-primary leading-tight truncate">
                  {{ person.name }}
                </p>
                <p class="text-[0.78rem] text-text-muted leading-tight truncate mt-0.5">
                  {{ character.name }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="text-text-muted italic text-[0.95rem]">No cast information available.</p>
        </div>

        <!-- Details -->
        <div
          v-else-if="activeTab === 'Details'"
          id="tabpanel-Details"
          role="tabpanel"
          aria-labelledby="tab-Details"
          tabindex="0"
        >
          <dl class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2">
            <template v-for="field in metaFields" :key="field.label">
              <dt class="text-text-muted text-[0.78rem] uppercase tracking-widest">
                {{ field.label }}
              </dt>
              <dd class="text-text-secondary text-[0.9rem]">{{ field.value }}</dd>
            </template>
          </dl>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { ShowDetail, CastMember } from '@/types'
  import { buildMetaFields } from '@/features/shows/utils/showFormatters'
  import RatingBadge from '@/shared/components/RatingBadge.vue'
  import FavoriteButton from '@/shared/components/FavoriteButton.vue'

  const props = defineProps<{ show: ShowDetail; cast: CastMember[] }>()

  const tabs = ['Overview', 'Cast', 'Details'] as const
  type Tab = (typeof tabs)[number]

  const activeTab = ref<Tab>('Overview')
  const metaFields = computed(() => buildMetaFields(props.show))
  const year = computed(() => props.show.premiered?.split('-')[0] ?? null)
  const summary = computed(() => props.show.summary?.replace(/<[^>]*>/g, '') ?? null)

  const overviewFields = computed(
    () =>
      [
        {
          label: 'Starring',
          value:
            props.cast
              .slice(0, 3)
              .map((c) => c.person.name)
              .join(', ') || null,
        },
        { label: 'Genre', value: props.show.genres.join(', ') || null },
        { label: 'Network', value: props.show.network?.name ?? null },
      ].filter((f) => Boolean(f.value)) as { label: string; value: string }[]
  )
</script>
