import { createStackNavigator } from '@react-navigation/stack';
import HomepageContainers from '../(tabs)/index';
import ChronologyScreen from '../LandingPage/ChronologyScreen'; 

const Stack = createStackNavigator();

export default function HomeStack() {
  // Navigators
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, title:'' }}>
      <Stack.Screen name="Home" component={HomepageContainers} />
      <Stack.Screen name="Chronology" component={ChronologyScreen} options={{headerShown: true}} />
    </Stack.Navigator>
  );
}
