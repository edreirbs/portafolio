# 0000 · Constitución

| Campo | Valor |
|---|---|
| Estado | Aprobada |
| Fase | F0 |
| Creada | 2026-11-20 |

Los principios que ninguna spec puede contradecir. Si una spec choca con uno de estos
artículos, gana el artículo o se enmienda la constitución.

## I. El reclutador primero

La metáfora nunca estorba a la información.

- En **10 segundos**, sin hacer clic, cualquier visitante sabe quién es Edrei, qué hace,
  sus tres fortalezas principales y cómo contactarlo.
- En **60 segundos** puede ver las tres mejores piezas con su evidencia.
- La **Ficha rápida** (vista sobria y escaneable) está a un clic desde cualquier página.

## II. Evidencia o no existe

Toda pieza tiene al menos una evidencia verificable: repositorio, demo en vivo, credencial
con liga o ID, documento o testimonio con nombre. Las cifras llevan fuente. Lo que no se
puede respaldar no se publica.

## III. Curaduría sobre acumulación

En el **acervo** cabe todo; en la **vitrina principal** solo lo mejor. Como máximo seis
piezas destacadas. Los trabajos pequeños y parecidos se agrupan en una serie en vez de
repetirse. Un museo impresiona por lo que elige, no por lo que guarda.

## IV. El contenido es dato

Agregar una certificación es agregar un archivo y abrir un PR, sin tocar código. Cada
archivo se valida contra el esquema de la spec 0002 en cada build; si no valida, no se
publica.

## V. Rendimiento y accesibilidad no se negocian

| Presupuesto | Límite |
|---|---|
| Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO) | ≥ 95 cada uno, en móvil |
| Largest Contentful Paint | ≤ 2.0 s en 4G simulado |
| JavaScript en la carga inicial | ≤ 60 KB gzip |
| Accesibilidad | WCAG 2.2 AA, todo operable con teclado |
| Movimiento | Respeta `prefers-reduced-motion` |
| Sin JavaScript | Todo el contenido se lee; solo se pierden adornos |

## VI. Elegancia de museo, no disfraz

Museografía contemporánea que exhibe objetos curiosos, no una tienda de antigüedades. Nada
de engranajes steampunk, texturas pesadas ni pergamino falso. La tipografía, el espacio en
blanco y las cédulas hacen el trabajo.

## VII. Spec antes que código

Ningún cambio de comportamiento sin spec aprobada. Cada PR cita los requisitos que cumple.

## VIII. Privacidad mínima

Solo se exhibe lo personal: lo que Edrei hace por su cuenta, nunca el trabajo institucional
de su empleo actual. El empleo actual aparece únicamente en el Registro: puesto, institución,
fechas y una frase de alcance general, sin proyectos, plataformas, cifras ni presentaciones
internas. Solo se publica lo que Edrei aprobó. Nada de datos de terceros. Los repos privados aparecen
solo con permiso y como caso de estudio, sin código ni datos de clientes.

## IX. Mantenible por una persona en cinco minutos

Actualizar el portafolio no requiere saber Astro. Una pieza nueva es un archivo; la
publicación es automática al fusionar a `main`.

## X. Vigencia visible

El sitio muestra su fecha de última actualización. Las credenciales vencidas se marcan solas.
Una pieza sin revisar en 18 meses se señala en el build.

## Gobierno

Claude puede proponer enmiendas en un PR que modifique este archivo y anote el cambio
abajo. Edrei puede vetar cualquier artículo en cualquier momento; mientras no lo haga, la
constitución está vigente.

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Creada. |
| 2026-11-20 | Art. VIII: el portafolio exhibe solo lo personal, nada del trabajo institucional del empleo. |
| 2026-11-20 | Art. VIII: el empleo actual aparece en el Registro con puesto y alcance general (D-8). |
