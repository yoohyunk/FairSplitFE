import { colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "./Button";

interface Item {
  id: string;
  name: string;
  price_with_discount: string;
  price_without_discount: string;
  quantity: string;
}

interface ReceiptData {
  items: Item[];
  subtotal: string;
  tax: string;
  tip: string;
  total: string;
  currency: string;
  image: string;
  receiptType: string;
  total_discount: string;
}

interface ReceiptReviewProps {
  initialData: ReceiptData;
  onConfirm: (data: ReceiptData) => void;
  onCancel: () => void;
}

const ReceiptReview: React.FC<ReceiptReviewProps> = ({
  initialData,
  onConfirm,
  onCancel,
}) => {
  const [data, setData] = useState<ReceiptData>(initialData);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<Item>>({});

  const handleItemEdit = (itemId: string) => {
    setEditingItem(itemId);
  };

  const handleItemSave = (itemId: string) => {
    setEditingItem(null);
    // Recalculate totals
    const updatedItems = data.items.map((item) =>
      item.id === itemId ? { ...item } : item
    );
    const subtotal = updatedItems.reduce(
      (sum, item) =>
        sum +
        parseFloat(item.price_with_discount || "0") *
          parseFloat(item.quantity || "1"),
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax + parseFloat(data.tip || "0");

    setData({
      ...data,
      items: updatedItems,
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
    });
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price_with_discount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const item: Item = {
      id: Date.now().toString(),
      name: newItem.name,
      price_with_discount: newItem.price_with_discount,
      price_without_discount: newItem.price_with_discount,
      quantity: newItem.quantity || "1",
    };

    const updatedItems = [...data.items, item];
    const subtotal = updatedItems.reduce(
      (sum, item) =>
        sum +
        parseFloat(item.price_with_discount || "0") *
          parseFloat(item.quantity || "1"),
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax + parseFloat(data.tip || "0");

    setData({
      ...data,
      items: updatedItems,
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
    });

    setNewItem({});
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = data.items.filter((item) => item.id !== itemId);
    const subtotal = updatedItems.reduce(
      (sum, item) =>
        sum +
        parseFloat(item.price_with_discount || "0") *
          parseFloat(item.quantity || "1"),
      0
    );
    const tax = subtotal * 0.1;
    const total = subtotal + tax + parseFloat(data.tip || "0");

    setData({
      ...data,
      items: updatedItems,
      subtotal: subtotal.toString(),
      tax: tax.toString(),
      total: total.toString(),
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Review Receipt</Text>

      {/* Items List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {data.items.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            {editingItem === item.id ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  onChangeText={(text) =>
                    setData({
                      ...data,
                      items: data.items.map((i) =>
                        i.id === item.id ? { ...i, name: text } : i
                      ),
                    })
                  }
                  placeholder="Item name"
                />
                <TextInput
                  style={styles.input}
                  value={item.price_with_discount}
                  onChangeText={(text) =>
                    setData({
                      ...data,
                      items: data.items.map((i) =>
                        i.id === item.id
                          ? { ...i, price_with_discount: text || "0" }
                          : i
                      ),
                    })
                  }
                  keyboardType="numeric"
                  placeholder="Price"
                />
                <TextInput
                  style={styles.input}
                  value={item.quantity}
                  onChangeText={(text) =>
                    setData({
                      ...data,
                      items: data.items.map((i) =>
                        i.id === item.id ? { ...i, quantity: text || "1" } : i
                      ),
                    })
                  }
                  keyboardType="numeric"
                  placeholder="Quantity"
                />
                <Button
                  title="Save"
                  onPress={() => handleItemSave(item.id)}
                  size="small"
                />
              </View>
            ) : (
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {data.currency}{" "}
                    {parseFloat(item.price_with_discount || "0").toFixed(2)} x{" "}
                    {item.quantity}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={styles.itemTotal}>
                    {data.currency}{" "}
                    {(
                      parseFloat(item.price_with_discount || "0") *
                      parseFloat(item.quantity || "1")
                    ).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleItemEdit(item.id)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Add New Item Form */}
        <View style={styles.addItemContainer}>
          <Text style={styles.sectionTitle}>Add New Item</Text>
          <TextInput
            style={styles.input}
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            placeholder="Item name"
          />
          <TextInput
            style={styles.input}
            value={newItem.price_with_discount}
            onChangeText={(text) =>
              setNewItem({ ...newItem, price_with_discount: text || "0" })
            }
            keyboardType="numeric"
            placeholder="Price"
          />
          <TextInput
            style={styles.input}
            value={newItem.quantity?.toString()}
            onChangeText={(text) =>
              setNewItem({ ...newItem, quantity: text || "1" })
            }
            keyboardType="numeric"
            placeholder="Quantity"
          />
          <Button title="Add Item" onPress={handleAddItem} size="small" />
        </View>
      </View>

      {/* Totals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Totals</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>
            {data.currency} {parseFloat(data.subtotal || "0").toFixed(2)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax (10%):</Text>
          <Text style={styles.totalValue}>
            {data.currency} {parseFloat(data.tax || "0").toFixed(2)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tip:</Text>
          <TextInput
            style={styles.tipInput}
            value={data.tip.toString()}
            onChangeText={(text) => {
              const tip = Number(text) || 0;
              setData({
                ...data,
                tip: tip.toString(),
                total: (
                  parseFloat(data.subtotal || "0") +
                  parseFloat(data.tax || "0") +
                  tip
                ).toString(),
              });
            }}
            keyboardType="numeric"
            placeholder="Enter tip amount"
          />
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>
            {data.currency} {parseFloat(data.total || "0").toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="secondary"
          size="large"
        />
        <Button title="Confirm" onPress={() => onConfirm(data)} size="large" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginRight: 12,
  },
  editButton: {
    marginRight: 8,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  deleteButton: {
    marginLeft: 8,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 14,
  },
  editForm: {
    gap: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  addItemContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    color: colors.text,
  },
  tipInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    width: 120,
    fontSize: 16,
    color: colors.text,
    textAlign: "right",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 12,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
});

export default ReceiptReview;
