# **E-Commerce Application by 3TG**

A comprehensive e-commerce web application built using **Express.js** with the **MVC (Model-View-Controller)** architecture. This project provides functionalities for managing products, users, orders, and authentication, designed for scalability and maintainability.

---

## **Features**

- **User Authentication and Authorization**
  - Sign up, login, and logout.
  - Role-based access (admin and customer).
  
- **Product Management**
  - Admin: Add, update, delete products.
  - Customers: Browse, search, and view product details.

- **Shopping Cart**
  - Add/remove products to/from the cart.
  - Update quantities.

- **Order Management**
  - Place orders with a summary of items.
  - Track order status.

- **Admin Dashboard**
  - Manage users, products, and orders.

- **Database Integration**
  - MongoDB for storing user, product, and order data.

---

## **Technologies Used**

- **Backend:**
  - [Express.js](https://expressjs.com/) (Node.js framework)
  - [MongoDB](https://www.mongodb.com/) with Mongoose for database operations
  - [JWT](https://jwt.io/) for authentication
  - [bcrypt.js](https://github.com/kelektiv/node.bcrypt.js) for password hashing

- **Frontend:**
  - EJS (Embedded JavaScript) templates for server-side rendering

- **Tools and Utilities:**
  - Nodemon for live-reloading during development
  - dotenv for environment variable management

---

## **Project Structure**

```plaintext
e-commerce/
├───app
│   ├───common # Common functions for the project
│   ├───controllers # Controllers for the project
│   ├───helpers # Helper functions for the project
│   ├───middleware # Middleware for the project
│   ├───models # Models for the project
│   ├───routes # Routes for the project
│   ├───utilities # Utilities for the project
│   └───views # Views for the project   
├───config # Configuration for the project
├───public # Public assets for the project
│   ├───components
│   ├───images
│   └───js
└───test
```

---

## **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/e-commerce.git
   cd e-commerce
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```plaintext
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_jwt_secret
   ```

4. Start the application:
   ```bash
   npm start
   ```
   or
   ```bash
   docker-compose up --build
   ```
   Visit the app at [http://localhost:3000](http://localhost:3000).

---

## **Usage**

---

## **License**

This project is licensed under the [MIT License](LICENSE).

---

## **Future Enhancements**

- Integrate payment gateway (e.g., Stripe, PayPal).
- Add real-time notifications for orders.
- Implement product reviews and ratings.
