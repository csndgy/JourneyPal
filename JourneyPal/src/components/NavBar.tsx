import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../Navbar.css';

interface NavBarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const scrollToDestinations = () => {
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById('popular-destinations');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="navbar">
      <a href="/" className='navbar-logo'>
        <h1 className="navbar-logo">JourneyPal</h1>
      </a>

      <ul className="navbar-links">
        <li>
          <a onClick={() => {
            navigate('/');
            scrollToTop();
          }} style={{ cursor: 'pointer' }}>Home</a>
        </li>
        <li>
          <a onClick={scrollToDestinations} style={{ cursor: 'pointer' }}>Destinations</a>
        </li>
        <li>
  <Link to="/plan-your-trip">Plan your trip</Link>
</li>
<li>
  <Link to="/trips">Your Trips</Link>
</li>
      </ul>
      
      <div className="navbar-search">
      </div>

      <div className="btn-container">
        <svg viewBox="0 0 16 16" className="bi bi-sun-fill" fill="currentColor" width="23" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" 
            className='sun-icon-color'></path>
        </svg>
        <label className="switch btn-color-mode-switch">
          <input
            type="checkbox"
            id="color_mode"
            name="color_mode"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <label className="btn-color-mode-switch-inner" data-off="Light" data-on="Dark" htmlFor="color_mode"></label>
        </label>
        <svg viewBox="0 0 16 16" className="bi bi-moon-stars-fill" fill="currentColor" width="23" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055
           1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266
            2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" className="moon-icon"></path>
          <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0
           .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0
            0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145
             0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145
              0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z" className='moon-spark-icon'></path>
        </svg>
      </div>

      <div className="profile-container" ref={menuRef}>
        <div className="profile-button" onClick={toggleProfileMenu}>
          <img src="/images/profile.png" alt="Profile" className="profile-icon" />
        </div>
        
        {showProfileMenu && (
          <div className="profile-dropdown">
            <Link to="/profile" className="dropdown-item">Profile</Link>
            <Link to="/login" className="dropdown-item">Log In</Link>
            <Link to="/signup" className="dropdown-item">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;