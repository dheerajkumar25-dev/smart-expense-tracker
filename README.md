# Smart Expense Tracker

A full-stack MERN application for managing expenses and tracking budget.

## Features

- **Authentication**: JWT-based Signup/Login.
- **Dashboard**: Visual analytics with charts (Chart.js) showing expense distribution and totals.
- **Expense Management**: Add, edit, and delete expenses with category and date support.
- **Export**: Download your expense history as a CSV file.
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Chart.js, Axios, React Router.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt.

## Getting Started

### Prerequisites

- Node.js installed.
- MongoDB installed and running locally on port 27017.

### Installation

1.  **Clone the repository** (if applicable).

2.  **Setup Backend**:
    ```bash
    cd server
    npm install
    # Create .env file with:
    # MONGO_URI=mongodb://localhost:27017/expense_tracker
    # JWT_SECRET=your_secret_key
    # PORT=5000
    npm run dev
    ```

3.  **Setup Frontend**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:5173`.

## Screenshots

*(Add screenshots here)*
