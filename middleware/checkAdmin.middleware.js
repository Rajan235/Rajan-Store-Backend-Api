import { ApiError } from "../util/ApiError.js";

const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json(new ApiError(403, "Access denied"));
  }
  next();
};
export { checkAdmin };
