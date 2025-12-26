import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect('/sign-in');

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={user} />
      
      <main className="flex-1 text-gray-400">
        <div className="container py-10">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
