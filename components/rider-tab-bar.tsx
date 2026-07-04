import { TabBar, TabLink, ScooterIcon, UserIcon } from "./tab-bar";

export function RiderTabBar() {
  return (
    <TabBar>
      <TabLink href="/rider" label="Deliveries" icon={ScooterIcon} exact />
      <TabLink href="/rider/account" label="Account" icon={UserIcon} />
    </TabBar>
  );
}
