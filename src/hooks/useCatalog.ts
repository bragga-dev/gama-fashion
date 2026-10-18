import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { campaignService, catalogService, reviewService } from '@/services/catalog.service'
import type { ProductFilters } from '@/types/product'

export const useProducts = (filters: ProductFilters) =>
  useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogService.listProducts(filters),
    placeholderData: keepPreviousData,
  })

export const useProduct = (id?: string) =>
  useQuery({ queryKey: ['product', id], queryFn: () => catalogService.getProduct(id!), enabled: !!id })

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: catalogService.listCategories, staleTime: 10 * 60_000 })

export const useRunningCampaigns = () =>
  useQuery({
    queryKey: ['campaigns', 'running'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const campaigns = await campaignService.running()
      return Promise.all(
        campaigns.map(async (c) => ({ ...c, images: await campaignService.images(c.campaign_id).catch(() => []) })),
      )
    },
  })

export const useProductReviews = (productId?: string) =>
  useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const [list, summary] = await Promise.all([
        reviewService.listForProduct(productId!),
        reviewService.summary(productId!).catch(() => null),
      ])
      return { list, summary }
    },
    enabled: !!productId,
  })
