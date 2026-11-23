import { NativeTabs } from "expo-router/native-tabs";

/**
 * Bottom navigation following the MySariStore prototype:
 * Home · Products · Sales · Utang · More
 * White bar, purple active icon + label, muted gray for inactive tabs.
 */

const BRAND_PURPLE = "#4B1FA8";
const BRAND_LAVENDER = "#F1ECFA";
const MUTED = "#8B849A";

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      tintColor={BRAND_PURPLE}
      iconColor={{ default: MUTED, selected: BRAND_PURPLE }}
      indicatorColor={BRAND_LAVENDER}
      rippleColor={BRAND_LAVENDER}
      labelStyle={{
        default: { color: MUTED, fontSize: 11, fontWeight: "600" },
        selected: { color: BRAND_PURPLE, fontSize: 11, fontWeight: "700" },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="products">
        <NativeTabs.Trigger.Label>Products</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "shippingbox", selected: "shippingbox.fill" }}
          md="inventory_2"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sales">
        <NativeTabs.Trigger.Label>Sales</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "cart", selected: "cart.fill" }}
          md="shopping_cart"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="utang">
        <NativeTabs.Trigger.Label>Utang</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.2", selected: "person.2.fill" }}
          md="handshake"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="more">
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "line.3.horizontal", selected: "line.3.horizontal" }}
          md="menu"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
