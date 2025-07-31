That's an excellent and very important question. Accessing the admin panel requires two things:

1.  You must be **logged in**.
2.  The user account you log in with must have its `role` set to **`"admin"`**.

By default, the registration page creates all new users with the role of `"voter"`. There is no special "Admin Registration" page in the UI. Therefore, to get your first admin user, you need to **manually promote a registered user to an admin** directly in your MongoDB database.

Here is the step-by-step process:

-----

### **Step 1: Register a User Normally**

First, go to your running frontend application and register a new user through the regular registration page. This is important because it ensures the password is correctly and securely hashed by the backend.

  * Go to `http://localhost:5173/register`
  * Create a user. For example:
      * **Name:** `Admin User`
      * **Email:** `admin@vote.com`
      * **Password:** `a-very-secure-password`

-----

### **Step 2: Find the User in Your MongoDB Database**

Now, you need to connect to your database to edit this new user. The easiest way is with **MongoDB Compass** (the official GUI tool).

1.  Open MongoDB Compass and connect to your database (either your local one or your Atlas cluster).
2.  On the left side, find and click on your database, which should be named **`online-voting-system`**.
3.  Click on the **`users`** collection.
4.  Find the user you just created. You can use the "Filter" bar to search for them by email: `{ "email": "admin@vote.com" }`.

-----

### **Step 3: Change the User's Role to "admin"**

1.  Once you find the user document, click the pencil icon (Edit Document) next to it.

2.  The document will look something like this:

    ```json
    {
      "_id": ObjectId("..."),
      "name": "Admin User",
      "email": "admin@vote.com",
      "password": "a_long_hashed_string...",
      "role": "voter",  // <-- This is the line to change
      "__v": 0
    }
    ```

3.  Change the value of the `role` field from `"voter"` to `"admin"`.

    ```json
    {
      "_id": ObjectId("..."),
      "name": "Admin User",
      "email": "admin@vote.com",
      "password": "a_long_hashed_string...",
      "role": "admin",  // <-- Changed value
      "__v": 0
    }
    ```

4.  Click the green **"Update"** button at the bottom to save your change.

-----

### **Step 4: Log In as the Admin**

That's it\! The user is now an admin.

1.  Go back to your application's login page: `http://localhost:5173/login`.
2.  Log in with the email and password you used in Step 1 (`admin@vote.com` and your password).

The frontend application's logic (`AdminRoute.jsx`) will recognize that your user has the `admin` role and will automatically redirect you to the Admin Dashboard at `/admin`, where you can now perform all the CRUD operations for elections and candidates.