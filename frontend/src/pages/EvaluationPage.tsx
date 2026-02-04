import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Target, Award, FileText, CheckCircle, XCircle, AlertCircle, Zap, Activity, PieChart as PieIcon, Sparkles, TrendingDown } from 'lucide-react';
import { questionnairesApi, evaluationsApi, answersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, Area, AreaChart } from 'recharts';

// Monochromatic grayscale palette for data visualization
const COLORS = ['#000000', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'];

export function EvaluationPage() {
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string | null>(null);

  // Fetch questionnaires
  const { data: questionnairesData } = useQuery({
    queryKey: ['questionnaires'],
    queryFn: async () => {
      const result = await questionnairesApi.getAll();
      return result.data;
    },
  });

  // Fetch answers for analytics - fetch all answers without pagination limit
  const { data: answersData } = useQuery({
    queryKey: ['answers', selectedQuestionnaireId],
    queryFn: async () => {
      if (!selectedQuestionnaireId) return null;
      const result = await answersApi.getByQuestionnaire(selectedQuestionnaireId, { limit: 10000 });
      return result.data;
    },
    enabled: !!selectedQuestionnaireId,
  });

  const questionnaires = questionnairesData || [];
  const answers = answersData || [];
  const selectedQuestionnaire = questionnaires.find((q: any) => q._id === selectedQuestionnaireId);

  // Calculate metrics from answers
  const metrics = React.useMemo(() => {
    if (!answers || answers.length === 0 || !selectedQuestionnaire) return null;

    const total = answers.length;
    const totalQuestions = selectedQuestionnaire.questionCount || 0;
    const answeredQuestions = selectedQuestionnaire.answeredCount || 0;
    const avgConfidence = answers.reduce((sum: number, a: any) => sum + (a.confidenceScore || 0), 0) / total;
    
    const statusCounts = answers.reduce((acc: any, a: any) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const withCitations = answers.filter((a: any) => a.citations && a.citations.length > 0).length;
    const edited = answers.filter((a: any) => a.isEdited).length;
    const reviewed = answers.filter((a: any) => a.status === 'reviewed' || a.status === 'approved').length;
    const generated = answers.filter((a: any) => a.status === 'generated').length;

    return {
      total,
      totalQuestions,
      answeredQuestions,
      avgConfidence,
      statusCounts,
      withCitations,
      edited,
      reviewed,
      generated,
      completionRate: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0,
      generationRate: (generated / total) * 100,
      citationRate: (withCitations / total) * 100,
      editRate: (edited / total) * 100
    };
  }, [answers, selectedQuestionnaire]);

  // Prepare chart data - Question progress (answered vs unanswered)
  const questionProgressData = metrics ? [
    { name: 'Answered', value: metrics.answeredQuestions, fill: '#000000' },
    { name: 'Unanswered', value: metrics.totalQuestions - metrics.answeredQuestions, fill: '#e5e7eb' }
  ] : [];

  const confidenceDistribution = React.useMemo(() => {
    if (!answers || answers.length === 0) return [];
    
    const ranges = [
      { range: '0-20%', min: 0, max: 0.2, count: 0 },
      { range: '20-40%', min: 0.2, max: 0.4, count: 0 },
      { range: '40-60%', min: 0.4, max: 0.6, count: 0 },
      { range: '60-80%', min: 0.6, max: 0.8, count: 0 },
      { range: '80-100%', min: 0.8, max: 1.0, count: 0 },
    ];

    answers.forEach((a: any) => {
      const score = a.confidenceScore || 0;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    return ranges.map(r => ({ name: r.range, count: r.count }));
  }, [answers]);

  const progressData = metrics ? [
    { name: 'Question Coverage', value: metrics.completionRate || 0, fill: '#000000' },
    { name: 'Citation Coverage', value: metrics.citationRate || 0, fill: '#374151' },
    { name: 'Generation Quality', value: metrics.generationRate || 0, fill: '#6b7280' },
  ] : [
    { name: 'Question Coverage', value: 0, fill: '#000000' },
    { name: 'Citation Coverage', value: 0, fill: '#374151' },
    { name: 'Generation Quality', value: 0, fill: '#6b7280' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-black rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-black">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gray-900" />
                  Advanced analytics and performance metrics
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-12 gap-6">
            {/* Questionnaire Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-3"
            >
              <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-gray-900 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-6 h-6 text-black" />
                  <h2 className="text-xl font-bold text-gray-900">Questionnaires</h2>
                </div>
                <div className="space-y-3">
                  {questionnaires.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">No questionnaires available</p>
                  ) : (
                    questionnaires.map((q: any, index: number) => (
                      <motion.button
                        key={q._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedQuestionnaireId(q._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-4 rounded-2xl transition-all ${
                          selectedQuestionnaireId === q._id
                            ? 'bg-black text-white shadow-2xl'
                            : 'bg-white hover:shadow-md border-2 border-gray-900'
                        }`}
                      >
                        <div className={`font-semibold text-sm truncate mb-2 ${
                          selectedQuestionnaireId === q._id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {q.name || q.originalName}
                        </div>
                        <div className={`text-xs flex items-center gap-2 ${
                          selectedQuestionnaireId === q._id ? 'text-white/90' : 'text-gray-500'
                        }`}>
                          <Zap className="w-3 h-3" />
                          {q.answeredCount || 0} answers
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Evaluation Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="col-span-9"
            >
              {!selectedQuestionnaireId ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-900"
                >
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50"></div>
                    <BarChart3 className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Select a Questionnaire
                  </h2>
                  <p className="text-gray-500">
                    Choose a questionnaire from the left to view evaluation metrics
                  </p>
                </motion.div>
              ) : !metrics ? (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-3xl shadow-xl p-16 text-center border-2 border-gray-900"
                >
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gray-100 rounded-full opacity-50"></div>
                    <FileText className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    No Data Available
                  </h2>
                  <p className="text-gray-500">
                    Generate answers first to see evaluation metrics
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Key Metrics Cards with Enhanced Animation */}
                  <div className="grid grid-cols-4 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl shadow-2xl p-6 text-white border-2 border-gray-800 overflow-hidden group"
                    >
                      {/* Animated background effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <motion.div 
                            className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-all"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Target className="w-7 h-7" />
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="text-5xl font-black tracking-tight"
                          >
                            {(metrics.avgConfidence * 100).toFixed(0)}%
                          </motion.span>
                        </div>
                        <p className="text-sm font-bold opacity-90 mb-1">Avg Confidence</p>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs opacity-60 font-medium">Quality Score</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-6 text-white border-2 border-gray-700 overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <motion.div 
                            className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-all"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <CheckCircle className="w-7 h-7" />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className="text-right"
                          >
                            <div className="text-5xl font-black tracking-tight">
                              {metrics.answeredQuestions}
                            </div>
                            <div className="text-sm opacity-70 font-semibold">
                              / {metrics.totalQuestions}
                            </div>
                          </motion.div>
                        </div>
                        <p className="text-sm font-bold opacity-90 mb-1">Answered Questions</p>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs opacity-60 font-medium">Out of Total</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 rounded-3xl shadow-2xl p-6 text-white border-2 border-gray-600 overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1 }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <motion.div 
                            className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-all"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Award className="w-7 h-7" />
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            className="text-5xl font-black tracking-tight"
                          >
                            {metrics.total}
                          </motion.span>
                        </div>
                        <p className="text-sm font-bold opacity-90 mb-1">Total Answers</p>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs opacity-60 font-medium">AI Generated</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="relative bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 rounded-3xl shadow-2xl p-6 text-white border-2 border-gray-500 overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                      />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                          <motion.div 
                            className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm group-hover:bg-white/20 transition-all"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Zap className="w-7 h-7" />
                          </motion.div>
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            className="text-5xl font-black tracking-tight"
                          >
                            {metrics.withCitations}
                          </motion.span>
                        </div>
                        <p className="text-sm font-bold opacity-90 mb-1">With Citations</p>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs opacity-60 font-medium">Source Referenced</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Charts Grid with Enhanced Styling */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Status Distribution - Enhanced Donut Chart */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border-2 border-gray-900 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 bg-black rounded-xl"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.8 }}
                        >
                          <PieIcon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Question Progress
                          </h3>
                          <p className="text-xs text-gray-500">Answered vs Total Questions</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <defs>
                            {COLORS.map((color, index) => (
                              <radialGradient key={index} id={`gradient-${index}`}>
                                <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                                <stop offset="100%" stopColor={color} stopOpacity={1}/>
                              </radialGradient>
                            ))}
                          </defs>
                          <Pie
                            data={questionProgressData}
                            cx="50%"
                            cy="50%"
                            label={false}
                            innerRadius={0}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {questionProgressData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill}
                                stroke="#fff"
                                strokeWidth={3}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#000', 
                              border: '2px solid #374151',
                              borderRadius: '12px',
                              color: '#fff',
                              fontWeight: 'bold',
                              padding: '10px'
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value: any, name: any) => [`${value} questions`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </motion.div>

                    {/* Confidence Distribution - Enhanced Bar Chart */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border-2 border-gray-900 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <motion.div 
                          className="p-3 bg-black rounded-xl"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.8 }}
                        >
                          <BarChart3 className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Confidence Distribution
                          </h3>
                          <p className="text-xs text-gray-500">Answer quality breakdown</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={confidenceDistribution}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#000000" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#4b5563" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name" 
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                            stroke="#374151"
                          />
                          <YAxis 
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                            stroke="#374151"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#000', 
                              border: '2px solid #374151',
                              borderRadius: '12px',
                              color: '#fff',
                              fontWeight: 'bold',
                              padding: '10px'
                            }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`${value} answers`, 'Count']}
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                          />
                          <Bar 
                            dataKey="count" 
                            fill="url(#barGradient)" 
                            radius={[12, 12, 0, 0]}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          /> 
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  </div>

                  {/* Progress Bars - Enhanced with Gradient Effects */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border-2 border-gray-900"
                  >
                    <div className="flex items-center gap-3 mb-8">
                      <motion.div 
                        className="p-3 bg-black rounded-xl"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                      >
                        <Activity className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Quality Metrics
                        </h3>
                        <p className="text-xs text-gray-500">Performance indicators</p>
                      </div>
                    </div>
                    <div className="space-y-8">
                      {progressData.map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + idx * 0.1 }}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></div>
                              <span className="text-sm font-bold text-gray-900">{item.name}</span>
                            </div>
                            <motion.span 
                              className="text-xl font-black px-4 py-2 rounded-xl shadow-lg"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.9 + idx * 0.1, type: 'spring' }}
                              style={{ 
                                color: '#fff',
                                backgroundColor: item.fill,
                                border: `2px solid ${item.fill}`,
                              }}
                            >
                              {item.value.toFixed(1)}%
                            </motion.span>
                          </div>
                          <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner border-2 border-gray-900">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.value}%` }}
                              transition={{ duration: 1.5, delay: 0.9 + idx * 0.1, ease: "easeOut" }}
                              className="h-full rounded-full relative overflow-hidden"
                              style={{ 
                                background: `linear-gradient(90deg, ${item.fill} 0%, ${item.fill}dd 100%)`
                              }}
                            >
                              <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                              />
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Radial Progress Chart - Enhanced */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 border-2 border-gray-900"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div 
                        className="p-3 bg-black rounded-xl"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.8 }}
                      >
                        <TrendingUp className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Overall Progress
                        </h3>
                        <p className="text-xs text-gray-500">Comprehensive metrics view</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                      <RadialBarChart 
                        cx="50%" 
                        cy="50%" 
                        innerRadius="20%" 
                        outerRadius="90%" 
                        barSize={18} 
                        data={progressData}
                      >
                        <defs>
                          {progressData.map((item, index) => (
                            <linearGradient key={index} id={`radial-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={item.fill} stopOpacity={1}/>
                              <stop offset="100%" stopColor={item.fill} stopOpacity={0.7}/>
                            </linearGradient>
                          ))}
                        </defs>
                        <RadialBar
                          minAngle={15}
                          background={{ fill: '#e5e7eb' }}
                          clockWise
                          dataKey="value"
                          animationDuration={1800}
                          animationEasing="ease-out"
                          cornerRadius={12}
                        />
                        <Legend 
                          iconSize={14} 
                          layout="horizontal" 
                          verticalAlign="bottom"
                          wrapperStyle={{ 
                            paddingTop: '20px',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#000', 
                            border: '2px solid #374151',
                            borderRadius: '12px',
                            color: '#fff',
                            fontWeight: 'bold',
                            padding: '10px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                          }}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: '#fff' }}
                          formatter={(value: any, name: any) => [`${Number(value).toFixed(1)}%`, name]}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

