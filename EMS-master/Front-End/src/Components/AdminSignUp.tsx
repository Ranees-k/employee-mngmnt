import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminSignup = () => {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!termsAccepted) {
      setError('You must agree to the terms and conditions.');
      return;
    }
    axios.post('http://localhost:3001/admin/signup', values)
      .then(result => {
        if (result.data.Status) {
          navigate('/adminlogin');
        } else {
          setError(result.data.Error);
        }
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 loginPage">
      <div className="p-3 rounded w-25 border loginForm">
        <div className="text-warning">
          {error && error}
        </div>
        <h2>Admin Signup</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name"><strong>Name:</strong></label>
            <input
              type="text"
              name="name"
              autoComplete="off"
              placeholder="Enter Name"
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className="form-control rounded-0"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email"><strong>Email:</strong></label>
            <input
              type="email"
              name="email"
              autoComplete="off"
              placeholder="Enter Email"
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className="form-control rounded-0"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password"><strong>Password:</strong></label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              className="form-control rounded-0"
            />
          </div>
          <div className="mb-3">
            <input
              type="checkbox"
              name="terms"
              id="terms"
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
              className="me-2"
            />
            <label htmlFor="terms">
              I agree with the <strong>terms and conditions</strong>
            </label>
          </div>
          <button className="btn btn-success w-100 rounded-0 mb-2">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default AdminSignup;
