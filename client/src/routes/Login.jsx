import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useSignin from "react-auth-kit/hooks/useSignIn";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const url = "http://localhost:5000";
  const [error, setError] = useState("");
  const signin = useSignin();

  async function handleSubmit(event) {
    event.preventDefault();
    const body = {
      email,
      password,
    };

    try {
      const check = await axios.get(`${url}/users/${email.toLowerCase()}`);

      if (check.data) {
        const response = await axios.post(`${url}/login`, body);

        if (response.data.message === "success") {
          signin({
            auth: {
              token: response.data.token,
              type: "Bearer",
            },
            userState: {
              name: check.data.email,
              uid: check.data.id,
            },
          });

          navigate("/home");
        } else setError("Invalid email or password.");
      } else setError("Invalid email or password");
    } catch (err) {
      console.error(err);
    }
  }

  // google login
  async function googleSignin(body) {
    try {
      const check = await axios.get(`${url}/users/${body.email}`);

      if (check.data) {
        const response = await axios.post(`${url}/google/login`, body);

        if (response.data.message === "success") {
          const decodedToken = jwtDecode(response.data.token);
          signin({
            auth: {
              token: response.data.token,
              type: "Bearer",
            },
            userState: {
              name: decodedToken.email,
              uid: decodedToken.id,
            },
          });

          navigate("/home");
        } else setError("Invalid email.");
      } else setError("No registered user for this email.");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="vh-100 bg-primary d-flex justify-content-center align-items-center">
      <div className="bg-light w-25 p-4 rounded">
        <h1 className="mb-4 text-center">Login</h1>
        <form onSubmit={(e) => handleSubmit(e)}>
          {error && <span className="text-danger">{error}</span>}
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

          <button type="submit" className="my-3 btn btn-success w-100">
            Login
          </button>
          <p className="mb-2">Create an account</p>
          <button className="btn btn-primary w-100" onClick={() => navigate("/register")}>
            Signup
          </button>

          <div className="mt-3 text-center">
            <p className="fw-medium">Or</p>

            <div className="d-inline-block">
              <GoogleLogin
                text="signin_with"
                logo_alignment="center"
                onSuccess={(credentialResponse) => {
                  const credential = jwtDecode(credentialResponse.credential);
                  const body = {
                    email: credential.email,
                  };
                  googleSignin(body);
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

export default Login;
