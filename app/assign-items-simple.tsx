import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useSplitStore } from "@/hooks/useSplitStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

  const [itemAssignments, setItemAssignments] = useState<ItemAssignment[]>([]);
  const { currentSplit, assignItems } = useSplitStore();

  // 데이터 파싱
  const parsedReceiptData: ReceiptData = receiptData
    ? JSON.parse(receiptData)
    : null;
  const peopleList: string[] = people ? JSON.parse(people) : [];

  console.log("=== SIMPLE VERSION ===");
  console.log("Receipt items:", parsedReceiptData?.items?.length);
  console.log("People:", peopleList);
  console.log("Current assignments:", itemAssignments.length);

  // 간단한 토글 함수
  const togglePerson = (itemId: string, personEmail: string) => {
    console.log("🎯 togglePerson called!", itemId, personEmail);

    // 첫 클릭 시 초기화
    if (itemAssignments.length === 0) {
      console.log("First click - creating assignments");
      const actualItems = parsedReceiptData.items.filter(
        (item) =>
          item.category !== "Discount" &&
          !item.name.toLowerCase().includes("discount") &&
          parseFloat(item.total_price_with_discount || item.unit_price || "0") >
            0
      );

      const newAssignments = actualItems.map((item) => ({
        itemId: item.id.toString(),
        assignedPeople: item.id.toString() === itemId ? [personEmail] : [],
      }));

      setItemAssignments(newAssignments);
      return;
    }

    // 기존 토글
    setItemAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.itemId === itemId) {
          const isAssigned = assignment.assignedPeople.includes(personEmail);
          return {
            ...assignment,
            assignedPeople: isAssigned
              ? assignment.assignedPeople.filter((p) => p !== personEmail)
              : [...assignment.assignedPeople, personEmail],
          };
        }
        return assignment;
      })
    );
  };

  // 할당된 사람들 가져오기
  const getAssignedPeople = (itemId: string) => {
    const assignment = itemAssignments.find((a) => a.itemId === itemId);
    return assignment?.assignedPeople || [];
  };

  if (!parsedReceiptData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const actualItems = parsedReceiptData.items.filter(
    (item) =>
      item.category !== "Discount" &&
      !item.name.toLowerCase().includes("discount")
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Assign Items (Simple)</Text>

        {/* 아이템 목록 */}
        {actualItems.map((item) => {
          const itemId = item.id.toString();
          const assignedPeople = getAssignedPeople(itemId);

          return (
            <View key={itemId} style={styles.itemCard}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price_with_discount}</Text>

              {/* 사람 버튼들 */}
              {peopleList.map((person) => {
                const isAssigned = assignedPeople.includes(person);

                return (
                  <TouchableOpacity
                    key={person}
                    style={[
                      styles.personButton,
                      isAssigned && styles.personButtonSelected,
                    ]}
                    onPress={() => {
                      console.log("👆 Person button clicked:", itemId, person);
                      togglePerson(itemId, person);
                    }}
                  >
                    <Text
                      style={[
                        styles.personText,
                        isAssigned && styles.personTextSelected,
                      ]}
                    >
                      {person} {isAssigned ? "✓" : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* 완료 버튼 */}
        <Button
          title="Complete Assignment"
          onPress={() => {
            console.log("Complete button pressed");
            router.back();
          }}
          size="large"
          fullWidth
        />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: "red",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  testButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  itemCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  personButton: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  personText: {
    fontSize: 14,
    color: colors.text,
  },
  personTextSelected: {
    color: colors.card,
    fontWeight: "600",
  },
});
