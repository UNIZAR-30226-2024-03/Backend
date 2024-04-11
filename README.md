# URL acceso a la documentación de la API 
https://playbeat.uksouth.cloudapp.azure.com/api-docs

# Configuración del entorno de desarrollo
Instalaremos la extensión [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). La utilizaremos para corregir la sintaxis y el estilo del código en el proyecto.

# A tener en cuenta
Antes de hacer un commit, nos aseguraremos de la corrección del código y de que mantenga las reglas de estilo establecidas.
- `npm run format` ejecutara prettier, un formateador que usaremos para mantener consistente el código.
- `npm run lint` ejecutará ESLint, que destaca errores en el código. Para arreglarlos, añadir la opción `--fix` al comando.
- `npm run start` compilará el código typescript del proyecto, lo que generará código javascript. Este se situará en el directorio "/dist". El propio comando lanzará index.js, la raíz del servidor web.