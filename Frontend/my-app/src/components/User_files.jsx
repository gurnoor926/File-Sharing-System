import React,{useState,useEffect} from "react";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
function createFile(file){
    return(
        <User_file 
        key={file.id}
        id={file.id}
        name={file.filename}
        description={file.description}
        filepath={file.filepath.split(/[/\\]/).pop()}
        uploaded_by={file.uploaded_by}
        created_at={new Date(file.created_at).toLocaleDateString()}/>
    )
}
function User_file(props){
   async function handleDelete(e){
    e.preventDefault();
       const token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`http://localhost:3000/delete_file/${props.id}`,{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(response.data);
            if(response.data.success){
                alert("File deleted");
                window.location.reload();
            }else{
                alert("Error deleting file");
            }
        } catch (error) {
            console.log(error)
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
        <button onClick={handleDelete} className="delete-button">Delete</button>
        </div>
    )
}
function User_files(){
    const [data,setData] = useState([]);
    const token = localStorage.getItem('token');
    useEffect(()=>{
        if(!token)return;
      const decoded = jwtDecode(token);
    const fetchData = async () => {
      try{
        const response = await axios.get(`http://localhost:3000/user_uploads/${decoded.id}`,{
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
  },[token])
    return(
        <div>
          {data.map(createFile)}
        </div>
    )
}
export default User_files;