// middlewares/deviceId.js
import { v4 as uuidv4 } from "uuid";

function deviceIdMiddleware(req, res, next) {
  // If cookie already exists, continue
  if (req.cookies && req.cookies.viewerId) {
    req.deviceId = req.cookies.viewerId; // attach to request
    return next();
  }
 
  // Otherwise generate a new one
  const newDeviceId = uuidv4();

  // Set as cookie (HttpOnly = true so JS can’t access it)
  res.cookie("viewerId", newDeviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only https in prod
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
  });

  req.deviceId = newDeviceId;
  next();
}

export  {deviceIdMiddleware};
