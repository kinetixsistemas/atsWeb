import os
import sys

# 1. Forzamos la ruta base al directorio de trabajo actual de Vercel (/var/task)
# Vercel siempre ejecuta desde la raíz del proyecto.
raiz_proyecto = os.getcwd()

# 2. Inyectamos la raíz al inicio del path de Python
if raiz_proyecto not in sys.path:
    sys.path.insert(0, raiz_proyecto)

# 3. Importamos la app usando la ruta absoluta desde la raíz
from backend.app.main import app

# Vercel ASGI / WSGI necesita el objeto expuesto directamente como 'app' o mapeado
handler = app