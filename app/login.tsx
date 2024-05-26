import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { ActivityIndicator } from "react-native";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useRouter, Redirect } from "expo-router";
import { View, Text, Button, TextInput } from "@/components/Themed";
import Colors from "@/constants/Colors";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";

type Inputs = {
  password: string;
  email: string;
};

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { user, session } = useUser();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (session && session.access_token) {
      router.replace("/");
    }
  }, [session, user]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{
          flex: 1,
          width: "80%",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 10,
            marginTop: 50,
          }}
        >
          Login to bnook
        </Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Email"
            />
          )}
          name="email"
          rules={{ required: true }}
        />
        {errors.email && <Text>This is required.</Text>}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Password"
              textContentType="password"
              secureTextEntry
              style={{ marginTop: 10 }}
            />
          )}
          name="password"
          rules={{ required: true }}
        />
        {errors.password && <Text>This is required.</Text>}
        <Button
          disabled={loading}
          onPress={handleSubmit(onSubmit)}
          style={{ marginTop: 10, display: "flex", flexDirection: "row" }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text
              style={{
                color: "white",
              }}
            >
              Login
            </Text>
          )}
        </Button>
        <Text style={{ marginTop: 10, marginBottom: 10, textAlign: "center" }}>
          Or
        </Text>
        <Button
          style={{
            backgroundColor: Colors.light.buttonTintBackground,
          }}
          onPress={() => {
            router.push("/signup");
          }}
        >
          <Text>Sign Up</Text>
        </Button>
      </View>
    </View>
  );
}
