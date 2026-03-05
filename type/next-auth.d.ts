import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      surname: string;
      email: string;
      isAdmin: boolean;
    };
  }
}