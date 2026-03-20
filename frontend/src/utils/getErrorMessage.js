export default function getErrorMessage(err) {
  if (!err) return "An unexpected error occurred";

  // Axios response with validation errors (express-validator)
  const resp = err.response?.data;
  if (resp) {
    // common: { message: '...' }
    if (resp.message) return resp.message;
    // common: { errors: [ { msg, param } ] }
    if (Array.isArray(resp.errors)) {
      return resp.errors.map((e) => (e.msg ? `${e.param || "field"}: ${e.msg}` : JSON.stringify(e))).join("; ");
    }
    // fallback: stringify body
    try {
      return typeof resp === "string" ? resp : JSON.stringify(resp);
    } catch (e) {
      return "Server returned an error";
    }
  }

  // axios timeout or network errors
  if (err.code === "ECONNABORTED" || (err.message && err.message.toLowerCase().includes("timeout"))) {
    return "Request timed out. Please check your network and try again.";
  }
  if (err.code === "ERR_NETWORK" || err.message?.toLowerCase().includes("network")) {
    return "Network error. Please check your connection.";
  }

  // cancelled requests
  if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return "Request cancelled";

  // generic axios / JS error
  if (err.message) return err.message;

  return "An unexpected error occurred";
}
