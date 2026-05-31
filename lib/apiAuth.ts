import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fail } from "@/lib/apiResponse";

export async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      session: null,
      response: fail("Unauthorized", 401)
    };
  }

  return { session, response: null };
}

export async function requireAdmin() {
  const auth = await requireUser();

  if (auth.response) {
    return auth;
  }

  if (auth.session.user.role !== "admin") {
    return {
      session: null,
      response: fail("Forbidden", 403)
    };
  }

  return auth;
}
