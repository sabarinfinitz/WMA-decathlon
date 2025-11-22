import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const HomeButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.navigate("UserScreen")}>
      <MaterialIcons name="home" size={35} color="#007AFF" />
    </TouchableOpacity>
  );
};

export default HomeButton;
