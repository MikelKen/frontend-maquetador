export const API_URL = process.env.NEXT_PUBLIC_SERVER_URL;

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
  PROJECT_PATH: {
    url: `${API_URL}/project`,
    method: "PATCH",
  },
  PROJECT_LIST: {
    url: `${API_URL}/project`,
    method: "GET",
  },
  PROJECT_DELETE: {
    url: `${API_URL}/project`,
    method: "DELETE",
  },
  GEMINI_API: {
    url: `${API_URL}/gemini`,
    method: "POST",
  },
};
