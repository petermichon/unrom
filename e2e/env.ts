// Dedicated ports for the browser suite. The dev server normally owns 3000/3001,
// and reusing it made the tests run against stale code and data.
export const API_PORT = "3100";
export const WEB_PORT = "3101";

export const API_URL = `http://127.0.0.1:${API_PORT}`;
export const WEB_URL = `http://127.0.0.1:${WEB_PORT}`;
