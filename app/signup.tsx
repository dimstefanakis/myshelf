import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useRouter, Redirect } from "expo-router";
import { View, Text, Button, TextInput } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";

type Inputs = {
  password: string;
  email: string;
};

export default function Signup() {
  const { user, session } = useUser();
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.log("error", error);
      return;
    }
  };

  useEffect(() => {
    if (session && session.access_token) router.replace("/");
  }, [session]);

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
          Signup to MyShelf
        </Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
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
              placeholder="Password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              textContentType="password"
              secureTextEntry
              style={{ marginTop: 10 }}
            />
          )}
          name="password"
          rules={{ required: true }}
        />
        {errors.password && <Text>This is required.</Text>}

        <Button onPress={handleSubmit(onSubmit)} style={{ marginTop: 10 }}>
          <Text
            style={{
              color: "white",
            }}
          >
            Signup
          </Text>
        </Button>
      </View>
    </View>
  );
}
