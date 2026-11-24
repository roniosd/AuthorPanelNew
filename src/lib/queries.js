import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, get, send } from "@/lib/api";

const P = "/author-panel";
export const useSummary = () => useQuery({ queryKey: ["summary"], queryFn: () => get(`${P}/summary`) });
export const useBooks = () => useQuery({ queryKey: ["books"], queryFn: () => get(`${P}/books`) });
export const useBook = (id) => useQuery({ queryKey: ["book", id], queryFn: () => get(`${P}/books/${id}`), enabled: Boolean(id) });
export const useSales = (params) => useQuery({ queryKey: ["sales", params], queryFn: () => get(`${P}/sales`, params), placeholderData: (prev) => prev });
export const useHistory = (params) => useQuery({ queryKey: ["history", params], queryFn: () => get(`${P}/history`, params), placeholderData: (prev) => prev });
export const usePayouts = (params) => useQuery({ queryKey: ["payouts", params], queryFn: () => get(`${P}/payouts`, params) });
export const useNotifications = (params) => useQuery({ queryKey: ["notifications", params], queryFn: () => get(`${P}/notifications`, params), refetchInterval: 60_000 });
export const useOnboarding = (enabled = true) => useQuery({ queryKey: ["onboarding"], queryFn: () => get(`${P}/onboarding`), enabled });
export const useProfile = () => useQuery({ queryKey: ["self-profile"], queryFn: async () => (await api.get("/author/self-profile")).data.author, retry: false });
export const usePayMethods = () => useQuery({ queryKey: ["author-profile"], queryFn: () => get("/auth/author-profile"), select: (data) => data?.paymentinfo || [] });

// Mutation with automatic refresh of the money-related queries.
export function useAction(fn, keys = ["summary", "payouts", "history", "author-profile", "notifications", "onboarding", "self-profile"]) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })) });
}

export const actions = {
  withdraw: (body) => send("post", `${P}/payouts`, body),
  cancelWithdraw: (id) => send("post", `${P}/payouts/${id}/cancel`),
  readNotifications: (ids) => send("patch", `${P}/notifications`, { ids }),
  finishOnboarding: () => send("post", `${P}/onboarding`),
  addMethod: (body) => send("post", "/author-payment-info/add", body),
  editMethod: ({ id, ...body }) => send("put", `/author-payment-info/edit/${id}`, body),
  deleteMethod: (id) => send("delete", `/author-payment-info/delete/${id}`),
  defaultMethod: (id) => send("post", `${P}/payment-methods/${id}/default`),
  saveProfile: (body) => send("put", "/author/self-profile", body),
  uploadPhoto: (form) => send("post", "/author/self-profile", form),
};
