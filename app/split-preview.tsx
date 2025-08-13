import { supabase } from "@/app/supabaseClient";
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

interface PersonCost {
  email: string;
  totalCost: number;
  items: {
    itemId: string;
    itemName: string;
    cost: number;
  }[];
}

export default function SplitPreviewScreen() {
  const router = useRouter();
  const { receiptData, people, assignments } = useLocalSearchParams<{
    receiptData: string;
    people: string;
    assignments: string;
  }>();

  const [hasAgreed, setHasAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");

  const parsedReceiptData: ReceiptData = useMemo(() => {
    return receiptData ? JSON.parse(receiptData) : null;
  }, [receiptData]);

  const peopleList: string[] = useMemo(() => {
    return people ? JSON.parse(people) : [];
  }, [people]);

  const itemAssignments: ItemAssignment[] = useMemo(() => {
    return assignments ? JSON.parse(assignments) : [];
  }, [assignments]);

  // Get current user's email on component mount
  useEffect(() => {
    const getCurrentUserEmail = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setCurrentUserEmail(user.email);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };

    getCurrentUserEmail();
  }, []);

  // Calculate costs for each person
  const personCosts: PersonCost[] = useMemo(() => {
    if (!parsedReceiptData || !itemAssignments.length) return [];

    const costs: { [email: string]: PersonCost } = {};

    // Initialize costs for each person
    peopleList.forEach((email) => {
      costs[email] = {
        email,
        totalCost: 0,
        items: [],
      };
    });

    // Filter out discount items and calculate base costs
    const actualItems = parsedReceiptData.items.filter(
      (item) =>
        item.category !== "Discount" &&
        !item.name.toLowerCase().includes("discount") &&
        parseFloat(item.total_price_with_discount || item.unit_price || "0") > 0
    );

    // Calculate base costs based on assignments
    actualItems.forEach((item) => {
      const assignment = itemAssignments.find((a) => a.itemId === item.id);
      if (assignment && assignment.assignedPeople.length > 0) {
        const itemCost = parseFloat(
          item.total_price_with_discount || item.unit_price || "0"
        );
        const costPerPerson = itemCost / assignment.assignedPeople.length;

        assignment.assignedPeople.forEach((email) => {
          if (costs[email]) {
            costs[email].totalCost += costPerPerson;
            costs[email].items.push({
              itemId: item.id,
              itemName: item.name,
              cost: costPerPerson,
            });
          }
        });
      }
    });

    // Distribute total discount proportionally
    const totalDiscount = parseFloat(parsedReceiptData.total_discount || "0");
    if (totalDiscount > 0) {
      const totalAssignedCost = Object.values(costs).reduce(
        (sum, person) => sum + person.totalCost,
        0
      );

      if (totalAssignedCost > 0) {
        Object.values(costs).forEach((person) => {
          const discountShare =
            (person.totalCost / totalAssignedCost) * totalDiscount;
          person.totalCost -= discountShare;

          // Add discount as a separate item entry
          person.items.push({
            itemId: "discount",
            itemName: "Discount",
            cost: -discountShare,
          });
        });
      }
    }

    return Object.values(costs);
  }, [parsedReceiptData, itemAssignments, peopleList]);

  const handleAgree = () => {
    setHasAgreed(!hasAgreed);
  };

  const handleFinalize = async () => {
    if (!hasAgreed) {
      Alert.alert(
        "Agreement Required",
        "You must agree to the split before finalizing."
      );
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Send final split data to backend
      console.log("Finalizing split with agreement from:", currentUserEmail);
      console.log("Person costs:", personCosts);
      router.push("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to finalize split");
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = () => {
    // Navigate back to assign items page
    router.back();
  };

  const formatPrice = (price: number) => {
    const sign = price < 0 ? "-" : "";
    const absPrice = Math.abs(price);
    return `${sign}$${absPrice.toFixed(2)}`;
  };

  const isCurrentUser = (email: string) => email === currentUserEmail;

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
        <Text style={styles.title}>Split Preview</Text>
        <Text style={styles.subtitle}>
          Review the split and agree to finalize
        </Text>

        {/* Receipt Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Receipt Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(parseFloat(parsedReceiptData.total))}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Number of People:</Text>
            <Text style={styles.summaryValue}>{peopleList.length}</Text>
          </View>
        </View>

        {/* Individual Costs */}
        <View style={styles.costsContainer}>
          <Text style={styles.sectionTitle}>Individual Costs</Text>
          {personCosts.map((personCost) => (
            <View
              key={personCost.email}
              style={[
                styles.personCostCard,
                isCurrentUser(personCost.email) && styles.currentUserCard,
              ]}
            >
              <View style={styles.personHeader}>
                <View style={styles.personInfo}>
                  <Text
                    style={[
                      styles.personEmail,
                      isCurrentUser(personCost.email) &&
                        styles.currentUserEmail,
                    ]}
                  >
                    {personCost.email}
                  </Text>
                  <Text
                    style={[
                      styles.personTotal,
                      isCurrentUser(personCost.email) &&
                        styles.currentUserTotal,
                    ]}
                  >
                    Total: {formatPrice(personCost.totalCost)}
                  </Text>
                  {isCurrentUser(personCost.email) && (
                    <Text style={styles.currentUserLabel}>You</Text>
                  )}
                </View>
                {isCurrentUser(personCost.email) ? (
                  <TouchableOpacity
                    style={[
                      styles.agreeButton,
                      hasAgreed && styles.agreedButton,
                    ]}
                    onPress={handleAgree}
                  >
                    <Text
                      style={[
                        styles.agreeButtonText,
                        hasAgreed && styles.agreedButtonText,
                      ]}
                    >
                      {hasAgreed ? "Agreed ✓" : "Agree"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.otherUserStatus}>
                    <Text style={styles.otherUserStatusText}>Pending</Text>
                  </View>
                )}
              </View>

              {/* Item breakdown */}
              <View style={styles.itemsBreakdown}>
                {personCost.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <Text
                      style={[
                        styles.itemCost,
                        item.cost < 0 && styles.discountCost,
                      ]}
                    >
                      {formatPrice(item.cost)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Agreement Status */}
        <View style={styles.agreementContainer}>
          <Text style={styles.agreementText}>
            {hasAgreed
              ? "You have agreed to the split"
              : "Please review and agree to the split"}
          </Text>
          {hasAgreed && (
            <Text style={styles.allAgreedText}>
              You can now finalize the split!
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Modify Assignments"
            onPress={handleModify}
            variant="outline"
            size="large"
            fullWidth
          />
          <View style={{ height: 12 }} />
          <Button
            title="Finalize Split"
            onPress={handleFinalize}
            loading={isLoading}
            disabled={!hasAgreed}
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
  summaryContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  costsContainer: {
    marginBottom: 24,
  },
  personCostCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  personHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  personInfo: {
    flex: 1,
  },
  personEmail: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  currentUserEmail: {
    color: colors.primary,
  },
  personTotal: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  currentUserTotal: {
    color: colors.primary,
  },
  currentUserLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  agreeButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  agreedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreeButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  agreedButtonText: {
    color: colors.card,
  },
  itemsBreakdown: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  itemCost: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  discountCost: {
    color: colors.success,
  },
  agreementContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  agreementText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  allAgreedText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  buttonContainer: {
    gap: 12,
  },
  otherUserStatus: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  otherUserStatusText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
