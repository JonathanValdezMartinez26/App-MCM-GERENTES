import { useState, useContext, useEffect } from "react"
import { View, Text, StatusBar, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { COLORS, FONTS } from "../../constants"
import { SafeAreaInsetsContext } from "react-native-safe-area-context"
import { MaterialIcons, Feather } from "@expo/vector-icons"
import numeral from "numeral"

numeral.zeroFormat(0)
numeral.nullFormat(0)

export default function DetalleEjecutivo() {
    const { ejecutivo, dia } = useLocalSearchParams()
    const [datosEjecutivo, setDatosEjecutivo] = useState(null)
    const [loading, setLoading] = useState(true)
    const insets = useContext(SafeAreaInsetsContext)

    useEffect(() => {
        if (ejecutivo) {
            try {
                const datos = JSON.parse(ejecutivo)
                setDatosEjecutivo(datos)
                setLoading(false)
            } catch (error) {
                console.error("Error al parsear datos del ejecutivo:", error)
                setLoading(false)
            }
        }
    }, [ejecutivo])

    const verRutaEjecutivo = () => {
        if (datosEjecutivo) {
            router.push({
                pathname: "/(screens)/RutaEjecutivo",
                params: {
                    ejecutivo: datosEjecutivo.ASESOR,
                    nombre: datosEjecutivo.NOMBRE_ASESOR
                }
            })
        }
    }

    const volverAlResumen = () => {
        router.back()
    }

    const renderInfoCard = (titulo, valor, icono, color = COLORS.primary) => {
        return (
            <View className="w-[48%] bg-blue-50 p-4 rounded-xl mb-3">
                <View className="flex-row items-center mb-2">
                    <MaterialIcons name={icono} size={20} color={color} />
                    <Text className="text-sm font-medium text-gray-700 ml-2">{titulo}</Text>
                </View>
                <Text className="text-xl font-bold text-gray-800">{valor}</Text>
            </View>
        )
    }

    const renderEstadisticasCard = () => {
        if (!datosEjecutivo) return null

        const porcentajeCompletado =
            datosEjecutivo.PAGOS_DEL_DIA > 0
                ? (datosEjecutivo.PAGOS_COBRADOS / datosEjecutivo.PAGOS_DEL_DIA) * 100
                : 0

        return (
            <View className="bg-blue-50 rounded-2xl p-4">
                <Text
                    style={{
                        ...FONTS.h4,
                        color: COLORS.black,
                        fontWeight: "600",
                        marginBottom: 16
                    }}
                >
                    Estadísticas del Día
                </Text>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 12
                    }}
                >
                    <Text style={{ ...FONTS.body3, color: COLORS.gray3 }}>
                        Progreso de Cobranza
                    </Text>
                    <Text
                        style={{
                            ...FONTS.body3,
                            color:
                                porcentajeCompletado >= 80
                                    ? COLORS.success
                                    : porcentajeCompletado >= 50
                                    ? COLORS.warning
                                    : COLORS.error,
                            fontWeight: "600"
                        }}
                    >
                        {porcentajeCompletado.toFixed(1)}%
                    </Text>
                </View>

                <View
                    style={{
                        height: 8,
                        backgroundColor: COLORS.greyscale300,
                        borderRadius: 4,
                        marginBottom: 20
                    }}
                >
                    <View
                        style={{
                            height: 8,
                            width: `${Math.max(0, Math.min(100, porcentajeCompletado))}%`,
                            backgroundColor:
                                porcentajeCompletado >= 80
                                    ? COLORS.success
                                    : porcentajeCompletado >= 50
                                    ? COLORS.warning
                                    : COLORS.error,
                            borderRadius: 4
                        }}
                    />
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: COLORS.greyscale300
                    }}
                >
                    <View style={{ alignItems: "center" }}>
                        <Text
                            style={{
                                ...FONTS.h3,
                                color: COLORS.success,
                                fontWeight: "700"
                            }}
                        >
                            {datosEjecutivo.PAGOS_COBRADOS}
                        </Text>
                        <Text style={{ ...FONTS.body4, color: COLORS.gray3 }}>Cobrados</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text
                            style={{
                                ...FONTS.h3,
                                color: COLORS.error,
                                fontWeight: "700"
                            }}
                        >
                            {datosEjecutivo.PAGOS_PENDIENTES}
                        </Text>
                        <Text style={{ ...FONTS.body4, color: COLORS.gray3 }}>Pendientes</Text>
                    </View>
                    <View style={{ alignItems: "center" }}>
                        <Text
                            style={{
                                ...FONTS.h3,
                                color: COLORS.primary,
                                fontWeight: "700"
                            }}
                        >
                            {datosEjecutivo.PAGOS_DEL_DIA}
                        </Text>
                        <Text style={{ ...FONTS.body4, color: COLORS.gray3 }}>Total</Text>
                    </View>
                </View>
            </View>
        )
    }

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.grayscale100,
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
                    Cargando detalles...
                </Text>
            </View>
        )
    }

    if (!datosEjecutivo) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.grayscale100,
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
                <MaterialIcons name="error-outline" size={64} color={COLORS.error} />
                <Text
                    style={{
                        ...FONTS.h3,
                        color: COLORS.black,
                        marginTop: 16,
                        marginBottom: 8
                    }}
                >
                    Error al cargar
                </Text>
                <Text
                    style={{
                        ...FONTS.body3,
                        color: COLORS.gray3,
                        textAlign: "center",
                        marginHorizontal: 40
                    }}
                >
                    No se pudieron cargar los datos del ejecutivo
                </Text>
                <Pressable
                    onPress={volverAlResumen}
                    style={{
                        backgroundColor: COLORS.primary,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 8,
                        marginTop: 24
                    }}
                >
                    <Text style={{ ...FONTS.body3, color: COLORS.white }}>Volver</Text>
                </Pressable>
            </View>
        )
    }

    return (
        <View
            className="flex-1 bg-primary"
            style={{
                paddingTop: insets.top
            }}
        >
            <View className="flex-row items-center p-4">
                <Pressable onPress={volverAlResumen} className="mr-4">
                    <Feather name="arrow-left" size={24} color="white" />
                </Pressable>
                <Text className="flex-1 text-white text-lg font-semibold">
                    Detalle del Ejecutivo
                </Text>
            </View>
            <View className="bg-white flex-1 rounded-t-3xl">
                <View className="p-4 border-b border-gray-200">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-800">
                                {datosEjecutivo.NOMBRE_ASESOR}
                            </Text>
                            <Text className="text-base text-gray-600">
                                {dia} - {datosEjecutivo.SUCURSAL}
                            </Text>
                        </View>
                    </View>
                </View>
                <ScrollView
                    className="p-6"
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className="flex-row flex-wrap justify-between mb-4">
                        {renderInfoCard(
                            "Código del Ejecutivo",
                            datosEjecutivo.ASESOR,
                            "person",
                            COLORS.info
                        )}

                        {renderInfoCard(
                            "Efectivo Recolectado",
                            `$${numeral(datosEjecutivo.RECOLECTADO).format("0,0.00")}`,
                            "attach-money",
                            COLORS.success
                        )}

                        {renderInfoCard(
                            "Por Recolectar",
                            `$${numeral(datosEjecutivo.POR_RECOLECTAR_EFECTIVO).format("0,0.00")}`,
                            "schedule",
                            COLORS.warning
                        )}

                        {renderInfoCard(
                            "Pendiente de Efectivo",
                            `$${numeral(datosEjecutivo.PENDIENTE_EFECTIVO).format("0,0.00")}`,
                            "money-off",
                            datosEjecutivo.PENDIENTE_EFECTIVO >= 0 ? COLORS.primary : COLORS.error
                        )}
                    </View>

                    {renderEstadisticasCard()}
                    {/* Botón para ver ruta */}
                    <Pressable
                        onPress={verRutaEjecutivo}
                        style={{
                            backgroundColor: COLORS.primary,
                            marginHorizontal: 20,
                            marginVertical: 20,
                            paddingVertical: 16,
                            borderRadius: 12,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 5
                        }}
                    >
                        <Feather
                            name="map-pin"
                            size={24}
                            color={COLORS.white}
                            style={{ marginRight: 12 }}
                        />
                        <Text
                            style={{
                                ...FONTS.h4,
                                color: COLORS.white,
                                fontWeight: "600"
                            }}
                        >
                            Ver Ruta de Cobranza
                        </Text>
                    </Pressable>

                    {/* Espacio para cards de créditos (futuro) */}
                    <View
                        style={{
                            backgroundColor: COLORS.white,
                            borderRadius: 12,
                            padding: 20,
                            marginHorizontal: 20,
                            marginVertical: 8,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                            alignItems: "center"
                        }}
                    >
                        <MaterialIcons name="credit-card" size={48} color={COLORS.gray3} />
                        <Text
                            style={{
                                ...FONTS.h4,
                                color: COLORS.black,
                                marginTop: 12,
                                marginBottom: 8
                            }}
                        >
                            Detalles de Créditos
                        </Text>
                        <Text
                            style={{
                                ...FONTS.body4,
                                color: COLORS.gray3,
                                textAlign: "center"
                            }}
                        >
                            Esta sección mostrará los detalles de créditos cuando el endpoint esté
                            disponible
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}
