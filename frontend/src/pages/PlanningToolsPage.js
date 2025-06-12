import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  DollarSign,
  CheckCircle,
  Calendar,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { Header, Footer } from '../components';

const PlanningToolsPage = () => {
  const tools = [
    {
      title: 'Budget Tracker',
      description: 'Keep track of your wedding expenses and stay within budget with smart category management and cost tracking.',
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      users: '15,000+ couples',
      features: [
        'Expense categorization',
        'Budget vs actual tracking',
        'Vendor cost comparison',
        'Payment timeline'
      ],
      link: '/planning/budget'
    },
    {
      title: 'Wedding Checklist',
      description: 'Never miss a detail with our comprehensive timeline-based checklist covering every aspect of wedding planning.',
      icon: CheckCircle,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      users: '22,000+ couples',
      features: [
        '12-month timeline',
        'Priority task sorting',
        'Progress tracking',
        'Deadline reminders'
      ],
      link: '/planning/checklist'
    },
    {
      title: 'Timeline Creator',
      description: 'Plan your perfect wedding day with minute-by-minute scheduling and vendor coordination.',
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      users: '18,000+ couples',
      features: [
        'Day-of timeline',
        'Vendor scheduling',
        'Buffer time management',
        'Shareable schedules'
      ],
      link: '/planning/timeline'
    },
    {
      title: 'Guest List Manager',
      description: 'Organize your guest list, track RSVPs, manage dietary requirements, and plan seating arrangements.',
      icon: Users,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      users: '20,000+ couples',
      features: [
        'RSVP tracking',
        'Dietary management',
        'Table assignments',
        'Plus-one handling'
      ],
      link: '/planning/guests'
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Stay Organized',
      description: 'Keep all your wedding planning in one place with interconnected tools that work together.'
    },
    {
      icon: TrendingUp,
      title: 'Save Money',
      description: 'Budget tracking and vendor comparison features help couples save an average of $2,500.'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Pre-built templates and automated reminders reduce planning time by 40%.'
    },
    {
      icon: Sparkles,
      title: 'Reduce Stress',
      description: 'Clear timelines and progress tracking give you confidence every step of the way.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Free Wedding Planning Tools
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Everything you need to plan your perfect wedding, all in one place. 
              Trusted by over 50,000 Australian couples.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>100% Free</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>Instant Access</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${tool.bgColor} ${tool.borderColor} border-2 rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className={`${tool.color} w-16 h-16 rounded-xl flex items-center justify-center`}>
                  <tool.icon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Used by {tool.users}</p>
                </div>
              </div>
              
              <p className={`${tool.textColor} mb-6 text-lg leading-relaxed`}>
                {tool.description}
              </p>
              
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link
                to={tool.link}
                className={`inline-flex items-center justify-center w-full ${tool.color} text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-medium`}
              >
                <span>Start Using {tool.title}</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Enosi Planning Tools?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our tools are designed specifically for Australian couples, with features that matter most for your wedding planning journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-rose-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Plan Your Perfect Wedding?
            </h2>
            <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
              Join thousands of couples who have successfully planned their dream wedding using our free tools.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/signup"
                className="bg-white text-rose-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Get Started Free
              </Link>
              <Link
                to="/search"
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-rose-600 transition-colors font-medium"
              >
                Browse Vendors
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlanningToolsPage;