import React from 'react';
import './CustomAlert.scss';

const CustomAlert = ({ message, type, onClose }) => {
    if (!message) return null;

    return (
        <div className={`custom-alert ${type}`}>
            <span className="message">{message}</span>
            <button className="close-button" onClick={onClose}>×</button>
        </div>
    );
};

export default CustomAlert;
