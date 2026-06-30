import os
import sys
import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings
from app.api.v1.analysis import router as analysis_router
from app.api.v1.cv_extractions import router as cv_extractions_router
from app.api.v1.templates import router as templates_router
from app.api.v1.subscriptions import router as subscriptions_router
from app.api.v1.users import router as users_router

logging.basicConfig(
    level=logging.INFO if settings.debug else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

_rate_limit_store: dict[str, list[float]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('Starting %s v%s', settings.app_name, settings.version)
    _rate_limit_store.clear()
    yield
    logger.info('Shutting down')


app = FastAPI(
    title=settings.app_name,
    description='ATS Personal API con Supabase',
    version=settings.version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.middleware('http')
async def rate_limit_middleware(request: Request, call_next):
    if not request.url.path.startswith('/api/'):
        return await call_next(request)

    client_ip = request.client.host if request.client else 'unknown'
    now = time.time()

    if client_ip not in _rate_limit_store:
        _rate_limit_store[client_ip] = []

    _rate_limit_store[client_ip] = [
        t for t in _rate_limit_store[client_ip] if now - t < 60
    ]

    if len(_rate_limit_store[client_ip]) >= settings.rate_limit_per_minute:
        logger.warning('Rate limit exceeded for %s', client_ip)
        return JSONResponse(
            status_code=429,
            content={'detail': 'Demasiadas solicitudes. Intenta de nuevo en un minuto.'}
        )

    _rate_limit_store[client_ip].append(now)
    return await call_next(request)


app.include_router(analysis_router, prefix='/api/v1')
app.include_router(cv_extractions_router, prefix='/api/v1/cv-extractions')
app.include_router(templates_router, prefix='/api/v1')
app.include_router(subscriptions_router, prefix='/api/v1')
app.include_router(users_router, prefix='/api/v1')


@app.get('/health')
async def health():
    return {'status': 'healthy', 'version': settings.version}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=False)
