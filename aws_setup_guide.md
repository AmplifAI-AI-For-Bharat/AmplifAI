# AWS Setup Guide for AmplifAI 🚀

This guide will walk you through setting up your AWS account and obtaining the necessary credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) to run AmplifAI's AI features.

## 1. Create an AWS Account (If you don't have one)
1.  Go to [aws.amazon.com](https://aws.amazon.com/).
2.  Click **Create an AWS Account**.
3.  Follow the meaningful steps to set up your account. You will need a credit card for verification, even for the free tier.

## 2. Create an IAM User
It is best practice **not** to use your root account keys. Instead, create a dedicated IAM user.

1.  Log in to the **AWS Management Console**.
2.  Search for **IAM** in the top search bar and click it.
3.  Click **Users** in the left sidebar, then click **Create user**.
4.  **User details**:
    *   **User name**: `amplifai-user` (or any name you prefer).
    *   Click **Next**.

5.  **Permissions**:
    *   Select **Attach policies directly**.
    *   Search for and select the following policies (check the box next to them):
        *   `AmazonBedrockFullAccess` (Required for AI generation)
        *   `AmazonS3FullAccess` (Required for file storage)
    *   *Note: For production, you should create more restrictive custom policies, but these are fine for getting started.*
    *   Click **Next**.

6.  **Review**:
    *   Review the details and click **Create user**.

## 3. Generate Access Keys
1.  Click on the newly created user (`amplifai-user`) in the list.
2.  Go to the **Security credentials** tab.
3.  Scroll down to the **Access keys** section and click **Create access key**.
4.  **Access key best practices**:
    *   Select **Application running outside AWS** (or "Local code").
    *   Click **Next**.
    *   (Optional) Set a description tag like "For AmplifAI Project".
    *   Click **Create access key**.

5.  **✨ IMPORTANT**:
    *   You will see your **Access key** and **Secret access key**.
    *   **COPY THESE NOW**. You cannot see the Secret access key again after you close this page.
    *   (Optional) Download the .csv file for safekeeping.

## 4. Enable Model Access (Bedrock)
AWS Bedrock models are not enabled by default. You must request access.

1.  Search for **Bedrock** in the AWS Console search bar.
2.  In the left sidebar, click **Model access** (usually at the bottom).
3.  Click **Manage model access** (orange button).
4.  Check the box for **Anthropic** -> **Claude 3 Sonnet**.
    *   *Note: You may need to submit a use case form for some models. It is usually approved instantly.*
5.  Click **Request model access**.

## 5. Update Your `.env` File
Open the `.env` file in this project and paste your keys:

```ini
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  <-- Paste Access Key
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY <-- Paste Secret Key
AWS_REGION=us-east-1  <-- Ensure this matches the region where you enabled Bedrock (usually us-east-1)
```

## 6. S3 Setup (Optional)
If you want to use S3 for storage:
1.  Search for **S3** in the console.
2.  Click **Create bucket**.
3.  Name it `hyperbolic-pantry` (or whatever you put in your `.env` for `S3_BUCKET_NAME`).
4.  Select the **same region** as your API keys (e.g., `us-east-1`).
5.  Click **Create bucket**.

---

🎉 **You're all set!** Restart your backend server (`uvicorn`) to load the new keys.
