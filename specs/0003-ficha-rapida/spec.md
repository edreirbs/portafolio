# 0003 · Ficha rápida y CV

| Campo | Valor |
|---|---|
| Estado | Hecha |
| Fase | F1 |
| Depende de | 0000 (art. I), 0001 (FR-0001-30 a 32), 0002, D-5 |
| Plan | [0004/plan.md](../0004-vestibulo/plan.md) |
| Creada | 2026-11-20 |

## Por qué

Un headhunter que busca un director dedica segundos a cada perfil y casi siempre reenvía un
documento a su cliente. El gabinete tiene que dejarse leer como un CV sobrio en un clic, y
dar un CV imprimible que salga de los mismos datos, para que nunca se contradigan.

## Historias

- Como **headhunter**, quiero apagar la museografía y ver el perfil en una columna, para
  decidir rápido si presento a Edrei.
- Como **headhunter**, quiero imprimir o guardar en PDF un CV limpio, para mandárselo a mi
  cliente.
- Como **Edrei**, quiero que el CV se actualice solo al agregar una pieza, para no mantener
  dos documentos.

## Requisitos

| ID | Requisito | Prioridad |
|---|---|---|
| FR-0003-01 | Toda página DEBE tener el interruptor **Ficha rápida** en la cabecera. Al activarlo, la página cambia a una columna, sin texturas ni animaciones, con tipografía de lectura. | Debe |
| FR-0003-02 | La preferencia DEBE recordarse entre páginas en el mismo navegador. Si el navegador no guarda datos, el interruptor sigue funcionando en la página actual. | Debe |
| FR-0003-03 | DEBE existir `/cv`: título, promesa, pruebas, contacto, trayectoria, formación, publicaciones, reconocimientos, docencia destacada e idiomas, todo generado desde el contenido. | Debe |
| FR-0003-04 | `/cv` DEBE imprimirse en tamaño carta sin cortes feos, sin cabecera ni pie del sitio, con las ligas visibles como texto. | Debe |
| FR-0003-05 | Sin JavaScript, el interruptor DEBE llevar a `/cv`. | Debe |
| FR-0003-06 | El CV DEBERÍA ofrecerse en PDF generado durante la compilación. | Debería (F3) |
| FR-0003-07 | El CV solo DEBE listar lo que tenga evidencia (constitución, art. II). Las certificaciones sin liga de verificación esperan a la F2. | Debe |

## Criterios de aceptación

- **Dado** cualquier página, **cuando** se activa Ficha rápida y se navega a otra,
  **entonces** la segunda página abre ya en modo ficha.
- **Dado** `/cv`, **cuando** se imprime desde Chrome en tamaño carta, **entonces** no hay
  elementos de navegación y ninguna sección queda partida a la mitad de su título.
- **Dado** que se agrega una entrada en `src/content/registro/`, **cuando** se publica,
  **entonces** aparece en `/cv` sin tocar código.

## No-objetivos

- Formato compatible con sistemas de reclutamiento (ATS) en Word. Si hace falta, otra spec.

## Preguntas abiertas

- **D-5** sigue abierta: mientras no se decida, el contacto público es LinkedIn (y GitHub).

## Cambios

| Fecha | Cambio |
|---|---|
| 2026-11-20 | Creada. |
| 2026-11-20 | Aprobada por Edrei e implementada en la F1. |
