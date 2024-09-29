"use client"; // Ensure this is a client component

import React from 'react';
import Link from 'next/link'; // Import Link from next/link

const NotFoundPage: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    textAlign: 'center',
    color: '#333',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '6rem',
    margin: '0',
    color: '#e74c3c', // Red color for the 404
    animation: 'fadeIn 1s ease-in-out', // Animation for the title
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    margin: '1rem 0',
    animation: 'slideIn 1s ease-in-out', // Animation for the message
  };

  const linkStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    backgroundColor: '#3498db', // Blue color for the button
    color: '#fff',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease',
    animation: 'bounce 1s infinite', // Animation for the link
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>404</h1>
      <p style={messageStyle}>Oops! The page you are looking for does not exist.</p>
      <Link href="/" style={linkStyle}>
        Go back to Home
      </Link>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .link {
          transition: background-color 0.3s ease;
        }
        .link:hover {
          background-color: #2980b9; // Darker blue on hover
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;