# Ranger Reporting App

## Overview

The Ranger Reporting App is a full-stack web application designed to streamline incident reporting for rangers and provide administrative oversight. Rangers can submit detailed reports, including images and location data, while administrators can manage ranger accounts, approve pending requests, and monitor all submitted reports. The application features automated email notifications for account status changes, enhancing communication between administrators and rangers.

## Features

*   **User Authentication:** Secure login and registration for both Ranger and Admin roles.
*   **Ranger Dashboard:**
    *   Submit new incident reports with title, description, and image attachments.
    *   Automatically extract latitude and longitude from image EXIF data.
    *   View a list of reports assigned to them and reports they have submitted.
    *   Edit existing reports (description, image) and mark them as resolved.
    *   "Resolved" reports are clearly tagged.
*   **Admin Dashboard:**
    *   Comprehensive view of all submitted reports.
    *   Manage ranger accounts: approve pending registrations, disable existing rangers.
    *   Automated email notifications to rangers upon account approval or disablement (powered by Brevo).
*   **Image Management:** Secure image uploads and storage via Cloudinary.
*   **Location Tracking:** Integration with Leaflet for map visualization of report locations.

## Tech Stack

The application is built using a modern MERN-like stack (without MongoDB) with Supabase as the primary database.

### Frontend (Client)

*   **React.js:** A JavaScript library for building user interfaces, powered by Vite for a fast development experience.
*   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
*   **React Router DOM:** For declarative routing within the single-page application.
*   **Leaflet & React-Leaflet:** An open-source JavaScript library for mobile-friendly interactive maps, integrated with React.
*   **Exifr:** A lightweight library for extracting EXIF data (including GPS coordinates) from images.
*   **Supabase JS Client:** Client-side library for interacting with the Supabase backend.

### Backend (Server)

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
*   **Supabase JS Client:** Server-side library for interacting with the Supabase backend.
*   **Bcrypt:** For hashing and salting passwords securely.
*   **JSON Web Token (JWT):** For secure user authentication and authorization.
*   **Multer:** A Node.js middleware for handling `multipart/form-data`, primarily used for file uploads.
*   **Cloudinary:** A cloud-based image and video management service for uploading and serving media.
*   **Dotenv:** Loads environment variables from a `.env` file.
*   **@getbrevo/brevo (formerly `sib-api-v3-sdk`):** Official Node.js library for interacting with the Brevo (Sendinblue) email API.

### Database

*   **Supabase:** An open-source Firebase alternative providing a PostgreSQL database, authentication, instant APIs, and real-time subscriptions.

## Installation and Local Usage

