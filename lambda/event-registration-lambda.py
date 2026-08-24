import json
import boto3
from datetime import datetime, timezone

s3 = boto3.client("s3")

BUCKET_NAME = "event-announcement-data-anuj"
FILE_KEY = "events.json"


# CORS headers
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
}


def lambda_handler(event, context):

    try:

        # Detect HTTP method
        method = event.get("requestContext", {}).get("http", {}).get("method")

        # Fallback for REST API / older API Gateway format
        if not method:
            method = event.get("httpMethod", "POST")

        method = method.upper()

        print("HTTP Method:", method)


        # =========================================================
        # OPTIONS REQUEST - CORS
        # =========================================================

        if method == "OPTIONS":

            return {
                "statusCode": 204,
                "headers": CORS_HEADERS,
                "body": ""
            }


        # =========================================================
        # GET /events
        # Read events.json from S3
        # =========================================================

        if method == "GET":

            print("GET request received - reading events.json")

            response = s3.get_object(
                Bucket=BUCKET_NAME,
                Key=FILE_KEY
            )

            data = json.loads(
                response["Body"].read().decode("utf-8")
            )

            print("Events loaded:", data)

            return {
                "statusCode": 200,
                "headers": {
                    **CORS_HEADERS,
                    "Content-Type": "application/json"
                },
                "body": json.dumps(data)
            }


        # =========================================================
        # POST /events
        # Create a new event
        # =========================================================

        if method == "POST":

            print("POST request received")

            # Get request body
            body = event.get("body", "{}")

            if isinstance(body, str):
                body = json.loads(body)

            # Get event details
            title = body.get("title")
            date = body.get("date")
            description = body.get("description")

            # Validate required fields
            if not title or not date:

                return {
                    "statusCode": 400,
                    "headers": CORS_HEADERS,
                    "body": json.dumps({
                        "message": "Title and date are required."
                    })
                }


            # Read existing events.json
            response = s3.get_object(
                Bucket=BUCKET_NAME,
                Key=FILE_KEY
            )

            data = json.loads(
                response["Body"].read().decode("utf-8")
            )


            # Create new event
            new_event = {
                "id": len(data.get("events", [])) + 1,
                "title": title,
                "date": date,
                "description": description,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }


            # Add new event
            data.setdefault("events", []).append(new_event)


            # Update events.json in S3
            s3.put_object(
                Bucket=BUCKET_NAME,
                Key=FILE_KEY,
                Body=json.dumps(data, indent=2),
                ContentType="application/json"
            )


            print("New event created:", new_event)


            return {
                "statusCode": 200,
                "headers": CORS_HEADERS,
                "body": json.dumps({
                    "message": "Event created successfully.",
                    "event": new_event
                })
            }


        # =========================================================
        # Unsupported HTTP method
        # =========================================================

        return {
            "statusCode": 405,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "message": "Method not allowed."
            })
        }


    except Exception as e:

        print("ERROR:", str(e))

        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "message": "Internal server error.",
                "error": str(e)
            })
        }
