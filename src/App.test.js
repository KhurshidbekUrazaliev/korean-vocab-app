import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Korean Vocabulary Practice heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Korean Vocabulary Practice/i);
  expect(headingElement).toBeInTheDocument();
});
