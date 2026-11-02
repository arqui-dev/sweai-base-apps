import { ZodError, type ZodType } from "zod";
import { type Result, err, ok } from "./result";

export const json = (body: unknown, status = 200): Response =>
  Response.json(body, { status });

/** Parse a JSON request body at the trust boundary. Never trusts shape. */
export async function parseBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<Result<T, { status: number; message: string; fields?: unknown }>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return err({ status: 400, message: "Body must be valid JSON." });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return err({
      status: 422,
      message: "Validation failed.",
      fields: (parsed.error as ZodError).flatten().fieldErrors,
    });
  }
  return ok(parsed.data);
}
