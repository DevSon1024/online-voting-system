// frontend/src/components/common/ValidationNotification.jsx
import { Link } from 'react-router-dom';
import Button from './Button';

export default function ValidationNotification({ userCount, onRedirect }) {
  if (userCount === 0) {
    return null;
  }

  return (
    <div className="validation-notification">
      <div className="notification-content">
        <p>There are {userCount} new voters waiting for validation.</p>
        <Button onClick={onRedirect} variant="secondary" className="w-auto px-4 py-2 text-sm">
          View Requests
        </Button>
      </div>
    </div>
  );
}