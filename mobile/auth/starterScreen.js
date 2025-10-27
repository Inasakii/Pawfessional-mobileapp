import React, { useRef, useState, useEffect } from "react";
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Dimensions,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    image: require("../assets/getstarted.jpg"), 
    title: "", 
    description: "", 
    button: "Get Started", 
  },
  {
    id: "2",
    image: require("../assets/pixelart.png"),
    title: "Welcome to Pawfessional VetApp",
    description:
      "Easily book vet appointments, and get personalized care tips—all in one place for your furry friend’s well-being.",
  },
  {
    id: "3",
    image: require("../assets/pixeldog.png"),
    title: "Let's get going!",
    description: "Continue your VetApp journey with us",
    button: "Login",
  },
];

const StarterScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Check if onboarding was already seen
  useEffect(() => {
    const checkOnboarding = async () => {
      const seen = await AsyncStorage.getItem("hasSeenOnboarding");
      if (seen) {
        // Already seen → go directly to Login
        navigation.replace("Login");
      } else {
        setLoading(false); // show onboarding slides
      }
    };
    checkOnboarding();
  }, []);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleButtonPress = async () => {
    if (currentIndex === slides.length - 1) {
      // ✅ Save flag so onboarding won’t show again
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      navigation.replace("Login");
    } else {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image 
              source={item.image} 
              style={[
                styles.image, 
                item.id === "1" ? styles.fullImage : styles.centerImage,
              ]}
              resizeMode={item.id === "1" ? "cover" : "contain"}
            />
            {item.title ? <Text style={styles.title}>{item.title}</Text> : null}
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
            {item.button ? (
              <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
                <Text style={styles.buttonText}>{item.button}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />

      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.dot, 
              currentIndex === i ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9590F" },
  slide: {
    width: width,
    height: height,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  image: { width: "100%", height: "60%" },
  fullImage: { borderRadius: 160 },
  centerImage: { width: 250, height: 250, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: { fontWeight: "bold", fontSize: 16, color: "#FF7A00" },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 5 },
  activeDot: { backgroundColor: "#fff" },
  inactiveDot: { backgroundColor: "#ccc" },
});

export default StarterScreen;
