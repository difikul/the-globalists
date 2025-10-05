import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold">Kategorie</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/services/citizenship"
                  className="text-muted-foreground hover:text-primary"
                >
                  Občanství
                </Link>
              </li>
              <li>
                <Link
                  href="/services/residency"
                  className="text-muted-foreground hover:text-primary"
                >
                  Rezidence
                </Link>
              </li>
              <li>
                <Link
                  href="/services/company-incorporation"
                  className="text-muted-foreground hover:text-primary"
                >
                  Založení firmy
                </Link>
              </li>
              <li>
                <Link
                  href="/services/banking"
                  className="text-muted-foreground hover:text-primary"
                >
                  Banking
                </Link>
              </li>
              <li>
                <Link
                  href="/services/insurance"
                  className="text-muted-foreground hover:text-primary"
                >
                  Pojištění
                </Link>
              </li>
              <li>
                <Link
                  href="/services/shipping"
                  className="text-muted-foreground hover:text-primary"
                >
                  Přeprava
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Pro poskytovatele</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/provider/register"
                  className="text-muted-foreground hover:text-primary"
                >
                  Začít poskytovat
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-primary"
                >
                  Ceny
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Společnost</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  O nás
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Kontakt
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Právní</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Ochrana osobních údajů
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-primary"
                >
                  Obchodní podmínky
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} The Globalists. Všechna práva
            vyhrazena.
          </p>
        </div>
      </div>
    </footer>
  )
}
