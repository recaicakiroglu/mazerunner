import { watch } from 'vue'
import type { Ref } from 'vue'
import { toast } from 'vue3-toastify'

export function useErrorToast(error: Ref<string | null>) {
  watch(error, (msg) => {
    if (msg) {
      toast.error(msg)
    }
  })
}
