from fastapi import FastAPI

app = FastAPI(
    title = "SpendWise AI API",
    description = "AI Powered Personal Finance Assistant",
    version = "0.1.0",
)

@app.get("/")
def root():
    return {"message": "Welcome to SpendWise AI API!"}
