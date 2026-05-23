"""\nAI E-Commerce SaaS - FastAPI Backend Entry Point\nAuthor: selvinjoy\n"""\n
from fastapi import FastAPI\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom contextlib import asynccontextmanager\nimport uvicorn\n
from api.routes import pipelines, gateway, products, analytics\n

@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    # Startup\n    print("AI E-Commerce SaaS backend starting...")\n    yield\n    # Shutdown\n    print("AI E-Commerce SaaS backend shutting down...")\n

app = FastAPI(\n    title="AI E-Commerce SaaS",\n    description="Autonomous e-commerce pipeline automation with HITL gateways",\n    version="0.1.0",\n    lifespan=lifespan,\n)\n
# CORS\napp.add_middleware(\n    CORSMiddleware,\n    allow_origins=["http://localhost:5173", "http://localhost:3000"],\n    allow_credentials=True,\n    allow_methods=["*"],\n    allow_headers=["*"],\n)\n
# Routers\napp.include_router(pipelines.router, prefix="/api/v1/pipelines", tags=["Pipelines"])\napp.include_router(gateway.router, prefix="/api/v1/gateway", tags=["Gateways"])\napp.include_router(products.router, prefix="/api/v1/products", tags=["Products"])\napp.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])\n

@app.get("/health", tags=["Health"])\nasync def health_check():\n    return {"status": "ok", "service": "ai-ecommerce-saas"}\n

if __name__ == "__main__":\n    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
