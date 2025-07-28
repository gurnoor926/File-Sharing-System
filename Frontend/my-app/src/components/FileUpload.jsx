import React, { useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import axios from "axios";
import Swal from "sweetalert2";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [description, setDecription] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      if(decodedToken.exp < Date.now()/1000){
          localStorage.removeItem('token');
          window.location.href = '/';
        }
      setUserId(decodedToken.id);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("filename", fileName);
    formData.append("description", description);
    formData.append("userId", userId); 

    try {
      const res = await axios.post("http://localhost:3000/upload_files", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);
      if (res.data.success) {
       await Swal.fire({
          title: "File Uploded",
          text: "File Uploded Successfully",
          icon: "success"
        });
        window.location.reload();
      } else{
      await Swal.fire({
          title: "Bad",
          text: "File not uploded",
          icon: "error"
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
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="form">
        <input
        className="form-input"
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          name="file"
        />
        <input
        className="form-input"
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="Enter file name"
        />
        <textarea
        className="form-input"
          value={description}
          onChange={(e) => setDecription(e.target.value)}
          placeholder="Enter description"
        />
        <br />
        <button type="submit" className="submit-button">Upload</button>
      </form>
    </div>
    </div>
  );
}

export default FileUpload;
