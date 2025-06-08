import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { colors } from "@/constants/Colors";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useProfileStore } from "@/hooks/useProfileStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  CreditCard,
  DollarSign,
  Edit,
  LogOut,
  Phone,
  Receipt,
  Settings,
  User,
  Users,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { signOut } = useAuthStore();
  const { profile, fetchProfile, isLoading, error } = useProfileStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const loadProfile = async () => {
      console.log("Starting profile fetch...");
      try {
        await fetchProfile();
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [fetchProfile]);

  const handleSignIn = () => {
    router.push("/(auth)/login");
  };

  const handleEditProfile = () => {
    router.push("/profile-setup" as any);
  };

  const handlePaymentMethods = () => {
    router.push("/payment-methods" as any);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const renderProfileOption = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.profileOption} onPress={onPress}>
      <View style={styles.profileOptionIcon}>{icon}</View>
      <View style={styles.profileOptionContent}>
        <Text style={styles.profileOptionTitle}>{title}</Text>
      </View>
      <ChevronRight size={20} color={colors.textLight} />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading profile: {error}</Text>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={fetchProfile}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No profile found</Text>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={() => router.push("/(auth)/profile-setup")}
        >
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.signInContainer}>
        <View style={styles.emptyAvatar}>
          <User size={60} color={colors.textLight} />
        </View>
        <Text style={styles.signInTitle}>Sign in to your account</Text>
        <Text style={styles.signInSubtitle}>
          Create a profile to sync your receipts across devices and easily split
          bills with friends
        </Text>
        <Button
          title="Sign In"
          onPress={handleSignIn}
          icon={<Phone size={18} color={colors.card} />}
          size="large"
          containerStyle={styles.signInButton}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Avatar size={100} />
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => router.push("/(auth)/edit-avatar" as any)}
          >
            <Edit size={16} color={colors.card} />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{profile?.username || "User"}</Text>
        <Text style={styles.phoneNumber}>{user?.email}</Text>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => router.push("/(auth)/profile-setup" as any)}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        {renderProfileOption(
          <User size={20} color={colors.primary} />,
          "Personal Information",
          handleEditProfile
        )}

        {renderProfileOption(
          <CreditCard size={20} color={colors.primary} />,
          "Payment Methods",
          handlePaymentMethods
        )}

        {renderProfileOption(
          <Settings size={20} color={colors.primary} />,
          "Settings",
          () => router.push("/settings" as any)
        )}

        {renderProfileOption(
          <LogOut size={20} color={colors.error} />,
          "Sign Out",
          handleSignOut
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity</Text>

        {renderProfileOption(
          <Receipt size={20} color={colors.primary} />,
          "My Receipts",
          () => router.push("/history")
        )}

        {renderProfileOption(
          <Users size={20} color={colors.primary} />,
          "My Groups",
          () => router.push("/(tabs)/groups")
        )}

        {renderProfileOption(
          <DollarSign size={20} color={colors.primary} />,
          "Payment History",
          () => {}
        )}
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Receipts</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>8</Text>
          <Text style={styles.statLabel}>Splits</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push("/(tabs)/profile/edit" as any)}
        >
          <Text style={styles.optionText}>Edit Profile</Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.card,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary + "20",
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  profileOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  profileOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  profileOptionContent: {
    flex: 1,
  },
  profileOptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  signInContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  emptyAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  signInSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  signInButton: {
    minWidth: 200,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.card,
  },
  retryButton: {
    minWidth: 200,
  },
});
