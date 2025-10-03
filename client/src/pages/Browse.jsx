import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Rating,
} from '@mui/material';
import { Search, FilterList } from '@mui/icons-material';
import { searchUsers, fetchMatches } from '../store/slices/skillSlice';
import { useDebounce } from '../hooks/useDebounce';
import Loading from '../components/common/Loading';
import { SKILL_CATEGORIES } from '../utils/constants';
import { generateAvatar } from '../utils/helpers';

const Browse = () => {
  const dispatch = useDispatch();
  const { users, matches, loading } = useSelector((state) => state.skills);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode, setViewMode] = useState('users'); // 'users' or 'matches'
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (viewMode === 'users') {
      dispatch(searchUsers({ skill: debouncedSearch, page: 1, limit: 12 }));
    } else {
      dispatch(fetchMatches({ skill: debouncedSearch }));
    }
  }, [debouncedSearch, viewMode, dispatch]);

  const displayUsers = viewMode === 'users' ? users : matches.map(m => ({ ...m.user, matchScore: m.matchScore }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Browse Skills
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find people to exchange skills with
      </Typography>

      {/* Search and Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {SKILL_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>View</InputLabel>
              <Select
                value={viewMode}
                label="View"
                onChange={(e) => setViewMode(e.target.value)}
              >
                <MenuItem value="users">All Users</MenuItem>
                <MenuItem value="matches">Best Matches</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {loading ? (
        <Loading />
      ) : (
        <Grid container spacing={3}>
          {displayUsers.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">
                  No users found
                </Typography>
              </Box>
            </Grid>
          ) : (
            displayUsers.map((user) => {
              const avatar = generateAvatar(user.name);
              return (
                <Grid item xs={12} sm={6} md={4} key={user._id}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={user.profilePicture}
                          sx={{
                            width: 60,
                            height: 60,
                            mr: 2,
                            bgcolor: avatar.color,
                          }}
                        >
                          {avatar.initials}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {user.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={user.rating?.average || 0}
                              readOnly
                              size="small"
                              precision={0.5}
                            />
                            <Typography variant="caption" color="text.secondary">
                              ({user.rating?.count || 0})
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      {user.matchScore && (
                        <Chip
                          label={`${user.matchScore.percentage}% Match`}
                          size="small"
                          color="primary"
                          sx={{ mb: 2 }}
                        />
                      )}

                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Skills Offered:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {user.skillsOffered?.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {user.skillsOffered?.length > 3 && (
                          <Chip
                            label={`+${user.skillsOffered.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>

                      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                        Wants to Learn:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {user.skillsDesired?.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill.name}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        ))}
                      </Box>

                      <Button
                        fullWidth
                        variant="contained"
                        href={`/profile/${user._id}`}
                      >
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Browse;
