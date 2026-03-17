import API from "./api";

export const getClientDashboard = () => {
  return API.get("/dashboard/client/");
};

export const getFreelancerDashboard = () => {
  return API.get("/dashboard/freelancer/");
};
