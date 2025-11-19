import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Korean Learning App heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Essential Korean Vocabulary/i);
  expect(headingElement).toBeInTheDocument();
});
