import { useState, useEffect } from 'react';
//import React from 'react';
import './Navbar.scss';
import logo from './../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null);

    // Check authentication status on component mount
    useEffect(() => {
        const token = localStorage.getItem("access");
        if(token){
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN);
                if (!token) return;
                
                const response = await api.get("/api/user/", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (response.status === 200) {
                    setUserType(response.data.user_type);
                }
            } catch (error) {
                console.error("Error fetching user data:", error.response || error.message);
            }
        };

        if (isAuthenticated) {
            fetchUserInfo();
        }
    }, [isAuthenticated]);

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access");
        setIsAuthenticated(false);
        navigate("/login");
    };

    const navbarItems = [
        {
            id: 1,
            name: 'Anasayfa',
            path: '/',
        },
        {
            id: 2,
            name: 'Hakkımızda',
            path: '/about',
        },
        {
            id: 3,
            name: 'Hizmetlerimiz',
            path: '/singleservice',
        },
        {
            id: 4,
            name: 'İletişim',
            path: '/contact',
        }
    ];

    // Helper function to get dashboard path
    const getDashboardPath = () => {
        switch (userType) {
            case 'patient':
                return '/appointments-page';
            case 'dentist':
                return '/schedule-page';
            case 'assistant':
                return '/schedule-page';
            case 'manager':
                return '/schedule-page';
            default:
                return '';
        }
    };

    return (
        <div className='main-nav'>
            <div className="container">
                <nav className="navbar navbar-expand-lg">
                    <div className="container-fluid">
                        {/* Logo */}
                        <Link className="navbar-brand" to="/">
                            <img src={logo} alt="logo" />
                        </Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            {/* Navbar Link */}
                            <ul className="navbar-nav m-auto mb-2 mb-lg-0">
                                {navbarItems.map((navSingle, index) => (
                                    <li className="nav-item" key={index}>
                                        <Link className="nav-link" to={navSingle.path}>
                                            {navSingle.name}
                                        </Link>
                                    </li>
                                ))}
                                {/* Show Dashboard link if authenticated */}
                                {isAuthenticated && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to={getDashboardPath()}>
                                            Dashboard
                                        </Link>
                                    </li>
                                )}
                            </ul>
                            
                            {/* Navbar Button */}
                            <div className="theme-btn">
                                {isAuthenticated ? (
                                    <Link 
                                        to="/choose" 
                                        className="nav-link theme-btn-link"
                                    >
                                        Randevu al
                                    </Link>
                                ) : (
                                    <Link 
                                        to="/patients" 
                                        className="nav-link theme-btn-link"
                                    >
                                        Randevu al
                                    </Link>
                                )}
                            </div>
                            <div className="theme-btn2">
                                {isAuthenticated ? (
                                    <Link 
                                        to="/login" 
                                        onClick={handleLogout} 
                                        className="nav-link theme-btn-link"
                                    >
                                        Çıkış yap
                                    </Link>
                                ) : (
                                    <Link 
                                        to="/login" 
                                        className="nav-link theme-btn-link"
                                    >
                                        Giriş yap
                                    </Link>
                                )}
                            </div>
                            
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Navbar;
