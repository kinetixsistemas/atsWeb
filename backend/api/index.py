import os
import sys

# Conseguimos la raíz del servicio actual
raiz_servicio = os.getcwd()

if raiz_servicio not in sys.path:
    sys.path.insert(0, raiz_servicio)

# Corrección: Ya estás DENTRO de la carpeta backend,
# por lo tanto 'app' está en la raíz de la búsqueda.
from app.main import app

handler = app