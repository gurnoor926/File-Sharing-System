import React from 'react';
import { Link } from 'react-router-dom';
function Navbar(){
    const token = localStorage.getItem('token')
    return (
        <nav className='navbar'>
            <ul className='nav-list'>
                <li><Link to="/" className='nav-link'>{token?"Home":"Login"}</Link></li>
                <li><Link to="/register" className='nav-link'>{token?"":"Register"}</Link></li>
                <li> <Link to="/user_files" className='nav-link'>{token?"My Uploads":""}</Link></li>
                <li><Link to="/fileupload" className='nav-link'>{token?"Upload File": ""}</Link></li>
            </ul>
        </nav>
    )
}
export default Navbar;
