import { Box, Container, Typography, Link as MuiLink, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1e293b',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              SkillSwap
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
              Exchange skills and learn together with our community of enthusiasts.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                component={Link}
                to="/browse"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.8 }}
              >
                Browse Skills
              </MuiLink>
              <MuiLink
                component={Link}
                to="/dashboard"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.8 }}
              >
                Dashboard
              </MuiLink>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MuiLink
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.8 }}
              >
                Help Center
              </MuiLink>
              <MuiLink
                href="#"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.8 }}
              >
                Contact Us
              </MuiLink>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="body2" align="center" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} SkillSwap. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
