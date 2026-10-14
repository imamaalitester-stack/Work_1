import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing required environment variable: JWT_SECRET");
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "12h",
  });
}

export async function requireAuth(ctx, next) {
  const header = ctx.get("Authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    ctx.status = 401;
    ctx.body = { error: "Missing or invalid Authorization header" };
    return;
  }
  try {
    ctx.state.user = jwt.verify(token, JWT_SECRET);
  } catch {
    ctx.status = 401;
    ctx.body = { error: "Invalid or expired token" };
    return;
  }
  await next();
}