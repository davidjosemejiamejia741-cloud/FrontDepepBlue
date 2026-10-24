# DeepBlue Rescue — Frontend implementado

Implementación del laboratorio adjunto con React, Vite, JavaScript y TanStack Query v5.

## Ejecutar

Usa Node 22.12 o superior y npm, ambos instalados en el mismo entorno (si usas WSL, instala ambos dentro de WSL).

```bash
cd deepblue-ui
npm install
npm run dev
```

Abre http://localhost:5173. Inicia tu backend Spring Boot en http://localhost:8080 con datos reales: un caso, su animal y un especialista. No incluye backend ni datos simulados.

El proxy de `vite.config.js` reenvía `/api` al backend. Si tu backend tiene otro puerto, modifica ese archivo y reinicia Vite.

## Funcionalidades

- Filtrar casos por los seis estados del laboratorio.
- Seleccionar un caso y consultar animal, tratamientos y elegibilidad.
- Cambiar estado mediante PATCH; invalidar listas y datos del animal.
- Registrar tratamientos con un formulario controlado mediante useReducer.
- Mostrar errores HTTP 400, 404 y 409 y detalles de validación por campo.
- Mostrar estados de carga y listas vacías; restablecer el formulario tras guardar.
- Diseño adaptable a móvil y escritorio.

Se mantienen los códigos de estado y tratamiento del documento. Las transiciones y validaciones de negocio se resuelven en el backend. El formulario permite enviar datos inválidos para realizar las pruebas negativas del laboratorio. No se implementan los retos opcionales de router o restricciones de transición sin conocer el servicio real.

## Caché y correcciones

Se establece `staleTime: 60_000`: durante un minuto las consultas recientes se reutilizan sin solicitar nuevamente al volver a un caso. Pasado ese período pueden refrescarse. Las mutaciones invalidan inmediatamente los datos afectados.

El cambio de estado refresca también la elegibilidad. El formulario y las mutaciones se reinician al cambiar de caso. Una actualización pendiente de otro caso no reemplaza el caso actualmente seleccionado. El cliente HTTP normaliza fallas de red, errores de proxy y respuestas sin contenido.

## Verificación

```bash
npm test
npm run build
```

Las pruebas automatizadas verifican el cliente HTTP con respuestas simuladas, no el backend Spring Boot. Para comprobar la integración real:

1. Lista ADMITTED y selecciona un caso con animal.
2. Comprueba detalle, elegibilidad y tratamientos.
3. Cambia ADMITTED a UNDER_EVALUATION: debe desaparecer de ADMITTED.
4. En otro caso ADMITTED intenta RELEASED: verifica el 409 según tus reglas.
5. Envía descripción corta o especialista vacío: verifica 400 y detalles.
6. Usa SP-999: verifica 404 si ese especialista no existe.
7. Registra datos válidos: verifica la nueva fila, formulario vacío y elegibilidad actualizada.
8. Detén el backend y recarga: verifica el mensaje de error.

`npm run build` genera `dist/`. El proxy es de desarrollo: al desplegar debes configurar el servidor para servir `/api` desde Spring Boot y los archivos estáticos desde `dist/`. `npm run preview` solo previsualiza el build y no reemplaza esa configuración.
