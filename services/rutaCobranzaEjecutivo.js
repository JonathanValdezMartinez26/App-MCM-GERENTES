import { apiClient, API_CONFIG } from "./api"
import storage from "../utils/storage"

export const rutaCobranzaEjecutivo = {
    /**
     * Obtiene la ruta de cobranza de un ejecutivo específico
     * @param {string} ejecutivo - Código del ejecutivo
     * @param {string} fecha - Fecha en formato yyyy-mm-dd
     * @returns {Promise<{success: boolean, data: any, error?: string}>}
     */
    obtener: async (ejecutivo, fecha) => {
        try {
            const token = await storage.getToken()
            const response = await apiClient.post(
                API_CONFIG.ENDPOINTS.RUTA_COBRANZA_EJECUTIVO,
                {
                    ejecutivo,
                    fecha
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            if (response.data) {
                return {
                    success: true,
                    data: response.data
                }
            } else {
                return {
                    success: false,
                    error: "Error al obtener la ruta de cobranza del ejecutivo"
                }
            }
        } catch (error) {
            console.error("Error en rutaCobranzaEjecutivo.obtener:", error)
            return {
                success: false,
                error: error.message || "Error de conexión"
            }
        }
    }
}
