import React, { createContext, useContext, useState, useEffect } from "react"
import { catalogos } from "../services"

const CarteraContext = createContext()

export const useCartera = () => {
    const context = useContext(CarteraContext)
    if (!context) {
        throw new Error("useCartera debe ser usado dentro de CarteraProvider")
    }
    return context
}

export const CarteraProvider = ({ children }) => {
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(false)
    const [lastUpdate, setLastUpdate] = useState(null)

    // Función para obtener todos los créditos de la cartera
    const obtenerCartera = async (forzarActualizacion = false) => {
        try {
            // Solo actualizar si no hay datos o si se fuerza la actualización
            // o si han pasado más de 5 minutos desde la última actualización
            const ahora = Date.now()
            const tiempoLimite = 5 * 60 * 1000 // 5 minutos

            if (
                !forzarActualizacion &&
                clientes.length > 0 &&
                lastUpdate &&
                ahora - lastUpdate < tiempoLimite
            ) {
                return { success: true, data: clientes }
            }

            setLoading(true)
            const respuesta = await catalogos.getClientesEjecutivo()
            const nuevosClientes = respuesta.data.clientes || []

            setClientes(nuevosClientes)
            setLastUpdate(ahora)

            return { success: true, data: nuevosClientes }
        } catch (error) {
            console.error("Error al obtener cartera:", error)
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    // Función para validar si un número de crédito existe en la cartera
    const validarCredito = (numeroCredito) => {
        if (!numeroCredito || numeroCredito.length !== 6) {
            return { valido: false, mensaje: "El número de crédito debe tener 6 dígitos" }
        }

        const creditoEncontrado = clientes.find((cliente) => cliente.cdgns === numeroCredito)

        if (creditoEncontrado) {
            return {
                valido: true,
                cliente: creditoEncontrado,
                mensaje: `Crédito válido - ${creditoEncontrado.nombre}`
            }
        } else {
            return {
                valido: false,
                mensaje: "El número de crédito no se encuentra en su cartera"
            }
        }
    }

    // Función para obtener información específica de un crédito
    const obtenerInfoCredito = (numeroCredito) => {
        return clientes.find((cliente) => cliente.cdgns === numeroCredito) || null
    }

    // Función para limpiar la caché
    const limpiarCache = () => {
        setClientes([])
        setLastUpdate(null)
    }

    // Cargar datos iniciales al montar el provider
    useEffect(() => {
        obtenerCartera()
    }, [])

    const value = {
        clientes,
        loading,
        lastUpdate,
        obtenerCartera,
        validarCredito,
        obtenerInfoCredito,
        limpiarCache
    }

    return <CarteraContext.Provider value={value}>{children}</CarteraContext.Provider>
}
