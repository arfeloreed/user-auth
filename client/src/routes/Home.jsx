import React from "react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useNavigate } from "react-router";

function Home() {
  const signout = useSignOut();
  const navigate = useNavigate();

  function handleSignout() {
    signout();
    navigate("/");
  }

  return (
    <div className="container">
      <h1>Welcome!!!</h1>

      <div>
        <button className="btn btn-dark" onClick={handleSignout}>
          Sign-out
        </button>
      </div>
    </div>
  );
}

export default Home;
