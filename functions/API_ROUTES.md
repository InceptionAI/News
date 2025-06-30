# InceptionAI News API Routes

This document describes the organized API structure for the InceptionAI News application.

## API Structure

The API has been refactored into modular routes for better organization and maintainability:

```
/api/
├── articles/     # Article management
├── images/       # Image operations
├── publishing/   # Publishing and unpublishing
├── posts/        # Social media posts
└── admin/        # Administrative operations
```

## Route Details

### Articles (`/api/articles/`)
- `POST /createNewArticle` - Create a new article

### Images (`/api/images/`)
- `POST /update-image` - Update article image
- `POST /save-image-storage` - **NEW** Save image directly to storage

### Publishing (`/api/publishing/`)
- `POST /publish` - Publish an article
- `POST /unpublish` - Unpublish an article

### Posts (`/api/posts/`)
- `POST /get-linkedin-post` - Generate LinkedIn post
- `POST /send-post-to-email` - Send post via email

### Admin (`/api/admin/`)
- `DELETE /deleteUnpublishedArticle` - Delete unpublished article
- `GET /update-chart-dataset` - Update chart dataset
- `POST /update-next-ideas` - Update next ideas
- `POST /get-translations` - Get article translations
- `GET /get-100-ideas` - Generate 100 ideas
- `POST /setup-client` - Setup new client
- `POST /finish-setup` - Finish client setup
- `POST /updateNextIdeas` - Update next ideas (legacy)
- `POST /trigger-daily-cronjob` - Trigger daily cron job

## New Endpoint: Save Image Storage

### `POST /api/images/save-image-storage`

Saves an image from a URL directly to Firebase Storage.

#### Request Body:
```json
{
  "url": "https://example.com/image.png",
  "clientId": "client123",
  "subject": "Article Title"
}
```

#### Response:
```json
{
  "success": true,
  "publicUrl": "https://storage.googleapis.com/...",
  "message": "Image saved successfully"
}
```

#### Parameters:
- `url` (string, required): The URL of the image to save
- `clientId` (string, required): The client identifier
- `subject` (string, required): The subject/title for naming the image file

## Legacy Support

All endpoints are still available at their original paths for backward compatibility:
- `/createNewArticle` → Also available at `/api/articles/createNewArticle`
- `/update-image` → Also available at `/api/images/update-image`
- etc.

## Health Check

- `GET /ping` - Returns "Pong" for health checking

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing parameters, invalid data)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Usage Examples

### Save Image Storage
```bash
curl -X POST http://localhost:3000/api/images/save-image-storage \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/my-image.png",
    "clientId": "abc123",
    "subject": "My Article Title"
  }'
```

### Create New Article
```bash
curl -X POST http://localhost:3000/api/articles/createNewArticle \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about AI trends",
    "clientId": "abc123",
    "lang": "en",
    "chart": true
  }'
```
