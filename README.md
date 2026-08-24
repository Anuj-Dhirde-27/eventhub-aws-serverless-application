🚀 EventHub – Serverless Event Announcement Platform

📌 Project Overview

I built EventHub, a serverless event announcement platform using AWS services. The application allows users to view upcoming events, subscribe for event notifications, and create new events through a web interface.

I designed the application to demonstrate how multiple AWS managed services can be integrated into a serverless, API-driven architecture without managing traditional backend servers.

The project uses Amazon S3, Amazon API Gateway, AWS Lambda, Amazon SNS, and IAM.

🏗️ Architecture

Application Flow
                    ┌──────────────────┐
                    │   S3 Static      │
                    │     Website      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   API Gateway    │
                    └───────┬──────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
        ┌─────────────────┐   ┌──────────────────┐
        │ Subscription    │   │ Event Registration│
        │ Lambda          │   │ Lambda            │
        └────────┬────────┘   └─────────┬─────────┘
                 │                      │
                 ▼                      ▼
        ┌─────────────────┐      ┌──────────────┐
        │      SNS        │      │      S3      │
        │      Topic      │      │ events.json  │
        └────────┬────────┘      └──────────────┘
                 │
                 ▼
              📧 Email


☁️ AWS Services Used

| AWS Service            | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| **Amazon S3**          | Hosted the static website and stored `events.json`  |
| **Amazon API Gateway** | Exposed REST API endpoints for the frontend         |
| **AWS Lambda**         | Implemented subscription and event-management logic |
| **Amazon SNS**         | Handled subscriber notification workflow            |
| **AWS IAM**            | Controlled permissions between AWS services         |
| **Amazon CloudWatch**  | Used for Lambda execution logs and troubleshooting  |

🛠️ What I Built

1. Static Website Hosting
   
I created the EventHub frontend using HTML, CSS, and JavaScript and hosted the static website on Amazon S3.
The website provides three main functions:
View upcoming events
Subscribe for notifications
Create new events
I configured the frontend to communicate with the backend through API Gateway rather than directly accessing AWS services.
Technologies: HTML · CSS · JavaScript · Amazon S3

2. Subscriber Notification System
I created a Subscription Lambda function using Python to handle subscriber registration.
I integrated the Lambda function with an Amazon SNS topic so that the application could trigger the notification workflow.

The flow is:
Website
   ↓
API Gateway
   ↓
Subscription Lambda
   ↓
SNS Topic
   ↓
Email Notification

3. Event Registration
I created a separate Event Registration Lambda function using Python.
The function receives event information such as:

Event name
Date
Location
Description

It then reads the existing events.json file from S3, adds the new event, and writes the updated JSON file back to the bucket.

Website
   ↓
API Gateway
   ↓
Event Registration Lambda
   ↓
S3
   ↓
events.json

4. REST API Integration

I created API Gateway endpoints to connect the frontend with the Lambda functions.

Subscriber API
POST /subscribers
Used to submit subscriber information and trigger the SNS notification workflow.

Event Creation API
POST /events
Used to create and store a new event.

Event Retrieval API
GET /events

Used by the website to retrieve the stored events and display them in the Upcoming Events section.

🔐 IAM & CORS Configuration

I configured IAM permissions required for the Lambda functions to communicate with the appropriate AWS services.
For example, the Event Registration Lambda requires permission to:
s3:GetObject
s3:PutObject
I also configured CORS in API Gateway so that the S3-hosted frontend could securely communicate with the API endpoints from the browser.

🧪 Testing & Validation

I tested the application from both the AWS console and the frontend.
Subscription Flow

I verified that:

Email entered
     ↓
API Gateway
     ↓
Subscription Lambda
     ↓
SNS
     ↓
Email notification

was successfully executed.

Event Flow

I created a test event through the website and verified that:

Website
   ↓
POST /events
   ↓
Event Lambda
   ↓
S3
   ↓
events.json updated

I then used the GET /events endpoint to retrieve the updated data and confirmed that the new event appeared dynamically on the website.

📸 Project Screenshots
EventHub Website
API Gateway
Lambda
SNS Notification
Event Data in S3

🎯 Key AWS Concepts Demonstrated

Through this project, I gained practical experience with:

Serverless architecture
Amazon S3 static website hosting
API Gateway REST APIs
AWS Lambda with Python
Amazon SNS notifications
IAM roles and service permissions
CORS configuration
API-to-Lambda integration
Lambda-to-S3 integration
JSON-based data persistence
CloudWatch logging and troubleshooting
Frontend-to-AWS API integration
💡 Key Takeaway

This project gave me hands-on experience designing and integrating a serverless AWS application from frontend to backend, including API design, event-driven processing, service permissions, notification workflows, and troubleshooting cross-service integrations.

It also helped me understand how AWS managed services can be combined to build applications with minimal infrastructure management and independent, loosely coupled components.

📁 Repository Structure
eventhub-aws-serverless/
│
├── README.md
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── lambda/
│   ├── subscription-lambda.py
│   └── event-registration-lambda.py
│
├── architecture/
│   └── eventhub-architecture.png
│
├── screenshots/
│   ├── website.png
│   ├── s3.png
│   ├── api-gateway.png
│   ├── subscription-lambda.png
│   ├── event-lambda.png
│   ├── sns.png
│   └── events-json.png
│
└── demo-video/
    └── eventhub-demo.mp4
