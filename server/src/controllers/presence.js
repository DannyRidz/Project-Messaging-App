import { updateActivity } from "../models/presence.js";

export async function recordActivity(req, res) {
  await updateActivity(req.user.id);

  res.status(204).end();
}
