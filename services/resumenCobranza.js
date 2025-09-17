import { apiClient, API_CONFIG } from "./api"
import storage from "../utils/storage"

export const resumenCobranza = {
    /**
     * Obtiene el resumen de cobranza de la semana
     * @returns {Promise<{success: boolean, data: any, error?: string}>}
     */
    obtener: async () => {
        try {
            const token = await storage.getToken()
            const response = await apiClient.post(API_CONFIG.ENDPOINTS.RESUMEN_COBRANZA, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                }
            } else {
                return {
                    success: false,
                    error: "Error al obtener el resumen de cobranza"
                }
            }
        } catch (error) {
            console.error("Error en resumenCobranza.obtener:", error)
            return {
                success: false,
                error: error.message || "Error de conexión"
            }
        }
    }
}
