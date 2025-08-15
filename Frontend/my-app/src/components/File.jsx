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
        filepath={file.filepath}
        uploaded_by={file.uploaded_by}
        created_at={new Date(file.created_at).toLocaleDateString()}/>
    )
}
function Files(props){
async function handleDownload(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");

    try {
      // Call backend route that forces download
      const downloadUrl = `https://file-sharing-system-eoax.onrender.com/file/${encodeURIComponent(props.filepath)}`;
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      // Turn response into a blob
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temp link to trigger browser download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = props.name;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download file.");
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
        const response = await axios.get('https://file-sharing-system-eoax.onrender.com/files',{
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