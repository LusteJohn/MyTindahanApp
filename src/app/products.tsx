import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type {
  InventoryMovement,
  MovementType,
} from "@backend/models/InventoryMovement";
import type { Product } from "@backend/models/Product";
import type { ProductWithDetails } from "@backend/models/relationships";
import { routes } from "@backend/routes";

/**
 * Products & Inventory management screen.
 *
 * Lets the store owner:
 *  - browse products with their current stock level
 *  - add / edit / delete products
 *  - record stock movements (IN / OUT / ADJUSTMENT) which also update
 *    the product's inventory atomically
 *  - view the movement history for a product
 *
 * UI follows the MySariStore mockup: dark purple header, rounded search bar,
 * pill filters, divider-separated product rows and a floating "+" button.
 */

type Tab = "products" | "movements";

const BRAND_PURPLE = "#4B1FA8";
const BRAND_DARK = "#24145F";
const BRAND_LAVENDER = "#F1ECFA";
const SURFACE = "#FFFFFF";
const INK = "#1E1637";
const MUTED = "#7B7590";
const LINE = "#EEE9F5";
const GREEN = "#16834A";
const GREEN_BG = "#E7F6EE";
const RED = "#C62828";
const RED_BG = "#FDECEC";
const SHEET_RADIUS = 28;

