import api from "./api";

export const logoutYoung = () => api.post("/young/logout");

export const deleteYoungAccount = (youngId) => api.put(`/young/${youngId}/soft-delete`);
