import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(BASE_DIR, "static")),
    name="static",
)

@app.get("/", response_class=HTMLResponse)
def root():
    index_path = os.path.join(BASE_DIR, "static", "index.html")
    with open(index_path, "r", encoding="utf-8") as f:
        return f.read()