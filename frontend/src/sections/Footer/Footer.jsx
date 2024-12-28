import React from 'react';
import logo from '../../assets/footer_logo.png';
import './Footer.scss';
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import { Link } from 'react-router-dom';
import call from '../../assets/footer/calling.png';
import time from '../../assets/footer/time.png';
import location from '../../assets/footer/location.png';
import mail from '../../assets/footer/email.png';
 

const Footer = () => {

    const footerMenu = [
        {
           
        }
    ];

    const footerContacts = [
        {
            'title': 'Telefon Numaramız',
            'info': '+90 536 363 06 90',
            'icon': call
        },
        {
            'title': 'Mail Adresimiz',
            'info': 'readmedentist@gmail.com',
            'icon': mail
        },
        {
            'title': 'Çalışma Saatlerimiz',
            'info': '09:00 - 18:00',
            'icon': time
        },
        {
            'title': 'Adresimiz',
            'info': 'Adana',
            'icon': location
        }
    ];

    return (
        <footer className='pt-60 pb-30'>
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-6">
                        <div className="footer-logo">
                            <img src={logo} alt="logo" />
                        </div>
                        <div className="footer-link">
                            <ul>
                                {footerMenu.map(singleMenu => (
                                    <li key={singleMenu.name}>
                                        <Link to={singleMenu.link}>{singleMenu.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6">
                        <div className="footer-contact">
                            {footerContacts.map(footerContact => (
                                <div className="contact-list" key={footerContact.title}>
                                    <div className="contact-icon">
                                        <img src={footerContact.icon} alt="call" />
                                    </div>
                                    <div className="contact-text-block">
                                        <p>{footerContact.title}</p>
                                        <h5>{footerContact.info}</h5>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="copyright-area">
                    <div className='copy-text'>
                        <p>&copy; Dentalist. Bütün hakları saklıdır.</p>
                    </div>
                    <div className='copy-links'>
                        <ul>
                            <li><Link to='/terms-of-service'>Kullanıcı koşulları</Link></li>
                            <li><Link to='/'>Gizlilik sözleşmesi</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
