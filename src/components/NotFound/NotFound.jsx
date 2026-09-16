import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404 - Page Not Found</h1>
      <p className="notfound-desc">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="notfound-link">Return to Home</Link>
    </div>
  );
};

export default NotFound;