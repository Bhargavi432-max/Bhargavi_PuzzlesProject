import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginImage from "./Images/Login-cuate.svg";
import "./Login.css";
import { useEmail } from "./EmailContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setEmail: setEmailContext } = useEmail();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userData = {
      email: email,
      password: pass,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/user_login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        console.log(data.message);

        if (data.login_status) {
          setEmailContext(email);
          localStorage.setItem("email", email);
          toast.success("Login Successful", { autoClose: 1000 });
          if (data.twostep) {
            navigate("/twostepotp");
          } else {
            setTimeout(() => {
              navigate("/puzzlepage");
            }, 1000);
          }
        } else {
          // setError(data.message);
          toast.error(data.message);
        }

        // Send post request for logging login/register OTP
        await fetch("http://127.0.0.1:8000/api/log_login_register_otp/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            action_item: "logged in",
          }),
        });
        console.log("successful");
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Error registering:", error.message);
      setError("Login failed. Please try again.");
      toast.error("Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigate("/register");
  };

  const navigateToForgotPasswordPage = () => {
    navigate("/forgotpassword");
  };

  return (
    <div className="Login-container">
      <div className="Login-Image-container">
        <img src={LoginImage} alt="LoginImg" />
      </div>
      <div className="auth-form-container">
        <div className={`Login-From ${error ? "error" : ""}`}>
          <h2 className="Header-Login-Text">Login</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="youremail@gmail.com"
              id="email"
              name="email"
            />
            <br />
            <label htmlFor="password">Password:</label>
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type="password"
              placeholder="********"
              id="password"
              name="password"
            />
            <br />
            <p
              className="link-btn"
              id="Forgot"
              onClick={navigateToForgotPasswordPage}
            >
              <span className="register-link">Forgot Password?</span>
            </p>
            <button type="submit" disabled={loading}>
              Log In
            </button>
            {error && <p className="error-message">{error}</p>}
            <p className="link-btn" onClick={navigateToRegister}>
              Don't have an account yet?{" "}
              <span className="register-link">Sign In</span>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
