import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Target, Award, FileText, CheckCircle, XCircle, AlertCircle, Zap, Activity, PieChart as PieIcon } from 'lucide-react';
import { questionnairesApi, evaluationsApi, answersApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, Area, AreaChart } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

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

  // Fetch answers for analytics
  const { data: answersData } = useQuery({
    queryKey: ['answers', selectedQuestionnaireId],
    queryFn: async () => {
      if (!selectedQuestionnaireId) return null;
      const result = await answersApi.getByQuestionnaire(selectedQuestionnaireId);
      return result.data;
    },
    enabled: !!selectedQuestionnaireId,
  });

  const questionnaires = questionnairesData || [];
  const answers = answersData || [];

  // Calculate metrics from answers
  const metrics = React.useMemo(() => {
    if (!answers || answers.length === 0) return null;

    const total = answers.length;
    const avgConfidence = answers.reduce((sum: number, a: any) => sum + (a.confidenceScore || 0), 0) / total;
    
    const statusCounts = answers.reduce((acc: any, a: any) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});

    const withCitations = answers.filter((a: any) => a.citations && a.citations.length > 0).length;
    const edited = answers.filter((a: any) => a.isEdited).length;
    const reviewed = answers.filter((a: any) => a.status === 'reviewed' || a.status === 'approved').length;

    return {
      total,
      avgConfidence,
      statusCounts,
      withCitations,
      edited,
      reviewed,
      completionRate: (reviewed / total) * 100,
      citationRate: (withCitations / total) * 100,
      editRate: (edited / total) * 100
    };
  }, [answers]);

  // Prepare chart data
  const statusData = metrics ? Object.entries(metrics.statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

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
    { name: 'Completion', value: metrics.completionRate, fill: '#10b981' },
    { name: 'With Citations', value: metrics.citationRate, fill: '#3b82f6' },
    { name: 'Edited', value: metrics.editRate, fill: '#f59e0b' },
  ] : [];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Evaluation Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Advanced analytics and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Questionnaire Selector */}
          <div className="col-span-3">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Questionnaires</h2>
              <div className="space-y-2">
                {questionnaires.length === 0 ? (
                  <p className="text-sm text-gray-500">No questionnaires available</p>
                ) : (
                  questionnaires.map((q: any) => (
                    <button
                      key={q._id}
                      onClick={() => setSelectedQuestionnaireId(q._id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedQuestionnaireId === q._id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {q.name || q.originalName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {q.answeredCount || 0} answers
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Evaluation Results */}
          <div className="col-span-9">
            {!selectedQuestionnaireId ? (
              <div className="card p-12 text-center">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Select a Questionnaire
                </h2>
                <p className="text-gray-500">
                  Choose a questionnaire from the left to view evaluation metrics
                </p>
              </div>
            ) : !metrics ? (
              <div className="card p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  No Data Available
                </h2>
                <p className="text-gray-500">
                  Generate answers first to see evaluation metrics
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-8 h-8" />
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                        className="text-3xl font-bold"
                      >
                        {(metrics.avgConfidence * 100).toFixed(0)}%
                      </motion.span>
                    </div>
                    <p className="text-sm font-medium opacity-90">Avg Confidence</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-6 bg-gradient-to-br from-green-500 to-green-600 text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-8 h-8" />
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        className="text-3xl font-bold"
                      >
                        {metrics.reviewed}
                      </motion.span>
                    </div>
                    <p className="text-sm font-medium opacity-90">Reviewed</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-8 h-8" />
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="text-3xl font-bold"
                      >
                        {metrics.total}
                      </motion.span>
                    </div>
                    <p className="text-sm font-medium opacity-90">Total Answers</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-8 h-8" />
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring' }}
                        className="text-3xl font-bold"
                      >
                        {metrics.withCitations}
                      </motion.span>
                    </div>
                    <p className="text-sm font-medium opacity-90">With Citations</p>
                  </motion.div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Status Distribution */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="card p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-blue-500" />
                      Answer Status Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Confidence Distribution */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="card p-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-500" />
                      Confidence Score Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={confidenceDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#10b981" animationDuration={1000} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Progress Bars */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-500" />
                    Quality Metrics
                  </h3>
                  <div className="space-y-6">
                    {progressData.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          <span className="text-sm font-bold" style={{ color: item.fill }}>
                            {item.value.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: 0.8 + idx * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Radial Progress Chart */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="card p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Overall Progress
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="10%" 
                      outerRadius="100%" 
                      barSize={15} 
                      data={progressData}
                    >
                      <RadialBar
                        minAngle={15}
                        background
                        clockWise
                        dataKey="value"
                        animationDuration={1500}
                      />
                      <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

