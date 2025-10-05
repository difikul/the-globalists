import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const isProvider = session.user.role === "PROVIDER" || session.user.role === "ADMIN"

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="container flex h-16 items-center gap-6">
          <h2 className="text-xl font-bold">Dashboard</h2>
          <nav className="flex gap-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Přehled
              </Button>
            </Link>
            {isProvider && (
              <>
                <Link href="/dashboard/services">
                  <Button variant="ghost" size="sm">
                    Služby
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" size="sm">
                    Nastavení
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
      <div className="container flex-1 py-8">{children}</div>
    </div>
  )
}
