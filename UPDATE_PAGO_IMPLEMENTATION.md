# Actualización: Uso de updatePago en lugar de marcarComoPagado

## Cambios Realizados

### 1. Store de Pagos (`stores/pagosStore.ts`)

#### Nuevo método agregado:
```typescript
updatePago: async (pagoId: string, data: Partial<Pago>) => Promise<void>
```

#### Funcionalidad:
- Utiliza `pagosService.updatePago()` del API
- Acepta datos parciales del tipo `Pago` para máxima flexibilidad
- Actualiza localmente el estado del pago en el store
- Manejo robusto de errores con logging detallado

#### Implementación:
```typescript
updatePago: async (pagoId: string, data: Partial<Pago>) => {
  set({ loading: true, error: null });
  try {
    console.log('🔄 Actualizando pago:', pagoId, data);
    
    const response = await pagosService.updatePago(pagoId, data);

    if (response.data) {
      const pagos = get().pagos;
      const updatedPagos = pagos.map(pago => {
        const pagoId_actual = pago.id_pago ?? pago.id_factura;
        const pagoId_buscar = pagoId;
        
        return pagoId_actual === pagoId_buscar 
          ? { ...pago, ...response.data, ...data }
          : pago;
      });
      
      set({ pagos: updatedPagos, loading: false });
      console.log('✅ Pago actualizado exitosamente');
    }
  } catch (error: any) {
    console.error('❌ Error al actualizar pago:', error);
    set({ 
      error: error.response?.data?.message ?? 'Error al actualizar el pago',
      loading: false 
    });
  }
}
```

### 2. PagosScreen (`screens/PagosScreen.tsx`)

#### Cambios en imports:
- ❌ Removido: `marcarComoPagado`
- ✅ Agregado: `updatePago`

#### Actualización de `handlePaymentSuccess`:
```typescript
const handlePaymentSuccess = async (paymentIntentId: string) => {
  try {
    if (!pagoSeleccionado) return;

    const id = pagoSeleccionado.id_pago ?? pagoSeleccionado.id_factura;
    if (!id) {
      throw new Error('ID de pago no encontrado');
    }

    // Actualizar el estado del pago a pagado con el payment intent de Stripe
    await updatePago(id, {
      estado: 'pagado',
      metodo_pago: 'Stripe',
      comprobante_url: paymentIntentId,
      fecha_pago: new Date().toISOString()
    });
    
    // Recargar la lista de pagos
    await loadPagos();
    
  } catch (error) {
    console.error('❌ Error al actualizar el pago:', error);
    Alert.alert('Error', 'No se pudo actualizar el estado del pago');
  }
};
```

## Ventajas de la Nueva Implementación

### 1. **Mayor Flexibilidad**
- `updatePago` acepta cualquier campo del tipo `Pago`
- Permite actualizaciones parciales
- Reutilizable para otros casos de uso

### 2. **Mejor Semántica**
- `updatePago` es más genérico y claro
- `marcarComoPagado` es específico para una acción
- Método de pago específico: 'Stripe' en lugar de 'Tarjeta'

### 3. **Consistencia con la API**
- Utiliza directamente `pagosService.updatePago()`
- Alineado con el patrón REST estándar (PATCH)
- Menos capa de abstracción

### 4. **Datos Más Específicos**
```typescript
{
  estado: 'pagado',
  metodo_pago: 'Stripe',           // Específico de Stripe
  comprobante_url: paymentIntentId, // ID del Payment Intent
  fecha_pago: new Date().toISOString() // Timestamp exacto
}
```

## Flujo de Pago Actualizado

1. **Usuario inicia pago** → Modal de Stripe se abre
2. **Pago exitoso en Stripe** → Se obtiene `paymentIntentId`
3. **`handlePaymentSuccess` ejecuta** → Llama `updatePago()`
4. **`updatePago` actualiza backend** → Vía `PATCH /facturas/{id}`
5. **Estado local actualizado** → UI se actualiza automáticamente
6. **Lista recargada** → Sincronización completa

## Compatibilidad

### API Backend:
- ✅ Endpoint existente: `PATCH /facturas/{id}`
- ✅ Acepta datos parciales
- ✅ Retorna objeto actualizado

### Tipos TypeScript:
- ✅ `Partial<Pago>` para flexibilidad
- ✅ Método de pago 'Stripe' ya incluido
- ✅ Campos opcionales manejados correctamente

## Testing

### Casos de Prueba:
1. **Pago exitoso con Stripe** → Estado cambia a 'pagado'
2. **Error en API** → Manejo de errores apropiado
3. **ID de pago inválido** → Error controlado
4. **Actualización local** → UI refleja cambios inmediatamente

### Logs de Debug:
```
🔄 Actualizando pago: 123 { estado: 'pagado', metodo_pago: 'Stripe', ... }
✅ Pago actualizado exitosamente
```

---

Esta implementación es más robusta, flexible y alineada con las mejores prácticas de desarrollo.
