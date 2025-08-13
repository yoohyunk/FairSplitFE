import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Item {
  id: string;
  name: string;
  price_with_discount: string;
  price_without_discount: string;
  quantity: string;
  category?: string;
  total_price_with_discount?: string;
  total_price_without_discount?: string;
  unit_price?: string;
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

interface ItemAssignment {
  itemId: string;
  assignedPeople: string[];
}

export default function AssignItemsScreen() {
  const router = useRouter();
  const { receiptData, people } = useLocalSearchParams<{
    receiptData: string;
    people: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [itemAssignments, setItemAssignments] = useState<ItemAssignment[]>([]);

  const parsedReceiptData: ReceiptData = useMemo(() => {
    return receiptData ? JSON.parse(receiptData) : null;
  }, [receiptData]);

  const peopleList: string[] = useMemo(() => {
    return people ? JSON.parse(people) : [];
  }, [people]);

  // Initialize assignments when data is available
  useEffect(() => {
    if (parsedReceiptData?.items && itemAssignments.length === 0) {
      console.log("Initializing assignments...");

      // Filter out discount items
      const actualItems = parsedReceiptData.items.filter((item) => {
        const isDiscount =
          item.category === "Discount" ||
          item.name.toLowerCase().includes("discount");
        const hasValidPrice =
          parseFloat(item.total_price_with_discount || item.unit_price || "0") >
          0;

        console.log(
          `Item ${item.id}: isDiscount=${isDiscount}, hasValidPrice=${hasValidPrice}`
        );

        return !isDiscount && hasValidPrice;
      });

      console.log("Actual items:", actualItems);

      const initialAssignments = actualItems.map((item) => ({
        itemId: item.id.toString(),
        assignedPeople: [],
      }));

      console.log("Setting initial assignments:", initialAssignments);
      setItemAssignments(initialAssignments);
    }
  }, [parsedReceiptData, itemAssignments.length]);

  console.log("People list:", peopleList);
  console.log("Current assignments:", itemAssignments);

  const handleTogglePerson = (itemId: string, personEmail: string) => {
    console.log("Toggling person:", personEmail, "for item:", itemId);

    setItemAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.itemId === itemId) {
          const isAssigned = assignment.assignedPeople.includes(personEmail);
          const newAssignedPeople = isAssigned
            ? assignment.assignedPeople.filter((p) => p !== personEmail)
            : [...assignment.assignedPeople, personEmail];

          console.log("New assigned people:", newAssignedPeople);

          return {
            ...assignment,
            assignedPeople: newAssignedPeople,
          };
        }
        return assignment;
      })
    );
  };

  const handleSelectAllForItem = (itemId: string) => {
    setItemAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.itemId === itemId) {
          return {
            ...assignment,
            assignedPeople: [...peopleList],
          };
        }
        return assignment;
      })
    );
  };

  const handleClearAllForItem = (itemId: string) => {
    setItemAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.itemId === itemId) {
          return {
            ...assignment,
            assignedPeople: [],
          };
        }
        return assignment;
      })
    );
  };

  const getAssignedPeopleForItem = (itemId: string) => {
    const assignment = itemAssignments.find((a) => a.itemId === itemId);
    return assignment?.assignedPeople || [];
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      router.push({
        pathname: "/split-preview" as any,
        params: {
          receiptData: receiptData,
          people: people,
          assignments: JSON.stringify(itemAssignments),
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to complete assignment");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const hasDiscount = (item: Item) => {
    const originalPrice = parseFloat(item.price_without_discount);
    const discountedPrice = parseFloat(item.price_with_discount);
    return originalPrice > discountedPrice;
  };

  if (!parsedReceiptData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Assign Items to People</Text>
        <Text style={styles.subtitle}>Select who will pay for each item</Text>

        {parsedReceiptData.items
          .filter(
            (item) =>
              item.category !== "Discount" &&
              !item.name.toLowerCase().includes("discount")
          )
          .map((item) => {
            const itemHasDiscount = hasDiscount(item);
            return (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.priceContainer}>
                      {itemHasDiscount ? (
                        <>
                          <Text style={styles.originalPrice}>
                            {formatPrice(item.price_without_discount)} x{" "}
                            {item.quantity}
                          </Text>
                          <Text style={styles.discountedPrice}>
                            {formatPrice(item.price_with_discount)} x{" "}
                            {item.quantity}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.itemPrice}>
                          {formatPrice(item.price_with_discount)} x{" "}
                          {item.quantity}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSelectAllForItem(item.id.toString())}
                    >
                      <Text style={styles.actionButtonText}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleClearAllForItem(item.id.toString())}
                    >
                      <Text style={styles.actionButtonText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.peopleList}>
                  {peopleList.map((person) => {
                    const isAssigned = getAssignedPeopleForItem(
                      item.id.toString()
                    ).includes(person);
                    return (
                      <TouchableOpacity
                        key={person}
                        style={[
                          styles.personItem,
                          isAssigned && styles.personItemSelected,
                        ]}
                        onPress={() =>
                          handleTogglePerson(item.id.toString(), person)
                        }
                      >
                        <Text
                          style={[
                            styles.personEmail,
                            isAssigned && styles.personEmailSelected,
                          ]}
                        >
                          {person}
                        </Text>
                        {isAssigned && (
                          <View style={styles.checkmark}>
                            <Text style={styles.checkmarkText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={() => router.back()}
            variant="outline"
            size="large"
            fullWidth
          />
          <View style={{ height: 12 }} />
          <Button
            title="Complete Assignment"
            onPress={handleComplete}
            loading={isLoading}
            size="large"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  itemContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: colors.card,
    fontSize: 12,
    fontWeight: "600",
  },
  peopleList: {
    gap: 8,
  },
  personItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  personEmail: {
    fontSize: 14,
    color: colors.text,
  },
  personEmailSelected: {
    color: colors.card,
    fontWeight: "600",
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "bold",
  },
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  priceContainer: {
    flexDirection: "row",
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  discountedPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
});
