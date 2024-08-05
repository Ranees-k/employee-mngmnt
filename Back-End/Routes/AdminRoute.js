import express from "express";
import con from "../utils/db.js";
import Jwt from 'jsonwebtoken'; // Ensure the correct import statement

import bcrypt from 'bcrypt';
import multer from "multer";
import path from "path";
import dotenv from 'dotenv';

const router = express.Router();

dotenv.config(); // Load environment variables

router.post("/adminlogin", (req, res) => {
    const sql = "SELECT * FROM `admins` WHERE email = ? AND password = ?";
    con.query(sql, [req.body.email, req.body.password], (err, result) => {
        console.log(result);
        if (err) return res.json({ loginStatus: false, Error: "Query error" });
        if (result.length > 0) {
            const email = result[0].email;
            /*const token = Jwt.sign(
                { role: "admin", email: email, id: result[0].id },
                process.env.jwt_secret_key, // Use the environment variable for the secret key
                { expiresIn: "1d" }
            );
            res.cookie('token', token);*/
            return res.json({ loginStatus: true });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong email or password" });
        }
    });
});

// Get categories
router.get('/category', (req, res) => {
  const sql = "SELECT * FROM categories";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Add category
router.post('/add_category', (req, res) => {
  const sql = "INSERT INTO categories (name) VALUES (?)";
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
    if (!req.file) {
        return res.status(400).json({ Status: false, Error: "No file uploaded" });
    }

    const sql = `INSERT INTO employees (name, email, password, address, salary, image, category_id) VALUES (?)`;
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) return res.json({ Status: false, Error: "Hashing Error" });
        const values = [
            req.body.name,
            req.body.email,
            hash,
            req.body.address,
            req.body.salary,
            req.file.filename,
            req.body.category_id
        ];
        con.query(sql, [values], (err, result) => {
            if (err) return res.json({ Status: false, Error: err.message });
            return res.json({ Status: true });
        });
    });
});

// Get all employees
router.get('/employee', (req, res) => {
  const sql = "SELECT * FROM employees";
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get employee by ID
router.get('/employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM employees WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Edit employee
router.put('/edit_employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = `UPDATE employees SET name = ?, email = ?, salary = ?, address = ?, category_id = ? WHERE id = ?`;
  const values = [
    req.body.name,
    req.body.email,
    req.body.salary,
    req.body.address,
    req.body.category_id
  ];
  con.query(sql, [...values, id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Delete employee
router.delete('/delete_employee/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM employees WHERE id = ?";
  con.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get admin count
router.get('/admin_count', (req, res) => {
  const sql = "SELECT COUNT(id) AS employees FROM admins";;

  con.query(sql, (err, result) => {
     console.log(err);
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  
  }); 
});

// Get employee count
router.get('/employee_count', (req, res) => {
  const sql = "SELECT COUNT(id) AS employees FROM employees"; // Changed 'employe' to 'employees'
  con.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get salary sum
router.get('/salary_count', (req, res) => {
  const sql = "SELECT SUM(salary) AS salaryOFEmp FROM employees";
  
  con.query(sql, (err, result) => {
    console.log(result);
    if (err) return res.json({ Status: false, Error: "Query Error" });
    return res.json({ Status: true, Result: result });
  });
});

// Get admin records
router.get('/admin_records', (req, res) => {
  const sql = "SELECT * FROM admins";
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
