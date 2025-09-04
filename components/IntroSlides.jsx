import { useState } from "react"
import { Animated, View, Text, Pressable } from "react-native"
import { COLORS, images } from "../constants"

const slides = [
    {
        id: 1,
        imagen: images.intro1,
        title: "Supervisa",
        description: "Revisa la actividad de los ejecutivos de tu sucursal a cargo."
    },
    {
        id: 2,
        imagen: images.intro2,
        title: "Analiza",
        description: "Consulta reportes en tiempo real."
    },
    {
        id: 3,
        imagen: images.intro3,
        title: "¿Estás listo para comenzar?",
        description:
            "Ingresa el usuario y contraseña que te proporcionó el equipo a soporte operativo"
    }
]

export default function IntroSlides({ onFinish }) {
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1)
        } else {
            onFinish()
        }
    }

    const isLastSlide = currentSlide === slides.length - 1

    return (
        <View
            className="flex-1 justify-center items-center px-8"
            style={{ backgroundColor: COLORS.primary }}
        >
            {/* Contenido del slide actual */}
            <View className="flex-1 justify-center items-center">
                <View className="w-48 h-48 mb-8 justify-center items-center">
                    <Animated.Image
                        source={slides[currentSlide].imagen}
                        className="w-48 h-48 rounded-full"
                        resizeMode="contain"
                    />
                </View>

                <Text className="text-white text-3xl font-bold text-center mb-4">
                    {slides[currentSlide].title}
                </Text>

                <Text className="text-white text-base text-center leading-6 opacity-90">
                    {slides[currentSlide].description}
                </Text>
            </View>

            {/* Indicadores de progreso */}
            <View className="flex-row mb-8">
                {slides.map((_, index) => (
                    <View
                        key={index}
                        className="w-2 h-2 rounded-full mx-1"
                        style={{
                            backgroundColor:
                                index === currentSlide ? "#fff" : "rgba(255,255,255,0.3)"
                        }}
                    />
                ))}
            </View>

            {/* Botón */}
            <Pressable
                onPress={nextSlide}
                className="w-full h-12 rounded-full justify-center items-center mb-8"
                style={{ backgroundColor: "#fff" }}
            >
                <Text className="font-semibold text-base" style={{ color: COLORS.primary }}>
                    {isLastSlide ? "Comenzar" : "Siguiente"}
                </Text>
            </Pressable>
        </View>
    )
}
