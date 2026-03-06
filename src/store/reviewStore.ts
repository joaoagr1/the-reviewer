import { create } from 'zustand'
import type { Review } from '../domain/persona'
import { saveReview, listReviews, deleteReview } from '../services/personaService'

interface ReviewStore {
  reviews: Review[]
  loading: boolean
  error: string | null
  fetchReviews: (personaId: string) => Promise<void>
  addReview: (review: Review) => Promise<void>
  removeReview: (id: string) => Promise<void>
}

export const useReviewStore = create<ReviewStore>((set) => ({
  reviews: [],
  loading: false,
  error: null,

  fetchReviews: async (personaId: string) => {
    set({ loading: true, error: null })
    try {
      const reviews = await listReviews(personaId)
      set({ reviews, loading: false })
    } catch (e) {
      set({ error: String(e), loading: false })
    }
  },

  addReview: async (review: Review) => {
    await saveReview(review)
    set((state) => ({ reviews: [review, ...state.reviews] }))
  },

  removeReview: async (id: string) => {
    await deleteReview(id)
    set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) }))
  },
}))
