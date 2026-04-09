import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      profile: {
        slug: string;
        globalNumber: number;
      } | null;
    };
  }
}
