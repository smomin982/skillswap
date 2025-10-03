import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  SwapHoriz,
  People,
  Schedule,
  Star,
} from '@mui/icons-material';

const Home = () => {
  const features = [
    {
      icon: <SwapHoriz sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Skill Exchange',
      description: 'Exchange your skills with others and learn something new',
    },
    {
      icon: <People sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Find Matches',
      description: 'Our algorithm finds the perfect learning partners for you',
    },
    {
      icon: <Schedule sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Schedule Sessions',
      description: 'Easily schedule and manage your learning sessions',
    },
    {
      icon: <Star sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Build Reputation',
      description: 'Get reviews and build your reputation in the community',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          py: 12,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
                Exchange Skills,
                <br />
                Learn Together
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Connect with people who want to learn your skills and teach you theirs.
                No money, just knowledge exchange.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  component={Link}
                  to="/browse"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: 'white',
                    borderColor: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Browse Skills
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  width: '100%',
                  height: 400,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4">Platform Preview</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom fontWeight={700}>
          How It Works
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Start exchanging skills in four simple steps
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-8px)' },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: '#f9fafb', py: 10 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
              Ready to Start Learning?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of learners exchanging skills every day
            </Typography>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="large"
              sx={{ px: 6 }}
            >
              Join Now - It's Free
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
