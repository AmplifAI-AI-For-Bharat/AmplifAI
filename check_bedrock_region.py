import boto3
import os
from botocore.config import Config
from dotenv import load_dotenv

load_dotenv()

access_key = os.getenv("AWS_ACCESS_KEY_ID")
secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
config = Config(connect_timeout=2, read_timeout=2, retries={'max_attempts': 1})

regions_to_test = ["us-east-1", "us-west-2", "eu-central-1", "ap-northeast-1"]

print("Testing Bedrock Model Access with fast timeout...\n")

for region in regions_to_test:
    try:
        client = boto3.client(
            "bedrock",
            region_name=region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            config=config
        )
        response = client.list_foundation_models(byProvider='Anthropic')
        models = [m['modelId'] for m in response.get('modelSummaries', [])]
        print(f"✅ Region: {region} | Success. Found {len(models)} Anthropic models.")
        
    except Exception as e:
        print(f"❌ Region: {region} | Failed: {type(e).__name__}")
        
print("\nDone.")
