import uvicorn
import sys

if __name__ == "__main__":
    is_frozen = getattr(sys, 'frozen', False)
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=not is_frozen)
