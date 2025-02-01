// app/screens/CounterScreen.js
import React, { useState } from "react";
import { View, Text, Button } from "react-native";

export default function CounterScreen() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text testID="counterText">Count: {count}</Text>
      <Button
        title="Increment"
        onPress={() => setCount(count + 1)}
      />
    </View>
  );
}
