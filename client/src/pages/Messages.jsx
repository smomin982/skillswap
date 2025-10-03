import { Container, Typography, Box } from '@mui/material';

const Messages = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Messages
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Messaging feature implementation...
        </Typography>
      </Box>
    </Container>
  );
};

export default Messages;