To set up and run the Ranger Reporting App locally, follow these steps:

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)
*   Git

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Ranger-app
```

### 2. Supabase Setup

1.  **Create a Supabase Project:** Go to [Supabase](https://supabase.com/) and create a new project.
2.  **Get Project URL and Anon Key:** From your project settings, find your Project URL and `anon` public key.
3.  **Database Schema:** You will need to set up the following tables and columns in your Supabase project. Ensure you configure Row Level Security (RLS) policies as needed for secure data access.

    *   **`users` table:** Stores general user information.
        *   `id` (UUID, Primary Key)
        *   `name` (Text)
        *   `email` (Text, Unique)
        *   `password` (Text) - Hashed password
        *   `role` (Text) - e.g., 'ranger', 'admin'
    *   **`rangers` table:** Stores details for approved rangers.
        *   `id` (UUID, Primary Key) - Should match `users.id`
        *   `name` (Text)
        *   `email` (Text, Unique)
        *   `password` (Text) - Hashed password
        *   `phone` (Text, Optional)
        *   `status` (Text) - e.g., 'active', 'disabled'
    *   **`pending_ranger_requests` table:** Stores requests from rangers awaiting admin approval.
        *   `id` (UUID, Primary Key)
        *   `ranger_id` (UUID) - Temporary ID for pending requests
        *   `name` (Text)
        *   `email` (Text, Unique)
        *   `password_hash` (Text) - Hashed password
    *   **`ranger_reports` table:** Stores incident reports.
        *   `id` (UUID, Primary Key)
        *   `title` (Text)
        *   `description` (Text)
        *   `latitude` (Numeric)
        *   `longitude` (Numeric)
        *   `image_url` (Text) - URL of the uploaded image
        *   `user_id` (UUID) - Foreign key to `users.id` (the ranger who submitted it)
        *   `assigned_to` (UUID, Optional) - Foreign key to `rangers.id` (if assigned to a specific ranger)
        *   `status` (Text) - e.g., 'New', 'Monitoring', 'resolved'
        *   `condition` (Text) - e.g., 'Good', 'Moderate', 'Bad'
        *   `notes` (Text, Optional)
        *   `created_at` (Timestamp with Time Zone, Default: `now()`)

### 3. Cloudinary Setup

1.  **Create a Cloudinary Account:** Go to [Cloudinary](https://cloudinary.com/) and sign up for a free account.
2.  **Get API Credentials:** From your Cloudinary dashboard, note down your `Cloud Name`, `API Key`, and `API Secret`. These will be used by the server to upload images.

### 4. Brevo (Email) Setup

1.  **Create a Brevo Account:** Go to [Brevo](https://www.brevo.com/) (formerly Sendinblue) and sign up.
2.  **Generate API Key:**
    *   Navigate to "SMTP & API" -> "API Keys".
    *   Generate a **new API Key (v3)**. Copy this key carefully.
3.  **Verify Sender Email:**
    *   Navigate to "Senders & IPs" -> "Senders".
    *   Add and verify the email address you want to use as the `ADMIN_EMAIL` (e.g., `emailrangerapp@gmail.com`). This is crucial for emails to be sent successfully.

### 5. Backend (Server) Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:** In the `server` directory, create a file named `.env` and add the following environment variables. Replace the placeholder values with your actual credentials obtained in the previous steps.

    ```
    SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    SUPABASE_KEY="YOUR_SUPABASE_ANON_KEY"
    JWT_SECRET="A_STRONG_RANDOM_SECRET_KEY_FOR_JWT" # e.g., generated by `openssl rand -base64 32`
    CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
    CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
    CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"
    BREVO_API_KEY="YOUR_BREVO_V3_API_KEY"
    ADMIN_EMAIL="your_verified_admin_email@example.com" # Must be verified in Brevo
    ```
4.  **Start the server:**
    ```bash
    node index.js
    # Or using nodemon for development: nodemon index.js
    ```
    The server will run on `http://localhost:5050`.

### 6. Frontend (Client) Setup

1.  **Navigate to the client directory:**
    ```bash
    cd ../client
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:** In the `client` directory, create a file named `.env` and add the following environment variables.

    ```
    VITE_BACKEND_URL="http://localhost:5050" # Or your deployed backend URL
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```
4.  **Start the client:**
    ```bash
    npm run dev
    ```
    The client will typically open in your browser at `http://localhost:5173` (or another available port).

## Usage

1.  **Register as a Ranger:** Access the app in your browser and use the registration form to create a new ranger account.
2.  **Admin Approval:** Log in as an administrator (you'll need to manually create an admin user in your Supabase `users` table with `role: 'admin'`). Go to the "Rangers" tab in the admin dashboard to approve pending ranger requests.
3.  **Ranger Login:** Once approved, rangers can log in and start submitting reports.
4.  **Report Management:** Rangers can view and edit their reports, while admins can see all reports and manage ranger accounts.

## Automated Email Notifications

The application is configured to send automated email notifications to rangers when their account status is changed by an administrator.

*   **Approval Email:** When an admin approves a pending ranger request, an email is sent to the ranger notifying them that their account has been enabled.
*   **Disablement Email:** If an admin disables an active ranger account, an email is sent to the ranger informing them of the change and providing the admin's contact email for inquiries.

These emails are sent via the Brevo API, ensuring reliable delivery. The `ADMIN_EMAIL` configured in your server's environment variables is used as the sender, and the `BREVO_API_KEY` authenticates the requests to Brevo.

---
