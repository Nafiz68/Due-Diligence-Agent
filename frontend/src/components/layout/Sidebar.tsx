import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, FileQuestion, CheckCircle, BarChart3, Home, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  gradient: string;
}

const navigation: NavItem[] = [
  { name: 'Home', path: '/', icon: Home, gradient: 'from-gray-900 to-black' },
  { name: 'Documents', path: '/documents', icon: FileText, gradient: 'from-gray-800 to-gray-900' },
  { name: 'Questionnaires', path: '/questionnaires', icon: FileQuestion, gradient: 'from-gray-700 to-gray-800' },
  { name: 'Review', path: '/review', icon: CheckCircle, gradient: 'from-black to-gray-900' },
  { name: 'Chat', path: '/chat', icon: MessageSquare, gradient: 'from-gray-900 to-black' },
  { name: 'Analytics', path: '/evaluation', icon: BarChart3, gradient: 'from-gray-900 to-gray-700' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-72 bg-white border-r-2 border-gray-900 h-screen flex flex-col shadow-2xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 border-b-2 border-gray-900"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-black rounded-xl shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-black">
              Due Diligence
            </h1>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-gray-900" />
              <p className="text-xs text-gray-600 font-medium">AI-Powered</p>
            </div>
          </div>
        </div>
      </motion.div>

      <nav className="flex-1 p-6 space-y-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'relative flex items-center px-5 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 overflow-hidden',
                  isActive
                    ? 'text-white shadow-2xl'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${item.gradient}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="relative flex items-center">
                  <Icon className={cn(
                    'w-5 h-5 mr-3',
                    isActive ? 'text-white' : 'text-gray-500'
                  )} />
                  <span className="relative">{item.name}</span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6 border-t-2 border-gray-900"
      >
        <div className="bg-gray-100 rounded-2xl p-4 border-2 border-gray-900">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-black" />
            <p className="text-xs font-bold text-gray-900">Powered by AI</p>
          </div>
          <p className="text-xs text-gray-600">
            Groq + HuggingFace + ChromaDB
          </p>
        </div>
      </motion.div>
    </div>
  );
}

