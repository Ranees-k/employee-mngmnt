import express from "express";
import con from "../utils/db.js";
import Jwt from 'jsonwebtoken'; // Ensure the correct import statement

import bcrypt from 'bcrypt';
import multer from "multer";
import path from "path";
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';


const router = express.Router();

dotenv.config(); // Load environment variables

/**
 * Middleware to authenticate admin using JWT
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ Status: false, Error: "Unauthorized: No token provided" });
  }

  Jwt.verify(token, process.env.jwt_secret_key, (err, decoded) => {
    if (err) {
      return res.status(403).json({ Status: false, Error: "Invalid token" });
    }
    req.adminId = decoded.id; // Attach the admin ID to the request object
    next();
  });
};

//Prevent brute-force attacks by limiting the number of login attempts.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { Status: false, Error: "Too many login attempts, please try again later" },
});

// Admin signup
router.post('/adminsignup', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate the request body
  if (!name || !email || !password) {
    return res.status(400).json({ Status: false, Error: "All fields are required" });
  }

  try {
    // Check if the email already exists
    const checkSql = "SELECT * FROM admin WHERE email = ?";
    con.query(checkSql, [email], (err, result) => {
      if (err) return res.json({ Status: false, Error: "Query Error" });
      if (result.length > 0) {
        return res.status(409).json({ Status: false, Error: "Email already in use" });
      }

      // Hash the password before storing it
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Hashing Error" });

        // Insert the new admin into the database
        const insertSql = "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)";
        con.query(insertSql, [name, email, hash], (err, result) => {
          if (err) return res.json({ Status: false, Error: "Query Error" });

          return res.status(201).json({ Status: true, Message: "Admin registered successfully" });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ Status: false, Error: "Server Error" });
  }
});

// Admin login endpoint with rate limiting

router.post("/adminlogin",loginLimiter, (req, res) => {
    const sql = "SELECT * FROM `admin` WHERE email = ? AND password = ?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query error" });
        if (result.length > 0) {
            const email = result[0].email;
            const token = Jwt.sign(
                { role: "admin", email: email, id: result[0].id },
                process.env.jwt_secret_key, // Use the environment variable for the secret key
                { expiresIn: "1d" }
            );
            res.cookie('token', token);
            return res.json({ loginStatus: true });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

// Get all categories
router.get('/category', (req, res) => {
  const sql = "SELECT * FROM category";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Add category
router.post('/add_category', (req, res) => {
  const sql = "INSERT INTO category (name) VALUES (?)";
  con.query(sql, [req.body.category], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true });
  });
});

// Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Public/Images');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Add employee
router.post('/add_employee', upload.single('image'), (req, res) => {
  
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ Status: false, Error: "Unauthorized: No token provided" });
  }

  // Verify and decode the token to extract admin ID
  Jwt.verify(token, process.env.jwt_secret_key, (err, decoded) => {
    if (err) {
      return res.status(403).json({ Status: false, Error: "Invalid token" });
    }

    const createdAdminId = decoded.id; 

    if (!req.file) {
        return res.status(400).json({ Status: false, Error: "No file uploaded" });
    }
        
    // Insert employee data into the database
    const sql = `INSERT INTO employee (name, email, password, address, salary, image, category_id,created_admin_id) VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Hashing Error" });
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.address,
            req.body.salary,
            req.file.filename,
            req.body.category_id,
            createdAdminId 
        ];
        con.query(sql, [values], (err, result) => {
            if (err) return res.json({ Status: false, Error: err.message });
            return res.json({ Status: true });
        });
      });
    });
});

// Get all employees
router.get('/employee', authenticateAdmin,(req, res) => {
  const sql = "SELECT * FROM employee WHERE created_admin_id = ?";
  con.query(sql, [req.adminId], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get employee by ID
router.get('/employee/:id', authenticateAdmin, (req, res) => {
  const sql = "SELECT * FROM employee WHERE id = ? AND created_admin_id = ?";
  con.query(sql, [req.params.id, req.adminId], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    if (result.length === 0) return res.json({ Status: false, Error: "No employee found or unauthorized" });
    return res.json({ Status: true, Result: result });
  });
});

// Edit employee
router.put('/edit_employee/:id', authenticateAdmin, (req, res) => {
  const sql = `UPDATE employee SET name = ?, email = ?, salary = ?, address = ?, category_id = ? 
               WHERE id = ? AND created_admin_id = ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id,
    req.params.id,
    req.adminId
  ];
  con.query(sql, values, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Delete employee
router.delete('/delete_employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employee WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get admin count
router.get('/admin_count', (req, res) => {
  const sql = "SELECT COUNT(id) AS employees FROM admin";;

  con.query(sql, (err, result) => {
     console.log(err);
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  
  }); 
});

// Get employee count
router.get('/employee_count', (req, res) => {
  const sql = "SELECT COUNT(id) AS employees FROM employee"; // Changed 'employe' to 'employees'
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get salary sum
router.get('/salary_count', (req, res) => {
  const sql = "SELECT SUM(salary) AS salaryOFEmp FROM employee";
  
  con.query(sql, (err, result) => {
    console.log(result);
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get admin records
router.get('/admin_records', (req, res) => {
  const sql = "SELECT * FROM admin";
  con.query(sql, (err, result) => {
    console.log(result);
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Logout endpoint
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ Status: true });
});

export { router as adminRouter };
