# Inventario de repositorios

> **Revisión del 2026-11-27 (spec 0016):** `second-brain`, `claude-for-business`, el kit de la
> Sesión 7 y las simulaciones de física ya se exhiben. `gym-app` queda fuera porque trae datos de
> otra persona. `mapa-red-funciones-ia`, `entrevista` y `cerebro-CREA` esperan respuesta de Edrei
> (D-12). Las utilidades menores salen del Acervo. La curaduría vigente está en
> [la spec 0016](../specs/0016-proyectos-al-centro/spec.md).

Levantado el 2026-11-20 a partir de los repos **públicos** de Edrei: su README y, si existe,
su página publicada. Los repos privados no se listan aquí porque este repositorio es público
(ver decisión D-4 en `specs/README.md`).

**Alcance:** solo trabajo personal de Edrei. Nada del trabajo institucional de su empleo
actual (decisión del 2026-11-20 en `specs/README.md`).

**Resumen:** 37 repos públicos (uno es de Axon Labs) → 6 piezas destacadas, 4 de colección,
2 series que agrupan 15 repos, 5 para el Acervo y 7 que quedan fuera.

## Veredictos

| Veredicto | Significa |
|---|---|
| ★ **Destacada** | Vitrina principal del Vestíbulo. Máximo seis. |
| **Colección** | Pieza con vitrina propia en su sala. |
| **Serie** | Varios repos se exhiben juntos como una sola pieza. |
| **Acervo** | Aparece en el índice completo, sin vitrina propia. |
| **Fuera** | No se muestra. |

## ★ Destacadas

| Repo | Qué es | En vivo | Sala | Por qué |
|---|---|---|---|---|
| `entrenamiento-redes-neuronales` | *Mátala si puedes*: una mosca cuyo circuito de escape (1,408 neuronas, 4,972 sinapsis de *Drosophila*) corre en el navegador y aprende de cada golpe. | [sí](https://edreirbs.github.io/entrenamiento-redes-neuronales/) | Artificialia | Es la pieza más memorable. Neurociencia real, juego y simulación a 2,000 pasos por segundo. Candidata a **ejemplar vivo** del Vestíbulo (D-7). |
| `tracky` | Grabadora de juntas y organizador de tareas para personas con TDAH: Whisper local, resúmenes con Claude, economía de monedas y chat sobre tus notas. | no | Artificialia | Producto completo con specs 001–005, ADR, Supabase con RLS y el audio que nunca sale de la computadora. Muestra producto, privacidad y método. |
| `conten-agents` | Motor de contenido para Axon Labs: GitHub Actions selecciona temas de fuentes RSS, redacta blog y post de LinkedIn con IA y publica. | [sí](https://edreirbs.github.io/conten-agents/) | Artificialia | Automatización con agentes en producción, con modo seguro (redacción de datos sensibles) y fallas honestas. |
| `mapa-red-funciones-ia` | Mapa interactivo y editable en grupo de la taxonomía funcional de la IA: guardado automático, sincronización, deshacer, exportar. | [sí](https://edreirbs.github.io/mapa-red-funciones-ia/) | Artificialia | Pensamiento sistémico sobre IA y una herramienta colaborativa real. Mostrar captura y liga, no incrustar la versión editable. **Confirmar que es personal.** |
| `second-brain` | Tablero de dos *vaults* de notas, cifrado con AES-256 y PBKDF2 (250,000 vueltas) que se descifra en el navegador. | candado | Artificialia | Gestión del conocimiento con seguridad seria. Se muestra la arquitectura y la pantalla de candado, nunca el contenido. |
| `claude-for-business` | Material del curso *Claude for Business* en la Universidad Panamericana: ocho sesiones de 150 minutos para participantes no técnicos, fichas de repaso y cuadernillo. | [sí](https://edreirbs.github.io/claude-for-business/) | Theatrum | Prueba de que Edrei no solo usa la IA: la enseña. |

## Colección

| Repo | Qué es | En vivo | Sala | Pendiente |
|---|---|---|---|---|
| `entrevista` | Capa de gobierno de *Entrevist-IA*: auditoría técnica, proceso spec-driven y backlog de un producto de otro equipo. | no | Artificialia | Confirmar el rol de Edrei y si el equipo autoriza mostrarlo. |
| `demo-revit-copilot` | Demo de un copiloto para Revit (Axon Labs). | no | Artificialia | Sin README. Descripción, captura o video. |
| `cerebro-CREA` | Sin README. | no | — | ¿Qué es? ¿Es personal? |
| `DCL` | Sin README. | no | — | ¿Qué es? |

## Series

| Serie | Repos | Sala | Por qué agrupar |
|---|---|---|---|
| **Kit de la Sesión 7: Claude Code en la nube** | `plantilla-pagina-s7`, `plantilla-lanzamiento-s7`, `plantilla-ocso-s7`, `plantilla-junta-atn-s7`, `plantilla-registro-junta-s7`, `junta-atn`, `registro-junta`, `ejemplo-s7-edrei`, `s7-demo-edrei`, `comprobador-s7` | Theatrum | Diez repos de una misma clase: plantillas con skills, subagentes revisores, esquemas de Supabase y un comprobador. Juntos cuentan una pedagogía; separados parecen relleno. |
| **Gabinete de física (2023)** | `teorema-limite-central`, `nobel-fisica-2023`, `simulacion-mas`, `mas`, `graph` | Exotica | Simulaciones de divulgación: el teorema del límite central en investigación educativa, el experimento del Nobel de Física 2023, movimiento armónico simple y una calculadora científica. Encajan con el espíritu del gabinete. |

## Acervo

| Repo | Qué es | Nota |
|---|---|---|
| `qr` | Generador de códigos QR | Utilidad pequeña |
| `chatbot-amira` | Chatbot temático (zodiaco) | 2024 |
| `editor-texto-linkedin` | Editor de texto para LinkedIn | 2023, sin README |
| `cv-nao` | Preguntas y respuestas sobre un documento con Streamlit | Parte de una plantilla pública |
| `link-whisper-edreirobles` | App generada con Lovable (React, TypeScript) | Falta saber qué hace |

## Fuera

| Repo | Por qué |
|---|---|
| `mda`, `herramientas-vertical`, `herramientas_horizontal` | Trabajo institucional del empleo: fuera de alcance. |
| `gym-app` | Personal. |
| `DataScienceInteractivePython` | Fork: no es trabajo propio. |
| `generative-ai-for-beginners` | Fork: no es trabajo propio. |
| `portafolio` | Es este sitio. |

## Lo que el inventario no ve

Los repos no cuentan toda la historia. Faltan certificaciones, cursos, estudios, experiencia,
docencia fuera de GitHub, reconocimientos y los proyectos privados. Ver `intake.md`.
