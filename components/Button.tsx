import { colors } from "@/constants/Colors";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  containerStyle,
}) => {
  const getContainerStyle = () => {
    const baseStyle = [styles.container];

    // Add variant styles
    switch (variant) {
      case "primary":
        baseStyle.push(styles.primaryContainer);
        break;
      case "secondary":
        baseStyle.push(styles.secondaryContainer);
        break;
      case "outline":
        baseStyle.push(styles.outlineContainer);
        break;
      case "ghost":
        baseStyle.push(styles.ghostContainer);
        break;
    }

    // Add size styles
    switch (size) {
      case "small":
        baseStyle.push(styles.smallContainer);
        break;
      case "medium":
        baseStyle.push(styles.mediumContainer);
        break;
      case "large":
        baseStyle.push(styles.largeContainer);
        break;
    }

    // Add disabled style
    if (disabled) {
      baseStyle.push(styles.disabledContainer);
    }

    // Add full width style
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];

    // Add variant styles
    switch (variant) {
      case "primary":
        baseStyle.push(styles.primaryText);
        break;
      case "secondary":
        baseStyle.push(styles.secondaryText);
        break;
      case "outline":
        baseStyle.push(styles.outlineText);
        break;
      case "ghost":
        baseStyle.push(styles.ghostText);
        break;
    }

    // Add size styles
    switch (size) {
      case "small":
        baseStyle.push(styles.smallText);
        break;
      case "medium":
        baseStyle.push(styles.mediumText);
        break;
      case "large":
        baseStyle.push(styles.largeText);
        break;
    }

    // Add disabled style
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getContainerStyle(), containerStyle]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.card : colors.primary}
          size={size === "small" ? "small" : "small"}
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryContainer: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ghostContainer: {
    backgroundColor: "transparent",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  smallContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  mediumContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  largeContainer: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledContainer: {
    opacity: 0.5,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: {
    width: "100%",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
  },
  primaryText: {
    color: colors.card,
    fontWeight: "600",
  },
  secondaryText: {
    color: colors.card,
    fontWeight: "600",
  },
  outlineText: {
    color: colors.primary,
    fontWeight: "600",
  },
  ghostText: {
    color: colors.primary,
    fontWeight: "600",
  },
  smallText: {
    fontSize: 12,
    fontWeight: "600",
  },
  mediumText: {
    fontSize: 14,
    fontWeight: "600",
  },
  largeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.8,
    fontWeight: "600",
  },
});
