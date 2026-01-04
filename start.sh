#!/bin/bash
python3 hasker.py

chmod +x start.sh

#!/bin/bash
uvicorn main:app --host 0.0.0.0 --port 8000