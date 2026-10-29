# Meridiano · Diagnóstico de madurez digital

Aplicación web del cuestionario de madurez digital (10 bloques + módulo industrial opcional).

## Cómo ver la aplicación (profesor)

### Opción A — Recomendada: enlace en vivo
Si el alumno ha desplegado la app (Vercel, Netlify u otro), abre el enlace en el navegador. No hace falta instalar nada.

### Opción B — Ejecutar en el ordenador (Node.js)

Requisitos: **Node.js 20 o superior** ([nodejs.org](https://nodejs.org)).

```bash
# 1. Descomprimir este ZIP
# 2. Abrir terminal en la carpeta del proyecto
npm install
npm run dev
```

Abre en el navegador: **http://localhost:8080**

Para detener el servidor: `Ctrl + C` en la terminal.

### Opción C — Solo revisar el código
Los archivos principales están en:

| Ruta | Contenido |
|------|-----------|
| `src/lib/maturity/model.ts` | Bloques, preguntas, puntuación, presets (óptica, bar de copas, etc.) |
| `src/components/meridiano/app.tsx` | Flujo: intro → ficha → cuestionario → resultado |
| `src/components/meridiano/result-view.tsx` | Informe, mapa por bloques, plan 90 días, IA |
| `src/components/meridiano/charts.tsx` | Gráficos radar y barras |

## Qué incluye la herramienta

- Cuestionario por bloques (escala 0–4 + «No aplica»)
- Cálculo automático: % por bloque y nota global (media de bloques aplicables)
- Niveles 1–5 según el enunciado
- Mapa por bloques + comparación con perfiles de prueba
- Fortalezas, huecos, plan de 90 días y oportunidad de IA
- Casos de ejemplo: Óptica Litoral, Comercio del Puerto, Grupo Nexara, **Bar La Terraza** (bar de copas)
- Guardar informe en PDF desde el navegador (botón «Guardar PDF»)

## Cómo se calcula

- Nota de bloque = puntos ÷ (preguntas aplicables × 4) × 100  
- «No aplica» no suma puntos ni máximo  
- Si un bloque entero es «No aplica», no entra en la media  
- Nota global = media de los % de los bloques aplicables (cada bloque pesa igual)

## Entrega académica (referencia)

Según el enunciado del proyecto: herramienta funcional + informe de diagnóstico del negocio (PDF 3–5 páginas recomendado).  
La herramienta genera el informe en pantalla; el alumno puede exportarlo a PDF con el botón del propio informe o con la impresión del navegador.

## Notas técnicas

- Stack: React, Vite, TanStack Router, Recharts  
- Los datos se guardan en el navegador (localStorage); no se envían a ningún servidor  
- Proyecto pensado también para desplegar en Vercel (`npm run build`)
