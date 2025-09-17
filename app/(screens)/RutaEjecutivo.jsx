import React, { useState, useEffect, useContext } from "react"
import {
    View,
    Text,
    StatusBar,
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Linking
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { COLORS, FONTS } from "../../constants"
import { SafeAreaInsetsContext } from "react-native-safe-area-context"
import { MaterialIcons } from "@expo/vector-icons"
import { rutaCobranzaEjecutivo } from "../../services"
import { useSession } from "../../context/SessionContext"
import numeral from "numeral"

export default function RutaEjecutivo() {
    const { ejecutivo, nombre } = useLocalSearchParams()
    const [rutaData, setRutaData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { keyMaps } = useSession()
    const insets = useContext(SafeAreaInsetsContext)

    const obtenerFechaActual = () => {
        const hoy = new Date()
        const year = hoy.getFullYear()
        const month = String(hoy.getMonth() + 1).padStart(2, "0")
        const day = String(hoy.getDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
    }

    const obtenerRutaEjecutivo = async () => {
        try {
            setLoading(true)
            const fechaActual = obtenerFechaActual()
            const response = await rutaCobranzaEjecutivo.obtener(ejecutivo, fechaActual)

            if (response.success) {
                setRutaData(response.data)
            } else {
                Alert.alert("Error", response.error || "No se pudo obtener la ruta del ejecutivo")
            }
        } catch (error) {
            console.error("Error al obtener ruta:", error)
            Alert.alert("Error", "Error inesperado al obtener la ruta")
        } finally {
            setLoading(false)
        }
    }

    const volverAlDetalle = () => {
        router.back()
    }

    const abrirEnGoogleMaps = async (latitude, longitude, nombrePunto) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
        try {
            const supported = await Linking.canOpenURL(url)
            if (supported) {
                await Linking.openURL(url)
            } else {
                Alert.alert("Error", "No se puede abrir Google Maps")
            }
        } catch (error) {
            Alert.alert("Error", "No se puede abrir el enlace")
        }
    }

    const renderPuntoRuta = (feature, index) => {
        const { coordinates } = feature.geometry
        const { properties } = feature

        return (
            <Pressable
                key={`punto-${index}`}
                onPress={() => abrirEnGoogleMaps(coordinates[1], coordinates[0], properties.nombre)}
                style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 12,
                    padding: 16,
                    marginHorizontal: 20,
                    marginVertical: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    flexDirection: "row",
                    alignItems: "center"
                }}
            >
                <View
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: properties.color || COLORS.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16
                    }}
                >
                    <Text
                        style={{
                            ...FONTS.body3,
                            color: COLORS.white,
                            fontWeight: "bold"
                        }}
                    >
                        {properties.numero}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            ...FONTS.body3,
                            color: COLORS.black,
                            fontWeight: "600",
                            marginBottom: 4
                        }}
                    >
                        {properties.nombre}
                    </Text>
                    <Text
                        style={{
                            ...FONTS.body4,
                            color: COLORS.gray3,
                            marginBottom: 4
                        }}
                    >
                        Monto: ${numeral(properties.monto).format("0,0.00")}
                    </Text>
                    <Text
                        style={{
                            ...FONTS.body4,
                            color: COLORS.gray3
                        }}
                    >
                        {properties.fecha} - {properties.fregistro}
                    </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                    <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
                    <Text
                        style={{
                            ...FONTS.body4,
                            color: COLORS.primary,
                            marginTop: 4
                        }}
                    >
                        Ver
                    </Text>
                </View>
            </Pressable>
        )
    }

    const renderEstadisticas = () => {
        if (!rutaData || !rutaData.features) return null

        const puntos = rutaData.features.filter((feature) => feature.geometry.type === "Point")
        const totalPuntos = puntos.length
        const montoTotal = puntos.reduce((sum, feature) => sum + (feature.properties.monto || 0), 0)

        return (
            <View
                style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 12,
                    padding: 16,
                    marginHorizontal: 20,
                    marginVertical: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 8
                }}
            >
                <Text
                    style={{
                        ...FONTS.h4,
                        color: COLORS.black,
                        marginBottom: 12,
                        fontWeight: "600"
                    }}
                >
                    Resumen de la Ruta
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around"
                    }}
                >
                    <View style={{ alignItems: "center" }}>
                        <Text
                            style={{
                                ...FONTS.h3,
                                color: COLORS.primary,
                                fontWeight: "bold"
                            }}
                        >
                            {totalPuntos}
                        </Text>
                        <Text style={{ ...FONTS.body4, color: COLORS.gray3 }}>Paradas</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text
                            style={{
                                ...FONTS.h3,
                                color: COLORS.success,
                                fontWeight: "bold"
                            }}
                        >
                            ${numeral(montoTotal).format("0,0")}
                        </Text>
                        <Text style={{ ...FONTS.body4, color: COLORS.gray3 }}>Total</Text>
                    </View>
                </View>
            </View>
        )
    }

    useEffect(() => {
        if (ejecutivo) {
            obtenerRutaEjecutivo()
        }
    }, [ejecutivo])

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.white,
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text
                    style={{
                        ...FONTS.body3,
                        color: COLORS.gray3,
                        marginTop: 16
                    }}
                >
                    Cargando ruta...
                </Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.white }}>
            <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

            {/* Header */}
            <View
                style={{
                    backgroundColor: COLORS.white,
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    paddingTop: insets.top + 16,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.greyscale300,
                    flexDirection: "row",
                    alignItems: "center",
                    zIndex: 1000
                }}
            >
                <Pressable
                    onPress={volverAlDetalle}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: COLORS.grayscale100,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16
                    }}
                >
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.black} />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={{ ...FONTS.h3, color: COLORS.black }}>Ruta de Cobranza</Text>
                    <Text style={{ ...FONTS.body4, color: COLORS.gray3 }}>
                        {nombre} - {obtenerFechaActual()}
                    </Text>
                </View>
            </View>

            {/* Lista de puntos de ruta */}
            {rutaData && rutaData.features ? (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {renderEstadisticas()}

                    <Text
                        style={{
                            ...FONTS.h4,
                            color: COLORS.black,
                            marginHorizontal: 20,
                            marginVertical: 16,
                            fontWeight: "600"
                        }}
                    >
                        Puntos de la Ruta
                    </Text>

                    {rutaData.features
                        .filter((feature) => feature.geometry.type === "Point")
                        .sort((a, b) => a.properties.numero - b.properties.numero)
                        .map((feature, index) => renderPuntoRuta(feature, index))}
                </ScrollView>
            ) : (
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: COLORS.grayscale100
                    }}
                >
                    <MaterialIcons name="route" size={64} color={COLORS.gray3} />
                    <Text
                        style={{
                            ...FONTS.h4,
                            color: COLORS.black,
                            marginTop: 16,
                            marginBottom: 8
                        }}
                    >
                        Sin datos de ruta
                    </Text>
                    <Text
                        style={{
                            ...FONTS.body4,
                            color: COLORS.gray3,
                            textAlign: "center",
                            marginHorizontal: 40
                        }}
                    >
                        No se encontraron datos de ruta para este ejecutivo en la fecha actual
                    </Text>
                </View>
            )}
        </View>
    )
}
