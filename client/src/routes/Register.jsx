import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import useSignIn from "react-auth-kit/hooks/useSignIn";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const url = "http://localhost:5000";
  const [error, setError] = useState("");
  const signin = useSignIn();

  // helper functions
  async function handleSubmit(event) {
    event.preventDefault();
    const body = {
      email,
      password,
      name,
    };

    try {
      const check = await axios.get(`${url}/users/${email}`);

      if (check.data) {
        setError("User with email already exists.");
      } else {
        if (password === password2) {
          const response = await axios.post(`${url}/register`, body);
          if (response.status === 201) navigate("/");
        } else setError("Passwords don't match.");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // google signup
  async function googleSignup(body) {
    try {
      const check = await axios.get(`${url}/users/${body.email}`);

      if (check.data) {
        setError("User with email already exists.");
      } else {
        const response = await axios.post(`${url}/google/register`, body);

        if (response.data.message === "success") {
          signin({
            auth: {
              token: response.data.token,
              type: "Bearer",
            },
            userState: {
              name: response.data.email,
              uid: response.data.id,
            },
          });
          navigate("/home");
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="vh-100 bg-primary d-flex justify-content-center align-items-center">
      <div className="bg-light w-25 p-4 rounded">
        <h1 className="mb-4 text-center">Register</h1>
        <form onSubmit={(e) => handleSubmit(e)}>
          {error && <span className="text-danger">{error}</span>}
          <div className="mb-3">
            <label htmlFor="name" className="mb-1 fw-semibold">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter name..."
              id="name"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="mb-1 fw-semibold">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email..."
              id="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="mb-1 fw-semibold">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password..."
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password2" className="mb-1 fw-semibold">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Enter password again..."
              id="password2"
              className="form-control"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </div>

          <p className="mb-2 mt-4">You agree to our terms and policies.</p>
          <button type="submit" className="mb-3 btn btn-success w-100">
            Create account
          </button>
          <p className="mb-2">Already a user?</p>
          <button className="btn btn-primary w-100" onClick={() => navigate("/")}>
            Login
          </button>

          <div className="mt-3 text-center">
            <p className="fw-medium">Or</p>

            <div className="d-inline-block">
              <GoogleLogin
                text="signup_with"
                logo_alignment="center"
                onSuccess={(credentialResponse) => {
                  const credential = jwtDecode(credentialResponse.credential);
                  // console.log(credential);
                  const body = {
                    email: credential.email,
                    google_id: credential.sub,
                    name: credential.given_name,
                  };
                  googleSignup(body);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
