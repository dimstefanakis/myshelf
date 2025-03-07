import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator } from "react-native";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useRouter, Redirect } from "expo-router";
import { View, Text, Button, Input, YStack, XStack, H1, Separator } from "tamagui";
import SafeAreaViewFixed from "@/components/SafeAreaView";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";

type Inputs = {
  password: string;
  email: string;
};

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user, session } = useUser();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    setErrorMessage("");
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    if (session && session.access_token) {
      router.replace("/");
    }
  }, [session, user]);

  return (
    <YStack flex={1} backgroundColor="$orange1">
      <SafeAreaViewFixed style={{ flex: 1 }}>
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <YStack
            width="90%"
            maxWidth={420}
            gap="$6"
            padding="$6"
            backgroundColor="$orange2"
            borderRadius="$4"
            shadowColor="$orange8"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.15}
            shadowRadius={16}
            elevation={8}
          >
            <YStack alignItems="center" gap="$3" marginBottom="$2">
              <H1 
                color="$orange11" 
                fontWeight="bold" 
                fontSize={36} 
                lineHeight={42}
                textAlign="center"
                fontFamily="$heading"
              >
                Welcome to bnook
              </H1>
              <Text 
                color="$orange9" 
                fontSize={17} 
                lineHeight={22}
                textAlign="center"
                opacity={0.9}
                maxWidth={280}
              >
                Sign in to access your reading journey
              </Text>
            </YStack>

            {errorMessage ? (
              <View
                backgroundColor="#FEE2E2"
                padding="$3"
                borderRadius="$3"
                borderLeftWidth={4}
                borderLeftColor="#DC2626"
              >
                <Text color="#DC2626" fontWeight="500">{errorMessage}</Text>
              </View>
            ) : null}

            <YStack gap="$4">
              <YStack gap="$2">
                <Text color="$orange11" fontWeight="500">Email</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      textContentType="emailAddress"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      placeholder="Your email address"
                      size="$4"
                      borderWidth={1}
                      borderColor={errors.email ? "#DC2626" : "$orange4"}
                      backgroundColor="$orange1"
                      focusStyle={{
                        borderColor: "$orange8",
                        borderWidth: 2,
                      }}
                    />
                  )}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email format"
                    }
                  }}
                />
                {errors.email && (
                  <Text color="#DC2626" fontSize="$2">
                    {errors.email.message || "Email is required"}
                  </Text>
                )}
              </YStack>

              <YStack gap="$2">
                <Text color="$orange11" fontWeight="500">Password</Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      placeholder="Your password"
                      textContentType="password"
                      secureTextEntry
                      size="$4"
                      borderWidth={1}
                      borderColor={errors.password ? "#DC2626" : "$orange4"}
                      backgroundColor="$orange1"
                      focusStyle={{
                        borderColor: "$orange8",
                        borderWidth: 2,
                      }}
                    />
                  )}
                  name="password"
                  rules={{ required: "Password is required" }}
                />
                {errors.password && (
                  <Text color="#DC2626" fontSize="$2">
                    {errors.password.message || "Password is required"}
                  </Text>
                )}
              </YStack>

              <Button
                disabled={loading}
                onPress={handleSubmit(onSubmit)}
                marginTop="$4"
                height={50}
                backgroundColor="$orange10"
                borderRadius="$3"
                pressStyle={{ backgroundColor: "$orange8" }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text color="white" fontWeight="600" fontSize={16}>
                    Sign In
                  </Text>
                )}
              </Button>
            </YStack>

            <XStack alignItems="center" gap="$2" marginTop="$2">
              <Separator flex={1} borderColor="$orange4" />
              <Text color="$orange9">Don't have an account?</Text>
              <Separator flex={1} borderColor="$orange4" />
            </XStack>

            <Button
              height={50}
              backgroundColor="$orange4"
              borderRadius="$3"
              pressStyle={{ backgroundColor: "$orange6" }}
              onPress={() => router.replace("/signup")}
            >
              <Text color="$orange11" fontWeight="600" fontSize={16}>
                Create Account
              </Text>
            </Button>
          </YStack>
        </YStack>
      </SafeAreaViewFixed>
    </YStack>

  );
}
