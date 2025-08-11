import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavigationItem } from '../types/dashboard';

interface MainNavigationProps {
  navigationItems: NavigationItem[];
}

const MainNavigation: React.FC<MainNavigationProps> = ({ navigationItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Panel de Administración
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.id}
              className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <div className="flex items-center space-x-4">
                <div 
                  className={`p-3 rounded-lg ${item.color} ${
                    isActive ? 'bg-blue-500 text-white' : 'text-white'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    isActive ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`text-sm ${
                    isActive ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
              
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MainNavigation; 