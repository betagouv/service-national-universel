import api from "./api";

export const logoutYoung = () => api.post("/young/logout");

export const deleteYoungAccount = (youngId) => api.put(`/young/${youngId}/soft-delete`);
export const withdrawYoungAccount = ({ withdrawnMessage, withdrawnReason }) => api.put(`/young/withdraw`, { withdrawnMessage, withdrawnReason });
export const abandonYoungAccount = ({ withdrawnMessage, withdrawnReason }) => api.put(`/young/abandon`, { withdrawnMessage, withdrawnReason });
