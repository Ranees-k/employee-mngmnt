import express from 'express'
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const router = express.Router()

// Employee login route
router.post("/employee_login", (req, res) => {
      // SQL query to check if the email exists in the employee table
    const sql = "SELECT * from employee Where email = ?";
    con.query(sql, [req.body.email], (err, result) => {
      if (err) return res.json({ loginStatus: false, Error: "Query error" });// Handle query error
      if (result.length > 0) {
        // If email exists, compare the entered password with the hashed password in the database
        bcrypt.compare(req.body.password, result[0].password, (err, response) => {
            if (err) return res.json({ loginStatus: false, Error: "Wrong Password" });// Handle bcrypt error
            if(response) {
                // If password matches, generate a JWT token for the user
                const email = result[0].email;
                const token = jwt.sign(
                    { role: "employee", email: email, id: result[0].id },
                    "jwt_secret_key",// Secret key for signing the token
                    { expiresIn: "1d" } // Set the token expiry time to 1 day
                );
               // Verify the token (for additional security)
               jwt.verify(token, 'jwt_secret_key', (err, decoded) => {
              if (err) {
                  return res.status(403).json({ message: 'Invalid token' });
              }

    const userId = decoded.id;
                console.log(userId)
              })
                // Set the token as a cookie in the user's browser
                res.cookie('token', token)
                return res.json({ loginStatus: true, id: result[0].id }); // Return success response with user ID
            }
        })
        
      } else {
          return res.json({ loginStatus: false, Error:"wrong email or password" }); // If email doesn't exist or password is incorrect
      }
    });
  });

// Get employee details by ID route

  router.get('/detail/:id', (req, res) => {
        // Get the employee ID from the request parameters

    const id = req.params.id;
        // SQL query to fetch employee details based on the given ID

    const sql = "SELECT * FROM employee where id = ?"
    con.query(sql, [id], (err, result) => {
        if(err) return res.json({Status: false});// Handle SQL query error
        return res.json(result) // Return the employee details if found
    })
  })

  // Employee logout route
  router.get('/logout', (req, res) => {
       // Clear the token cookie on logout
    res.clearCookie('token')
    return res.json({Status: true}) // Return success message after clearing the cookie
  })

  export {router as EmployeeRouter}