# Dataset de ejercicios

`ejercicios-dataset.json` es la versión reducida del dataset público de ejercicios que carga el catálogo (T01, decisión 41).

* **Origen:** https://github.com/hasaneyldrm/exercises-dataset (1324 registros).
* **Licencia de los datos:** MIT.
* **Media:** los GIF son © Gym visual — https://gymvisual.com/. No se copian al repositorio: solo se enlazan (`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/<gif_url>`) y se muestran siempre con su atribución.
* **Campos que se conservan:** `id`, `name` (inglés), `category`, `equipment`, `target`, `secondary_muscles`, `instrucciones` (el `instructions.es` original), `gif_url` y `attribution`. Se descartan los demás idiomas y campos.
* **Uso:** `yarn seed` lo lee con `CargarDatasetEjercicios` (ruta relativa a la carpeta desde donde se ejecuta). El mapeo al modelo está en `src/modulos/catalogo/CLAUDE.md`.
