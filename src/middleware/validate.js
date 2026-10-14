export function validateBody(schema) {
  return async (ctx, next) => {
    const result = schema.safeParse(ctx.request.body);
    if (!result.success) {
      ctx.status = 400;
      ctx.body = {
        error: "Invalid request body",
        details: result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      };
      return;
    }
    ctx.request.body = result.data;
    await next();
  };
}