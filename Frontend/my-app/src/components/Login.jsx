import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  var decoded;
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    try {
      const res = await axios.post("http://localhost:3000/login", formData);
      console.log(res.data);

      if (res.data.success) {
        const token = localStorage.setItem("token", res.data.token);
       await Swal.fire({
          title: "Done",
          text: "Login Successfull",
          icon: "success",
        });
        window.location.reload();
        if (token) {
          decoded = jwtDecode(token);
        }
        console.log(decoded.id);
      } else {
       await Swal.fire({
          title: "Bad",
          text: "Login Unsuccessfull",
          icon: "error",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="page-wrapper">
    <div className="form-container">
        <h2 className="form-title">Login</h2>
      <form
        action="/login"
        onSubmit={handleSubmit}
        method="post"
        encType="multipart/form-data"
        className="form"
      >
        <input
        className="form-input"
          type="email"
          placeholder="Enter registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
        className="form-input"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="submit-button">Login</button>
      </form>
    </div>
    </div>
  );
}
export default Login;
