# Employee Management System  

The **Employee Management System** is a full-stack web application that helps manage employees, categories, and their profiles. It includes features for admin and employee login, category management, employee CRUD operations, and responsive designs.

## Backend Overview  

The backend for the **Employee Management System** is built using **Node.js** with the following key functionalities:  
- Admin and Employee authentication and management.  
- CRUD operations for employees and categories.  
- Image uploads for employee profiles.  
- JWT-based authentication for secure API access.  
- Rate limiting for login attempts to enhance security.  

---

## Features  

### Admin-Specific:  
- Signup, login, and logout functionality.  
- CRUD operations for employees and categories.  
- Analytics: Admin count, employee count, and total salary.  

### Employee-Specific:  
- Login and logout functionality.  
- Fetch employee details by ID.  

---

## Tech Stack  

- **Node.js**: Server-side runtime.  
- **Express.js**: Web framework for routing and middleware.  
- **MySQL**: Database for storing admin, employee, and category data.  
- **JWT**: Secure token-based authentication.  
- **bcrypt**: For hashing passwords.  
- **dotenv**: Manage environment variables.  
- **multer**: Handle image uploads.  
- **Rate Limiting**: Prevent brute-force attacks.

---
## API End Points
#Admin Routes
-POST /adminsignup: Admin registration.
-POST /adminlogin: Admin login with rate limiting.
-GET /logout: Logout and clear JWT token.
-GET /admin_records: Retrieve all admin records.
-GET /admin_count: Get total admin count.

#Category Routes
-GET /category: Retrieve all categories.
-POST /add_category: Add a new category.

#Employee Routes (Admin-Specific)
-GET /employee: Get all employees for the logged-in admin.
-GET /employee/:id: Get a specific employee by ID.
-POST /add_employee: Add a new employee (with image upload).
-PUT /edit_employee/:id: Edit employee details.
-DELETE /delete_employee/:id: Delete an employee by ID.

#Employee Routes (Employee-Specific)
-POST /employee_login: Employee login with JWT token generation.
-GET /detail/:id: Fetch employee details by their ID.
-GET /logout: Clear employee token cookie on logout.

#Analytics Routes
-GET /employee_count: Total number of employees.
-GET /salary_count: Total salary sum for all employees.

##Middleware
-authenticateAdmin: Verifies JWT and attaches admin ID to the request.
-loginLimiter: Limits login attempts to 5 per 15 minutes.

## FrontEnd Over View

## Login system
-Admin Login (Login.js): Allows the administrator to log in with an email and password. Upon successful login, the user is redirected to the dashboard.
-Employee Login (EmployeeLogin.js): Employees can log in using their email and password, after which they can view their details. It also provides error messages if login fails.

## Dashboard (Dashboard.js)
-Layout: Provides a sidebar menu with links to different sections like Dashboard, Employee Management, Category Management, and Profile.
-Logout: The administrator can log out, clearing the session and redirecting to the login page.

## Category Management (Category.js)
-Displays a list of categories fetched from the backend.
-Provides a link to add a new category (Add Category).
-Categories are fetched using an API and displayed in a table with their names.

## Employee Management
-Employee List (Employee.js): Displays a table of employees with their details, allowing for CRUD operations such as viewing, editing, or deleting employee records.
-Add/Edit Employee (EditEmployee.js): Allows an administrator to edit an existing employee's details (name, email, salary, address, category).
-Form data is dynamically updated based on the employee's current information.
-Employee categories are fetched from the backend for selection.

## Responsive Design
-Uses Bootstrap and custom styling for a clean and user-friendly interface.
-The layout adjusts for various screen sizes, ensuring responsiveness across devices.

## State Management
useState: Used to manage local states such as user input and fetched data (e.g., employee information and category list).
useEffect: Used for fetching data from the backend when the component mounts.

## API Integration
The frontend communicates with the backend using Axios to make HTTP requests for CRUD operations like fetching employee and category data, editing employee details, and logging in.
API calls handle responses and error management (e.g., login failure alerts).

## Form Handling
-Forms such as Add/Edit Employee allow users to submit and edit employee details.
-Form data is submitted using the POST and PUT HTTP methods with Axios.


## Next Plan to Improve in Security Side

Ensuring user input is validated and sanitized can prevent XSS (Cross-Site Scripting) and SQL Injection vulnerabilities.
Frontend:
Validate form fields like email, phone number, salary, etc., using client-side JavaScript (e.g., with libraries like validator).
Sanitize input before sending it to the backend using libraries like DOMPurify to prevent malicious scripts from being injected.
Backend:
Sanitize input data before processing and storing it in the database. Use libraries like validator or express-validator.
Always validate input on the server-side, even if it was validated client-side. Never rely solely on frontend validation.
Prevent SQL Injection by using parameterized queries or ORMs like Sequelize, which automatically sanitize queries.


Set up your server to enforce SSL/TLS (secure HTTP). You can obtain an SSL certificate from providers like Let's Encrypt or any commercial provider.
Redirect all HTTP traffic to HTTPS.
Use a CSRF protection middleware such as csurf in Node.js to ensure all state-changing requests are protected by a token.
Validate the CSRF token in every sensitive request to prevent malicious actions from untrusted sources.
Set up CORS in your backend (e.g., using CORS middleware in Express) to restrict access to trusted domains only.
Avoid using the wildcard (*) for CORS headers, and instead specify the allowed domains explicitly.

