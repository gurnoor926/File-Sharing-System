import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    try {
      const res = await axios.post("https://file-sharing-system-eoax.onrender.com/register", formData);
      console.log(res);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
       await Swal.fire({
          title: "Good job!",
          text: "User Registered Successfully",
          icon: "success",
        });
        window.location.reload();
      } else {
       await Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "User not Registered",
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
      <form
        onSubmit={handleSubmit}
        action="/register"
        method="post"
        encType="multipart/form-data"
        className="form"
      >
        <h2 className="form-title">Register</h2>
        <input
        className="form-input"
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
        className="form-input"
          type="email"
          placeholder="Enter email"
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
        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
    </div>
  );
}
export default Register;
