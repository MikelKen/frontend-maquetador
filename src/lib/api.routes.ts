export const API_URL = "http://localhost:4000/api";

export const API_ROUTES = {
  SIGN_UP: {
    url: `${API_URL}/auth/register`,
    method: "POST",
    // body: {
    //     name: "",
    //     email: "",
    //     password: "",
    // }
  },
  SIGN_IN: {
    url: `${API_URL}/auth/login`,
    method: "POST",
  },
};
