import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, FileQuestion, CheckCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navigation: NavItem[] = [
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Questionnaires', path: '/questionnaires', icon: FileQuestion },
  { name: 'Review Answers', path: '/review', icon: CheckCircle },
  { name: 'Evaluation', path: '/evaluation', icon: BarChart3 },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Due Diligence Agent
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI-Powered Questionnaires</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className={cn('w-5 h-5 mr-3', isActive ? 'text-primary-700' : 'text-gray-400')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Powered by Groq + HuggingFace
        </div>
      </div>
    </div>
  );
}

