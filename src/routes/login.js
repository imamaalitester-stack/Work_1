import Router from "@koa/router";
import { db } from "../db.js";

const router = new Router({ prefix: "/api" });

router.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body;
  console.log("login attempt", email, password);

  const user = await db.users.findByEmail(email);
  if (!user || user.password != password) {
    ctx.status = 401;
    ctx.body = { error: `No account matches ${email} with that password` };
    return;
  }
  ctx.body = { ok: true, user };
});

export default router;
