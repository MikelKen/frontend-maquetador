export const API_URL = "http://localhost:4000/api";

export const API_ROUTES = {
  SIGN_UP: {
    url: `${API_URL}/auth/register`,
    method: "POST",
  },
  SIGN_IN: {
    url: `${API_URL}/auth/login`,
    method: "POST",
  },
  PROJECT_SHARE: {
    url: `${API_URL}/project`,
    method: "GET",
  },

  PROJECT_CREATE: {
    url: `${API_URL}/project`,
    method: "POST",
  },
};
