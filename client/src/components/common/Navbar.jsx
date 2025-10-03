import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getInitials, generateAvatar } from '../../utils/helpers';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useSelector((state) => state.notifications);
  
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const avatar = user ? generateAvatar(user.name) : null;

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 4,
              fontWeight: 700,
              textDecoration: 'none',
              color: 'white',
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            SkillSwap
          </Typography>

          {isAuthenticated && (
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Button
                component={Link}
                to="/dashboard"
                sx={{ color: 'white' }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                to="/browse"
                sx={{ color: 'white' }}
              >
                Browse
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />

          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="large"
                color="inherit"
                onClick={() => navigate('/messages')}
              >
                <Badge badgeContent={0} color="error">
                  <MessageIcon />
                </Badge>
              </IconButton>

              <IconButton size="large" color="inherit">
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
                {user?.profilePicture ? (
                  <Avatar src={user.profilePicture} alt={user.name} />
                ) : (
                  <Avatar sx={{ bgcolor: avatar?.color }}>
                    {avatar?.initials}
                  </Avatar>
                )}
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/dashboard'); }}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                component={Link}
                to="/login"
                sx={{ color: 'white' }}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
