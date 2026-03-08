from mangum import Mangum
from app.main import app

# This is the entrypoint for AWS Lambda.
# Mangum acts as an adapter between API Gateway (or ALB) and FastAPI.
handler = Mangum(app, lifespan="off")
