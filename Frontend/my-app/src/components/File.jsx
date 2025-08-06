import React,{useState,useEffect} from "react";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
function createFile(file){
    return(
        <Files 
        key={file.id}
        id={file.id}
        name={file.filename}
        description={file.description}
        filepath={file.filepath.split(/[/\\]/).pop()}
        uploaded_by={file.uploaded_by}
        created_at={new Date(file.created_at).toLocaleDateString()}/>
    )
}
function Files(props){
async function handleDownload(e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const filename = props.filepath.split(/[/\\]/).pop();
  console.log(filename)

  try {
    const response = await axios.get(`https://file-sharing-system-eoax.onrender.com/file/${filename}`, {
      responseType: "blob", // Important for downloading files
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Create a blob URL
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));

    // Create a link and simulate click
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Optionally revoke the blob after download
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);

  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file. Please check your permissions or token.");
  }
}

return(
        <div className="file-card">
          <h1 className="file-title">{props.name}</h1>
        <h2 className="file-description">{props.description}</h2>
        <div className="file-meta">
          <h4 className="file-path">{props.filepath}</h4>
        <h5 className="file-date">{props.created_at}</h5>
        </div>
        <button onClick={handleDownload} className="download-button">Download</button>
        </div>
    )
}
function File(){
    const [data,setData] = useState([]);
    const token = localStorage.getItem('token');
    const decoded = jwtDecode(token);
    useEffect(()=>{
        if(!token)return;
    const fetchData = async () => {
      try{
        const response = await axios.get('http://localhost:3000/files',{
            headers:{
                'Authorization': `Bearer ${token}`
            }
        });
        setData(response.data);
      }catch(err){
        console.error(err);
      }
    }
    fetchData();
  },[token,decoded.exp])
    return(
        <div className="file-card-container">
          {data.map(createFile)}
        </div>
    )
}
export default File;