export default function ProductsScreen() {
  const [tab, setTab] = useState<Tab>("products");
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Product form modal state
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  // Movement modal state
  const [movementVisible, setMovementVisible] = useState(false);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await routes.products.list();
      if (result.ok) {
        setProducts(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  function openAddForm() {
    setEditing(null);
    setFormVisible(true);
  }

  function openEditForm(product: Product) {
    setEditing(product);
    setFormVisible(true);
  }

  function openMovement(product: Product) {
    setMovementProduct(product);
    setMovementVisible(true);
  }

  function handleDeleteFromForm(product: Product) {
    setFormVisible(false);
    handleDelete(product);
  }

  async function handleDelete(product: Product) {
    Alert.alert(
      "Delete product",
      `Delete "${product.product_name}"? This also removes its inventory and movement history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await routes.products.remove(product.id);
            if (!result.ok) {
              Alert.alert("Error", result.error);
            } else {
              load();
            }
          },
        },
      ],
    );
  }
  return (
    <View style={styles.container}>
      {/* Dark purple app bar (extends under the status bar) */}
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Products
          </ThemedText>
          <View style={[styles.headerSide, { alignItems: "flex-end" }]}>
            <View style={styles.countBadge}>
              <ThemedText type="smallBold" style={styles.countBadgeText}>
                {products.length}
              </ThemedText>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <View style={styles.body}>
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search product..."
              placeholderTextColor="#8B849A"
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.pillRow}>
          <PillButton
            label="Products"
            active={tab === "products"}
            onPress={() => setTab("products")}
          />
          <PillButton
            label="Stock Movements"
            active={tab === "movements"}
            onPress={() => setTab("movements")}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={BRAND_PURPLE} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <ThemedText type="small" style={styles.errorText}>
              {error}
            </ThemedText>
            <Pressable onPress={load} style={styles.retryButton}>
              <ThemedText type="linkPrimary">Retry</ThemedText>
            </Pressable>
          </View>
        ) : tab === "products" ? (
          <ProductsList
            products={products.filter((product) =>
              product.product_name
                .toLowerCase()
                .includes(search.trim().toLowerCase()),
            )}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            refreshing={refreshing}
            onEdit={openEditForm}
            onDelete={handleDelete}
            onMovement={openMovement}
          />
        ) : (
          <MovementsList
            products={products}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            refreshing={refreshing}
          />
        )}

        {/* Floating add button */}
        {tab === "products" ? (
          <Pressable
            onPress={openAddForm}
            accessibilityLabel="Add product"
            style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
          >
            <ThemedText style={styles.fabText}>+</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <ProductFormModal
        visible={formVisible}
        product={editing}
        onClose={() => setFormVisible(false)}
        onDelete={handleDeleteFromForm}
        onSaved={() => {
          setFormVisible(false);
          load();
        }}
      />

      <MovementModal
        visible={movementVisible}
        product={movementProduct}
        onClose={() => setMovementVisible(false)}
        onRecorded={() => {
          setMovementVisible(false);
          load();
        }}
      />
    </View>
  );
}

function PillButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <ThemedText
        type="smallBold"
        style={{ color: active ? "#FFFFFF" : MUTED, fontSize: 13 }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function ProductsList({
  products,
  onRefresh,
  refreshing,
  onEdit,
  onDelete,
  onMovement,
}: {
  products: Product[];
  onRefresh: () => void;
  refreshing: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onMovement: (p: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <ThemedText type="small" style={{ color: MUTED }}>
          No products yet. Tap the + button to add one.
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ItemSeparatorComponent={() => <View style={styles.divider} />}
      renderItem={({ item }) => (
        <ProductRow
          product={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
          onMovement={() => onMovement(item)}
        />
      )}
      ListFooterComponent={<View style={{ height: BottomTabInset + 90 }} />}
    />
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  onMovement,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onMovement: () => void;
}) {
  const [details, setDetails] = useState<ProductWithDetails | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      routes.products.getDetails(product.id).then((res) => {
        if (active && res.ok) setDetails(res.data);
      });
      return () => {
        active = false;
      };
    }, [product.id]),
  );

  const qty = details?.inventory?.quantity ?? 0;
  const reorder = details?.inventory?.reorder_level ?? 0;
  const lowOrOut = details ? !details.in_stock || details.low_stock : false;

  return (
    <Pressable
      onPress={onEdit}
      onLongPress={onDelete}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.productAvatar}>
        <ThemedText type="subtitle" style={styles.productAvatarText}>
          {product.product_name.charAt(0).toUpperCase()}
        </ThemedText>
      </View>

      <View style={styles.rowMiddle}>
        <ThemedText
          type="smallBold"
          style={styles.productName}
          numberOfLines={1}
        >
          {product.product_name}
        </ThemedText>
        <ThemedText
          type="small"
          style={{ color: lowOrOut ? RED : GREEN, fontWeight: "600" }}
        >
          {details ? `Stock: ${qty}` : "Checking…"}
          <ThemedText type="small" style={{ color: MUTED }}>
            {"  ·  "}
            {product.unit}
          </ThemedText>
        </ThemedText>
        {lowOrOut ? (
          <ThemedText type="small" style={{ color: RED, fontSize: 11 }}>
            {qty <= 0 ? "Out of stock" : `Low stock (reorder at ${reorder})`}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.rowRight}>
        <View style={styles.priceRow}>
          <ThemedText type="smallBold" style={styles.productPrice}>
            ₱{product.selling_price.toFixed(0)}
          </ThemedText>
          <ThemedText style={styles.chevron}>›</ThemedText>
        </View>
        <Pressable
          onPress={onMovement}
          hitSlop={6}
          style={({ pressed }) => [styles.stockPill, pressed && styles.pressed]}
        >
          <ThemedText type="smallBold" style={styles.stockPillText}>
            Update stock
          </ThemedText>
        </Pressable>
      </View>
    </Pressable>
  );
}

function MovementsList({
  products,
  onRefresh,
  refreshing,
}: {
  products: Product[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMovements = useCallback(async (productId: number) => {
    setLoading(true);
    const res = await routes.inventoryMovements.listByProduct(productId);
    if (res.ok) setMovements(res.data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (selected != null) loadMovements(selected);
    }, [selected, loadMovements]),
  );

  return (
    <View style={styles.flex}>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {products.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                setSelected(p.id);
                loadMovements(p.id);
              }}
              style={[styles.chip, selected === p.id && styles.chipActive]}
            >
              <ThemedText
                type="small"
                style={{
                  color: selected === p.id ? "#FFFFFF" : MUTED,
                  fontWeight: "600",
                }}
              >
                {p.product_name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {selected == null ? (
        <View style={styles.center}>
          <ThemedText type="small" style={{ color: MUTED }}>
            Select a product to see its stock movements.
          </ThemedText>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BRAND_PURPLE} />
        </View>
      ) : movements.length === 0 ? (
        <View style={styles.center}>
          <ThemedText type="small" style={{ color: MUTED }}>
            No movements recorded for this product.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={movements}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            onRefresh();
            loadMovements(selected);
          }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => <MovementRow movement={item} />}
          ListFooterComponent={<View style={{ height: BottomTabInset }} />}
        />
      )}
    </View>
  );
}

function MovementRow({ movement }: { movement: InventoryMovement }) {
  const isIn = movement.movement_type === "IN";
  const isOut = movement.movement_type === "OUT";
  const typeColor = isIn ? GREEN : isOut ? RED : "#8A6D00";
  const typeBg = isIn ? GREEN_BG : isOut ? RED_BG : "#FFF6DB";
  const sign = isIn ? "+" : isOut ? "-" : "=";

  return (
    <View style={styles.row}>
      <View style={[styles.movementIcon, { backgroundColor: typeBg }]}>
        <ThemedText type="smallBold" style={{ color: typeColor, fontSize: 18 }}>
          {sign}
        </ThemedText>
      </View>
      <View style={styles.rowMiddle}>
        <ThemedText type="smallBold" style={{ color: INK }}>
          {movement.movement_type}
        </ThemedText>
        {movement.remarks ? (
          <ThemedText type="small" style={{ color: MUTED }}>
            {movement.remarks}
          </ThemedText>
        ) : null}
        {movement.reference_type ? (
          <ThemedText type="small" style={{ color: MUTED, fontSize: 11 }}>
            Ref: {movement.reference_type}
            {movement.reference_id ? ` #${movement.reference_id}` : ""}
          </ThemedText>
        ) : null}
        <ThemedText type="code" style={{ color: MUTED, fontSize: 11 }}>
          {movement.created_at}
        </ThemedText>
      </View>
      <ThemedText
        type="smallBold"
        style={[styles.productPrice, { color: typeColor }]}
      >
        {sign}
        {movement.quantity}
      </ThemedText>
    </View>
  );
}

function ModalHeader({ title }: { title: string }) {
  return (
    <SafeAreaView edges={["top"]} style={styles.headerSafe}>
      <View style={styles.header}>
        <ThemedText
          type="subtitle"
          style={[styles.headerTitle, { flex: 1 }]}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

function ProductFormModal({
  visible,
  product,
  onClose,
  onSaved,
  onDelete,
}: {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
  onDelete: (p: Product) => void;
}) {
  const theme = useTheme();
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unit, setUnit] = useState("pc");
  const [reorder, setReorder] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializedFor, setInitializedFor] = useState<number | null>(null);

  // Reset form fields when the modal opens for a specific product.
  const targetId = product?.id ?? -1;
  if (visible && initializedFor !== targetId) {
    setInitializedFor(targetId);
    setName(product?.product_name ?? "");
    setBarcode(product?.barcode ?? "");
    setCostPrice(product ? String(product.cost_price) : "");
    setSellingPrice(product ? String(product.selling_price) : "");
    setUnit(product?.unit ?? "pc");
    setReorder("");
    setError(null);
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    setSaving(true);
    try {
      if (product) {
        const res = await routes.products.update(product.id, {
          product_name: name.trim(),
          barcode: barcode.trim() || null,
          cost_price: parseFloat(costPrice) || 0,
          selling_price: parseFloat(sellingPrice) || 0,
          unit: unit.trim() || "pc",
        });
        if (!res.ok) {
          setError(res.error);
          setSaving(false);
          return;
        }
        // Optionally set reorder level for existing product inventory.
        if (reorder.trim()) {
          const inv = await routes.inventory.getByProduct(product.id);
          if (inv.ok) {
            await routes.inventory.update(inv.data.id, {
              reorder_level: parseFloat(reorder) || 0,
            });
          }
        }
      } else {
        const res = await routes.products.create({
          product_name: name.trim(),
          barcode: barcode.trim() || null,
          cost_price: parseFloat(costPrice) || 0,
          selling_price: parseFloat(sellingPrice) || 0,
          unit: unit.trim() || "pc",
        });
        if (!res.ok) {
          setError(res.error);
          setSaving(false);
          return;
        }
        // Set initial reorder level on the freshly created inventory row.
        if (reorder.trim()) {
          const inv = await routes.inventory.getByProduct(res.data);
          if (inv.ok) {
            await routes.inventory.update(inv.data.id, {
              reorder_level: parseFloat(reorder) || 0,
            });
          }
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <ModalHeader title={product ? "Edit Product" : "Add Product"} />
        <SafeAreaView style={[styles.flex, styles.sheet]} edges={["bottom"]}>
          <ScrollView contentContainerStyle={styles.formContent}>
            <Field label="Product name">
              <TextInput
                style={inputStyle(theme)}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Coca-Cola 1.5L"
                placeholderTextColor={theme.textSecondary}
              />
            </Field>

            <Field label="Barcode">
              <TextInput
                style={inputStyle(theme)}
                value={barcode}
                onChangeText={setBarcode}
                placeholder="Optional"
                placeholderTextColor={theme.textSecondary}
                keyboardType="default"
              />
            </Field>

            <View style={styles.twoCol}>
              <View style={styles.flex}>
                <Field label="Cost price">
                  <TextInput
                    style={inputStyle(theme)}
                    value={costPrice}
                    onChangeText={setCostPrice}
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </Field>
              </View>
              <View style={styles.flex}>
                <Field label="Selling price">
                  <TextInput
                    style={inputStyle(theme)}
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                    placeholder="0.00"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </Field>
              </View>
            </View>

            <View style={styles.twoCol}>
              <View style={styles.flex}>
                <Field label="Unit">
                  <TextInput
                    style={inputStyle(theme)}
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="pc, bottle, pack..."
                    placeholderTextColor={theme.textSecondary}
                  />
                </Field>
              </View>
              <View style={styles.flex}>
                <Field label="Reorder level (optional)">
                  <TextInput
                    style={inputStyle(theme)}
                    value={reorder}
                    onChangeText={setReorder}
                    placeholder="e.g. 10"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="decimal-pad"
                  />
                </Field>
              </View>
            </View>

            {error ? (
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            ) : null}

            {product ? (
              <Pressable
                onPress={() => onDelete(product)}
                style={({ pressed }) => [
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold" style={{ color: RED }}>
                  Delete Product
                </ThemedText>
              </Pressable>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.footerButton,
                styles.footerButtonOutline,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold" style={{ color: BRAND_PURPLE }}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.footerButton,
                { backgroundColor: BRAND_PURPLE },
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={{ color: "#FFFFFF" }}>
                  Save
                </ThemedText>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

function MovementModal({
  visible,
  product,
  onClose,
  onRecorded,
}: {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const theme = useTheme();
  const [type, setType] = useState<MovementType>("IN");
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializedFor, setInitializedFor] = useState<number | null>(null);
  const [currentQty, setCurrentQty] = useState<number | null>(null);

  const targetId = product?.id ?? -1;
  if (visible && initializedFor !== targetId) {
    setInitializedFor(targetId);
    setType("IN");
    setQuantity("");
    setRemarks("");
    setError(null);
    routes.inventory.getByProduct(product!.id).then((res) => {
      if (res.ok) setCurrentQty(res.data.quantity);
    });
  }

  async function handleRecord() {
    setError(null);
    if (!product) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) {
      setError("Enter a valid quantity");
      return;
    }
    setSaving(true);
    try {
      const res = await routes.inventoryMovements.record({
        product_id: product.id,
        movement_type: type,
        quantity: qty,
        remarks: remarks.trim() || null,
        reference_type: "manual",
      });
      if (!res.ok) {
        setError(res.error);
        setSaving(false);
        return;
      }
      onRecorded();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  const previewQty =
    currentQty != null && !isNaN(parseFloat(quantity))
      ? type === "IN"
        ? currentQty + parseFloat(quantity)
        : type === "OUT"
          ? currentQty - parseFloat(quantity)
          : parseFloat(quantity)
      : currentQty;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView style={styles.container}>
        <ModalHeader title={`Stock: ${product?.product_name ?? ""}`} />
        <SafeAreaView style={[styles.flex, styles.sheet]} edges={["bottom"]}>
          <ScrollView contentContainerStyle={styles.formContent}>
            <View style={styles.balanceCard}>
              <ThemedText type="small" style={{ color: MUTED }}>
                Current stock
              </ThemedText>
              <ThemedText style={styles.balanceValue}>
                {currentQty ?? "…"}
              </ThemedText>
            </View>

            <Field label="Movement type">
              <View style={styles.typeRow}>
                {(["IN", "OUT", "ADJUSTMENT"] as MovementType[]).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setType(t)}
                    style={[
                      styles.typeButton,
                      type === t && {
                        backgroundColor: BRAND_PURPLE,
                        borderColor: BRAND_PURPLE,
                      },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: type === t ? "#FFFFFF" : BRAND_PURPLE }}
                    >
                      {t}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field
              label={
                type === "ADJUSTMENT" ? "New quantity (absolute)" : "Quantity"
              }
            >
              <TextInput
                style={inputStyle(theme)}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
              />
            </Field>

            {type !== "ADJUSTMENT" && previewQty != null ? (
              <ThemedText type="small" style={{ color: MUTED }}>
                New stock preview: {previewQty}
              </ThemedText>
            ) : null}

            <Field label="Remarks (optional)">
              <TextInput
                style={inputStyle(theme)}
                value={remarks}
                onChangeText={setRemarks}
                placeholder="e.g. Delivery from supplier"
                placeholderTextColor={theme.textSecondary}
              />
            </Field>

            {error ? (
              <ThemedText type="small" style={styles.errorText}>
                {error}
              </ThemedText>
            ) : null}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.footerButton,
                styles.footerButtonOutline,
                pressed && styles.pressed,
              ]}
            >
              <ThemedText type="smallBold" style={{ color: BRAND_PURPLE }}>
                Cancel
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={handleRecord}
              disabled={saving}
              style={({ pressed }) => [
                styles.footerButton,
                { backgroundColor: BRAND_PURPLE },
                pressed && styles.pressed,
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="smallBold" style={{ color: "#FFFFFF" }}>
                  Record
                </ThemedText>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>) {
  return [styles.input, { color: theme.text }];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SURFACE },
  flex: { flex: 1 },
  sheet: {
    marginTop: -22,
    backgroundColor: SURFACE,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    overflow: "hidden",
  },
  body: {
    flex: 1,
    marginTop: -22,
    backgroundColor: SURFACE,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    overflow: "hidden",
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },

  // App bar
  headerSafe: { backgroundColor: BRAND_DARK },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    backgroundColor: BRAND_DARK,
  },
  headerSide: { width: 44 },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  countBadge: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
  },
  countBadgeText: { color: "#FFFFFF", fontSize: 12 },

  // Search + pills
  searchWrap: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F0F8",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8E1F3",
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 15, marginRight: 8, opacity: 0.6 },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    color: INK,
    fontSize: 15,
  },
  pillRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F0F8",
  },
  pillActive: { backgroundColor: BRAND_PURPLE },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.two,
  },
  errorText: { color: "#c0392b", textAlign: "center" },
  retryButton: { paddingVertical: Spacing.one },

  // List rows
  listContent: { paddingHorizontal: 16 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#E2DCEE" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  rowPressed: { backgroundColor: "#F8F6FC" },
  rowMiddle: { flex: 1, gap: 3 },
  rowRight: { alignItems: "flex-end", gap: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  productAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: BRAND_LAVENDER,
    alignItems: "center",
    justifyContent: "center",
  },
  productAvatarText: { color: BRAND_PURPLE, fontWeight: "800" },
  productName: { color: INK, fontSize: 16 },
  productPrice: { color: INK, fontSize: 16, fontWeight: "800" },
  chevron: { color: "#A79FBA", fontSize: 24, lineHeight: 24 },
  stockPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: BRAND_LAVENDER,
  },
  stockPillText: { color: BRAND_PURPLE, fontSize: 11 },
  movementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  // FAB
  fab: {
    position: "absolute",
    right: 20,
    bottom: BottomTabInset + 16,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: BRAND_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "400",
  },

  pressed: { opacity: 0.6 },

  // Movement product chips
  chips: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F0F8",
  },
  chipActive: { backgroundColor: BRAND_PURPLE },

  // Modals
  formContent: { padding: 20, gap: 12 },
  twoCol: { flexDirection: "row", gap: 12 },
  field: { gap: 6 },
  fieldLabel: { color: INK, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#E4DCEE",
    backgroundColor: "#FBFAFE",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  typeRow: { flexDirection: "row", gap: 10 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8CCF0",
    backgroundColor: BRAND_LAVENDER,
    alignItems: "center",
  },
  balanceCard: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: BRAND_LAVENDER,
  },
  balanceValue: {
    color: BRAND_PURPLE,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "800",
  },
  deleteButton: {
    marginTop: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3B8B8",
    backgroundColor: "#FFF5F5",
    alignItems: "center",
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonOutline: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: "#D8CCF0",
  },
});
