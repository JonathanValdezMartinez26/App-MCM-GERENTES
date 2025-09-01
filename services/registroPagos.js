import { apiClient, API_CONFIG } from "./api"
import storage from "../utils/storage"
import * as FileSystem from "expo-file-system"

export const registroPagos = {
    async convertirImagenABase64(uri) {
        try {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64
            })
            return base64
        } catch (error) {
            console.error("Error al convertir imagen a base64:", error)
            return null
        }
    },

    // Registrar un pago individual en el servidor
    async registrarPago(pagoData) {
        try {
            const token = await storage.getToken()
            const fecha = pagoData.fechaCaptura.split("T")[0].split("/").reverse().join("-")

            let fotoBase64 = null

            if (pagoData.fotoComprobante) {
                fotoBase64 = await this.convertirImagenABase64(pagoData.fotoComprobante)

                if (!fotoBase64) {
                    console.warn("No se pudo convertir la imagen a base64, enviando sin foto")
                }
            }

            const data = {
                id_local: pagoData.id,
                cdgns: pagoData.credito,
                ciclo: pagoData.ciclo,
                monto: parseFloat(pagoData.monto),
                comentarios_ejecutivo: pagoData.comentarios || "",
                tipomov: pagoData.tipoPago,
                foto: fotoBase64,
                fecha_valor: fecha,
                latitud: pagoData.latitud || null,
                longitud: pagoData.longitud || null
            }

            // console.log("Enviando pago al servidor:", {
            //     ...data,
            //     foto: fotoBase64 ? `[base64 image ${fotoBase64.length} chars]` : null
            // })

            const response = await apiClient.post(API_CONFIG.ENDPOINTS.AGREGAR_PAGO_CLIENTE, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (
                response.status === API_CONFIG.HTTP_STATUS.OK ||
                response.status === API_CONFIG.HTTP_STATUS.CREATED
            ) {
                return {
                    success: true,
                    data: response.data,
                    pagoId: pagoData.id
                }
            } else {
                return {
                    success: false,
                    error: "Error del servidor al registrar el pago",
                    pagoId: pagoData.id
                }
            }
        } catch (error) {
            console.error("Error al registrar pago:", error)
            return {
                success: false,
                error: error.response?.data?.message || error.message || "Error de conexión",
                pagoId: pagoData.id
            }
        }
    },

    // Registrar múltiples pagos en lote
    async registrarPagosLote(pagosArray) {
        const resultados = {
            exitosos: [],
            fallidos: [],
            total: pagosArray.length
        }

        for (const pago of pagosArray) {
            const resultado = await this.registrarPago(pago)

            if (resultado.success) {
                resultados.exitosos.push({
                    pagoId: pago.id,
                    credito: pago.credito,
                    monto: pago.monto,
                    data: resultado.data
                })
            } else {
                resultados.fallidos.push({
                    pagoId: pago.id,
                    credito: pago.credito,
                    monto: pago.monto,
                    error: resultado.error
                })
            }
        }

        return {
            success: resultados.fallidos.length === 0,
            resultados
        }
    }
}
