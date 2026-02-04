import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, BarChart3, Sparkles, ArrowRight, Zap, Shield, Clock, TrendingUp, Users, Lock, Globe } from 'lucide-react';

export function HomePage() {
  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description: 'Drag & drop documents and questionnaires with intelligent format detection',
      color: 'from-gray-900 to-black',
      delay: 0
    },
    {
      icon: Zap,
      title: 'AI Processing',
      description: 'Advanced AI analyzes documents and generates accurate, contextual answers',
      color: 'from-gray-800 to-gray-900',
      delay: 0.1
    },
    {
      icon: CheckCircle,
      title: 'Smart Review',
      description: 'Review, edit, and approve AI-generated answers with confidence scores',
      color: 'from-gray-700 to-gray-800',
      delay: 0.2
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Comprehensive metrics and insights with beautiful visualizations',
      color: 'from-black to-gray-900',
      delay: 0.3
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: '10x Faster',
      description: 'Complete due diligence in hours, not weeks'
    },
    {
      icon: TrendingUp,
      title: '95% Accurate',
      description: 'AI-powered responses with high confidence'
    },
    {
      icon: Lock,
      title: 'Secure',
      description: 'Enterprise-grade security for your data'
    },
    {
      icon: Globe,
      title: 'Scalable',
      description: 'Handle unlimited questionnaires'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section with Enhanced Design */}
      <div className="max-w-7xl mx-auto px-8 pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-black to-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-bold mb-8 shadow-xl"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            AI-Powered Due Diligence Platform
          </motion.div>
          
          {/* Main Heading */}
          <motion.h1 
            className="text-7xl font-black text-gray-900 mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Due Diligence
            <motion.span 
              className="block bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Reimagined with AI
            </motion.span>
          </motion.h1>
          
          {/* Subheading */}
          <motion.p 
            className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Transform your due diligence workflow with intelligent automation. Upload documents, 
            generate precise answers, and export professional reports in minutes—not days.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link to="/documents">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.98 }}
                className="group flex items-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
              >
                Get Started Free
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </Link>
            <Link to="/evaluation">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all border-2 border-gray-900"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics Demo
              </motion.button>
            </Link>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-900 hover:shadow-2xl transition-all"
              >
                <div className="bg-black rounded-xl w-12 h-12 flex items-center justify-center mb-3 mx-auto">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-black text-gray-900 mb-1">{benefit.title}</div>
                <div className="text-sm text-gray-600">{benefit.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Features Grid with Enhanced Design */}
      <div className="max-w-7xl mx-auto px-8 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for efficient, intelligent due diligence processing
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7 + feature.delay }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-3xl transition-all border-2 border-gray-900 h-full overflow-hidden">
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to complete your due diligence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Documents',
                description: 'Upload your company documents and due diligence questionnaires',
                icon: Upload
              },
              {
                step: '02',
                title: 'AI Processing',
                description: 'Our AI analyzes documents and generates accurate, contextual answers',
                icon: Zap
              },
              {
                step: '03',
                title: 'Review & Export',
                description: 'Review answers, make edits, and export professional reports',
                icon: FileText
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-900 h-full">
                  <div className="text-6xl font-black text-gray-500 mb-4">{item.step}</div>
                  <div className="bg-black rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section with Enhanced Design */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto px-8 py-20"
      >
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-16 text-center text-white shadow-3xl border-2 border-gray-800 overflow-hidden">
          {/* Animated background pattern */}
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}
            animate={{ 
              backgroundPosition: ['0px 0px', '40px 40px']
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <Shield className="w-20 h-20 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-5xl font-black mb-6">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
              Join leading organizations using AI to streamline their due diligence processes
            </p>
            <Link to="/documents">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 50px rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-black px-12 py-6 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-3"
              >
                Start Your Free Trial
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

