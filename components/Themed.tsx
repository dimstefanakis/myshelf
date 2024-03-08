/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
} from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "./useColorScheme";
import {
  StyleSheet,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from "react-native";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type ButtonProps = ThemeProps &
  PressableProps & {
    style?: StyleProp<ViewStyle>;
  };
export type InputProps = ThemeProps & TextInputProps;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  // const theme = useColorScheme() ?? "light";
  // hard code to light theme for now
  const theme = "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Button(props: ButtonProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "button",
  );

  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? backgroundColor : backgroundColor,
        },
        styles.button,
        style,
      ]}
      {...otherProps}
    />
  );
}

export function TextInput(props: InputProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "input",
  );

  return (
    <DefaultTextInput
      style={[{ backgroundColor }, styles.input, style]}
      placeholderTextColor={"#9E9E9E"}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
    color: "white",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    // fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    color: "black",
    padding: 10,
    width: "100%",
  },
});
