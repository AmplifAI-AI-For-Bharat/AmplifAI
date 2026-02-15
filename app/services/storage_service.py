import boto3
import json
import logging
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    def __init__(self):
        self.s3_client = None
        self.bucket_name = settings.S3_BUCKET_NAME
        
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                self.s3_client = boto3.client(
                    's3',
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                )
                logger.info(f"✅ S3 Client Initialized (Bucket: {self.bucket_name})")
            except Exception as e:
                logger.error(f"⚠️ Failed to initialize S3 Client: {e}")
        else:
            logger.warning("⚠️ AWS Credentials not found. S3 Storage disabled.")

    def check_video_exists(self, video_id: str) -> bool:
        """
        Checks if a video already exists in the S3 'Pantry'.
        """
        if not self.s3_client:
            return False

        try:
            key = f"videos/{video_id}.json"
            self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            logger.info(f"🔍 Cache Hit: {video_id} found in S3.")
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == "404":
                return False
            logger.error(f"Error checking S3 existence: {e}")
            return False

    def upload_video_data(self, video_data: dict) -> bool:
        """
        Uploads video metadata and transcript to S3.
        Formatted for Amazon Q ingestion (JSON Lines friendly structure).
        """
        if not self.s3_client:
            return False

        video_id = video_data.get('video_id')
        if not video_id:
            return False

        try:
            key = f"videos/{video_id}.json"
            
            # Add timestamp for "Internet Archaeology"
            import datetime
            video_data['_ingested_at'] = datetime.datetime.utcnow().isoformat()
            
            # Convert to JSON
            json_body = json.dumps(video_data, default=str)
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=json_body,
                ContentType='application/json'
            )
            logger.info(f"📦 Uploaded {video_id} to S3 Pantry.")
            return True
            
        except Exception as e:
            logger.error(f"Failed to upload to S3: {e}")
            return False

    def soft_delete_video(self, video_id: str) -> bool:
        """
        Marks a video as 'deleted' in S3 without removing the file.
        Amazon Q connector should be configured to filter out 'status': 'deleted'.
        """
        if not self.s3_client:
            return False
            
        try:
            # 1. Get existing data
            data = self.get_video_data(video_id)
            if not data:
                return False
                
            # 2. Update status
            data['status'] = 'deleted'
            data['_last_updated'] = datetime.datetime.utcnow().isoformat()
            
            # 3. Save back
            return self.upload_video_data(data)
            
        except Exception as e:
            logger.error(f"Failed to soft-delete {video_id}: {e}")
            return False

    def get_video_data(self, video_id: str) -> dict:
        """
        Retrieves video data from S3.
        """
        if not self.s3_client:
            return None

        try:
            key = f"videos/{video_id}.json"
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
            content = response['Body'].read().decode('utf-8')
            return json.loads(content)
        except Exception as e:
            logger.error(f"Failed to read from S3: {e}")
            return None
