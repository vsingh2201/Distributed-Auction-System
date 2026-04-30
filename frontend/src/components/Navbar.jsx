import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { userName, userEmail, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary mb-4">
      <div className="container">
        <NavLink className="navbar-brand" to="/catalogue">
          <img src="/images/logo-transparent.png" alt="Auction Logo" height="40" />
        </NavLink>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block">
            <div className="fw-semibold lh-1">{userName}</div>
            <div className="text-muted small">{userEmail}</div>
          </div>

          <NavLink
            className={({ isActive }) =>
              'btn btn-sm ' + (isActive ? 'btn-primary' : 'btn-outline-primary')
            }
            to="/catalogue"
          >
            Catalogue
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              'btn btn-sm ' + (isActive ? 'btn-primary' : 'btn-outline-primary')
            }
            to="/upload-item"
          >
            Upload Item
          </NavLink>

          <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
