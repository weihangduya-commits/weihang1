import "next-auth";
import "next-auth/jwt";

type Role = "admin" | "user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
