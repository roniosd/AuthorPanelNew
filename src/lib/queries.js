import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, get, send } from "@/lib/api";

const P = "/author-panel";
export const useSummary = () => useQuery({ queryKey: ["summary"], queryFn: () => get(`${P}/summary`) });
export const useBooks = () => useQuery({ queryKey: ["books"], queryFn: () => get(`${P}/books`) });
export const useBook = (id) => useQuery({ queryKey: ["book", id], queryFn: () => get(`${P}/books/${id}`), enabled: Boolean(id) });
export const useSales = (params) => useQuery({ queryKey: ["sales", params], queryFn: () => get(`${P}/sales`, params), placeholderData: (prev) => prev });
export const useHistory = (params) => useQuery({ queryKey: ["history", params], queryFn: () => get(`${P}/history`, params), placeholderData: (prev) => prev });
export const usePayouts = (params) => useQuery({ queryKey: ["payouts", params], queryFn: () => get(`${P}/payouts`, params) });
export const usePayout = (id) => useQuery({ queryKey: ["payout", id], queryFn: () => get(`${P}/payouts/${id}`), enabled: Boolean(id) });
export const useAdvance = (id) => useQuery({ queryKey: ["advance", id], queryFn: () => get(`${P}/advances/${id}`), enabled: Boolean(id) });
export const useNotifications = (params, options = {}) => useQuery({ queryKey: ["notifications", params], queryFn: () => get(`${P}/notifications`, params), refetchInterval: 60_000, ...options });
export const useOnboarding = (enabled = true) => useQuery({ queryKey: ["onboarding"], queryFn: () => get(`${P}/onboarding`), enabled });
export const usePosProfile = () => useQuery({ queryKey: ["pos-profile"], queryFn: () => get(`${P}/profile`) });
// Website profile through the POS proxy; errors here never sign the author out (see api.js).
export const useProfile = (enabled = true) => useQuery({ queryKey: ["self-profile"], queryFn: async () => (await api.get("/author/self-profile")).data.author, retry: false, enabled });
// Name and photo of the signed-in author: website profile first (photo is managed there), POS as fallback.
export function useMe() {
  const { data: profile } = useProfile();
  const { data: summary } = useSummary();
  const pos = summary?.author || {};
  return { name: profile?.bn_author || pos.bn_author || profile?.en_author || pos.en_author || "", photo: profile?.photo || null, email: profile?.email || pos.email, profile, summary };
}
export const usePayMethods = () => useQuery({ queryKey: ["author-profile"], queryFn: () => get("/auth/author-profile"), select: (data) => data?.paymentinfo || [] });

// Mutation with automatic refresh of the money-related queries.
export function useAction(fn, keys = ["summary", "payouts", "history", "author-profile", "notifications", "onboarding", "self-profile", "pos-profile"]) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })) });
}

export const actions = {
  withdraw: (body) => send("post", `${P}/payouts`, body),
  cancelWithdraw: (id) => send("post", `${P}/payouts/${id}/cancel`),
  readNotifications: () => send("patch", `${P}/notifications`, {}),
  finishOnboarding: () => send("post", `${P}/onboarding`),
  seen: (key) => send("post", `${P}/seen`, { key }),
  changePassword: (body) => send("post", `${P}/password`, body),
  saveEducation: (education) => send("patch", `${P}/profile`, { education }),
  addMethod: (body) => send("post", "/author-payment-info/add", body),
  editMethod: ({ id, ...body }) => send("put", `/author-payment-info/edit/${id}`, body),
  deleteMethod: (id) => send("delete", `/author-payment-info/delete/${id}`),
  defaultMethod: (id) => send("post", `${P}/payment-methods/${id}/default`),
  saveProfile: (body) => send("put", "/author/self-profile", body),
  uploadPhoto: (form) => send("post", "/author/self-profile", form),
};
