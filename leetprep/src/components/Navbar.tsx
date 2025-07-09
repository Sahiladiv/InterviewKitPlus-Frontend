// src/components/Navbar.tsx
import React, { useContext } from "react";
import { Navbar as BSNavbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const location = useLocation();

  // Determine if we're on the /dsa path to show DSA-specific links
  const isDSASection = location.pathname.startsWith("/dsa");

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg">
      <Container>
        <BSNavbar.Brand as={Link} to="/">InterviewKit+</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-navbar-nav" />
        <BSNavbar.Collapse id="main-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                {isDSASection && (
                  <>
                    <Nav.Link as={Link} to="/dsa">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/dsa/problems">Problems</Nav.Link>
                    <Nav.Link as={Link} to="/dsa/submissions">Submissions</Nav.Link>
                  </>
                )}
                <span className="navbar-text text-white mx-2">👤 {user}</span>
                <Button variant="outline-light" size="sm" onClick={logoutUser}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
