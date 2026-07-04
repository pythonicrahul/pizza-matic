import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import { CartBar } from "@/components/cart-bar";
import { CustomerTabBar } from "@/components/customer-tab-bar";
import { SHOP } from "@/lib/constants";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      {/* pb clears the fixed bottom tab bar (+ floating cart bar). */}
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28">
        <main className="py-5">{children}</main>
        <footer className="border-t border-border py-6 text-center text-xs text-muted">
          {SHOP.name} · {SHOP.area} · Delivering within {SHOP.deliveryRadiusKm} km
        </footer>
      </div>
      <CartBar />
      <CustomerTabBar />
    </CartProvider>
  );
}
