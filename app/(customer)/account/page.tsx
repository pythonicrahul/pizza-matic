import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/session";
import { getCustomerAddresses } from "@/lib/data/addresses";
import { AccountPanel } from "@/components/customer-account";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/login?next=/account");
  const addresses = await getCustomerAddresses(session.customerId);
  return <AccountPanel name={session.name} phone={session.phone} initialAddresses={addresses} />;
}
