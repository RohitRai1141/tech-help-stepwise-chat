import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2024 IT Support Assistant. All rights reserved.</p>
          <p className="flex items-center space-x-4">
            <span>v1.0.0</span>
            <span>•</span>
            <span>Need help? Contact support</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;