export const getToken = () => localStorage.getItem("access");
export const getRole = () => localStorage.getItem("role");
export const logout = () => localStorage.clear();
