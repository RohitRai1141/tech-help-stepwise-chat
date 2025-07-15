import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main content area with proper spacing for fixed header/footer */}
      <main className="pt-16 pb-16 min-h-screen">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;