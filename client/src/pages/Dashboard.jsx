import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import {
  SwapHoriz,
  Schedule,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { fetchExchanges } from '../store/slices/exchangeSlice';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import { formatDate, getStatusColor } from '../utils/helpers';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { exchanges, loading } = useSelector((state) => state.exchanges);

  useEffect(() => {
    dispatch(fetchExchanges({ limit: 5 }));
  }, [dispatch]);

  const stats = [
    {
      title: 'Active Exchanges',
      value: exchanges.filter((e) => e.status === 'active').length,
      icon: <SwapHoriz />,
      color: '#6366f1',
    },
    {
      title: 'Upcoming Sessions',
      value: 0,
      icon: <Schedule />,
      color: '#10b981',
    },
    {
      title: 'Skills Offered',
      value: user?.skillsOffered?.length || 0,
      icon: <TrendingUp />,
      color: '#f59e0b',
    },
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your skill exchanges
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 2,
                  bgcolor: stat.color + '20',
                  color: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/browse"
            variant="contained"
            startIcon={<Add />}
          >
            Find Learning Partners
          </Button>
          <Button
            component={Link}
            to="/profile"
            variant="outlined"
          >
            Update Profile
          </Button>
        </Box>
      </Paper>

      {/* Recent Exchanges */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Recent Exchanges
        </Typography>
        {exchanges.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No exchanges yet
            </Typography>
            <Button
              component={Link}
              to="/browse"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Find Your First Match
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {exchanges.slice(0, 3).map((exchange) => (
              <Grid item xs={12} key={exchange._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar
                          src={
                            exchange.requester._id === user?._id
                              ? exchange.recipient.profilePicture
                              : exchange.requester.profilePicture
                          }
                        />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {exchange.requester._id === user?._id
                              ? exchange.recipient.name
                              : exchange.requester.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Teaching: {exchange.recipientSkill.name} • Learning: {exchange.requesterSkill.name}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={exchange.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(exchange.status) + '20',
                          color: getStatusColor(exchange.status),
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Container>
  );
};

export default Dashboard;
