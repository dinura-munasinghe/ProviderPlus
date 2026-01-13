from fastapi import FastAPI
from app.routes import chat_routes
from app.routes import analysis_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --- ADD THIS BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows ALL origins (perfect for dev/viva)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)
# ----------------------


app.include_router(chat_routes.router, prefix="/api/ai-chat", tags=["AI Chat"])
app.include_router(analysis_routes.router, prefix="/api/ai-integration", tags=["AI Integration"])


@app.get("/")
def read_root():
    return {"message: Provider+ backend is running!"}

