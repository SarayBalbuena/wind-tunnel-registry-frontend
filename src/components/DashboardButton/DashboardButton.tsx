import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';

export const DashboardButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/dashboard')}
      colorPalette="blue"
      size="lg"
      rounded="md"
    >
      Go to dashboard
    </Button>
  );
};
