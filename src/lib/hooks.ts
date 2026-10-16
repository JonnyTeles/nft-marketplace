import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { CartItem, NFT, User, Wallet, Order } from "@/types";

export function useNFTs(params: {
  q: string;
  category: string;
  sort: string;
  page: number;
}) {
  return useQuery({
    queryKey: ["nfts", params],
    queryFn: async ({ signal }) =>
      (await api.get("/nfts", { params, signal })).data as {
        items: NFT[];
        total: number;
        page: number;
        pageSize: number;
      },
  });
}
export function useNFT(id: string) {
  return useQuery({
    queryKey: ["nft", id],
    queryFn: async ({ signal }) =>
      (await api.get(`/nfts/${id}`, { signal })).data.nft as NFT,
  });
}
export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () =>
      (await api.get("/cart")).data.items as Array<CartItem & { nft: NFT }>,
  });
}
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => (await api.get("/session")).data.user as User,
    retry: false,
  });
}
export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => (await api.get("/favorites")).data.ids as string[],
    retry: false,
  });
}
export function useWallets() {
  return useQuery({
    queryKey: ["wallets"],
    queryFn: async () => (await api.get("/wallets")).data.wallets as Wallet[],
    retry: false,
  });
}
export function useAddCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: CartItem) => api.post("/cart/items", item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}
export function useCartQuantity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      api.patch(`/cart/items/${id}`, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}
export function useRemoveCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/cart/items/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}
export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/favorites/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["favorites"] });
      const previous = qc.getQueryData<string[]>(["favorites"]) ?? [];
      qc.setQueryData(
        ["favorites"],
        previous.includes(id)
          ? previous.filter((v) => v !== id)
          : [...previous, id],
      );
      return { previous };
    },
    onError: (_err, _id, context) =>
      qc.setQueryData(["favorites"], context?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) =>
      (await api.post("/auth/login", input)).data.user as User,
    onSuccess: (user) => {
      qc.setQueryData(["session"], user);
      qc.clear();
      qc.setQueryData(["session"], user);
    },
  });
}
export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
    }) => (await api.post("/auth/register", input)).data.user as User,
    onSuccess: (user) => {
      qc.clear();
      qc.setQueryData(["session"], user);
    },
  });
}
export function useProfileUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; avatar: string }) =>
      (await api.patch("/profile", input)).data.user as User,
    onSuccess: (user) => {
      qc.setQueryData(["session"], user);
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data.order as Order,
    enabled: Boolean(id),
    retry: false,
  });
}
