import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Music, Download, Sparkles, Star, Users, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Subscription: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showConfetti, setShowConfetti] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out AI remixes',
      features: [
        '10 AI remixes per month',
        'Standard quality (128kbps)',
        'Basic genre styles',
        'Community support',
        'Watermarked downloads'
      ],
      limitations: [
        'Limited to 3-minute tracks',
        'No commercial use',
        'Basic AI models only'
      ],
      color: 'from-gray-500 to-gray-600',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 19.99, yearly: 199.99 },
      description: 'For serious music creators',
      features: [
        'Unlimited AI remixes',
        'High quality (320kbps)',
        'All genre styles & effects',
        'Priority processing',
        'No watermarks',
        'Commercial license',
        'Advanced AI models',
        'Batch processing',
        'Custom BPM ranges',
        'Email support'
      ],
      limitations: [],
      color: 'from-purple-500 to-purple-600',
      popular: true
    },
    {
      name: 'Studio',
      price: { monthly: 49.99, yearly: 499.99 },
      description: 'Professional studio features',
      features: [
        'Everything in Pro',
        'Ultra quality (FLAC)',
        'Exclusive AI models',
        'Multi-track remixing',
        'Stem separation',
        'API access',
        'White-label licensing',
        'Dedicated support',
        'Custom integrations',
        'Team collaboration'
      ],
      limitations: [],
      color: 'from-yellow-500 to-yellow-600',
      popular: false
    }
  ];

  const handleSubscribe = (planName: string, price: number) => {
    if (price === 0) {
      toast.success('You\'re already on the Free plan!');
      return;
    }
    
    toast.loading('Redirecting to secure checkout...', { duration: 2000 });
    setTimeout(() => {
      toast.success(`Subscribed to ${planName} plan! Welcome to premium features! 🎉`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }, 2000);
  };

  const yearlyDiscount = (monthly: number, yearly: number) => {
    if (monthly === 0) return 0;
    return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 relative">
      {/* Animated gradient background */}
      <motion.div
        className="fixed inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'linear-gradient(120deg, #181028 0%, #2e1a47 50%, #0ff 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientMove 8s ease-in-out infinite'
        }}
      />
      {/* Particle layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-cyan-400 opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 6 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
      {/* Confetti/Sparkles */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                top: `${Math.random() * 10}%`,
                left: `${Math.random() * 100}%`,
                background: `hsl(${Math.random()*360},90%,60%)`,
                opacity: 0.8
              }}
              animate={{
                y: [0, 800],
                opacity: [0.8, 0.2]
              }}
              transition={{
                duration: 2.2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 1.5
              }}
            />
          ))}
          <span className="text-4xl font-bold text-yellow-400 animate-bounce ml-4">Congratulations!</span>
        </div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Crown className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Choose Your Plan
          </h1>
        </div>
        <p className="text-dark-300 text-xl max-w-2xl mx-auto">
          Unlock the full potential of AI music creation with our professional plans
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="bg-dark-800 rounded-xl p-2 border border-dark-700">
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ backgroundColor: '#a084fa', color: '#fff' }}
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Monthly
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ backgroundColor: '#a084fa', color: '#fff' }}
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } }
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05, boxShadow: '0 0 32px #a084fa88', borderColor: '#a084fa' }}
            className={`relative bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-8 border transition-all duration-300 ${
              plan.popular 
                ? 'border-purple-500 shadow-xl shadow-purple-500/20' 
                : 'border-dark-700 hover:border-purple-500/50'
            }`}
          >
            {plan.popular && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-1"
              >
                <Star className="w-4 h-4" />
                <span>Most Popular</span>
              </motion.div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {plan.name === 'Free' && <Users className="w-8 h-8 text-white" />}
                {plan.name === 'Pro' && <Crown className="w-8 h-8 text-white" />}
                {plan.name === 'Studio' && <Shield className="w-8 h-8 text-white" />}
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-dark-400 mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">
                  ${plan.price[billingCycle]}
                </span>
                {plan.price[billingCycle] > 0 && (
                  <span className="text-dark-400 ml-2">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>

              {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                <div className="text-green-400 text-sm font-medium">
                  Save ${(plan.price.monthly * 12 - plan.price.yearly).toFixed(2)} 
                  ({yearlyDiscount(plan.price.monthly, plan.price.yearly)}% off)
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <motion.div
                  key={featureIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + featureIndex * 0.05 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-dark-300">{feature}</span>
                </motion.div>
              ))}

              {plan.limitations.map((limitation, limitIndex) => (
                <motion.div
                  key={limitIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (plan.features.length + limitIndex) * 0.05 }}
                  className="flex items-center space-x-3 opacity-60"
                >
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs">×</span>
                  </div>
                  <span className="text-dark-400 text-sm">{limitation}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSubscribe(plan.name, plan.price[billingCycle])}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-purple-500/25'
                  : plan.price[billingCycle] === 0
                  ? 'bg-dark-700 text-dark-300 cursor-default'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-500 hover:to-gray-600'
              }`}
              disabled={plan.price[billingCycle] === 0}
            >
              {plan.price[billingCycle] === 0 ? 'Current Plan' : `Get ${plan.name}`}
            </motion.button>
          </motion.div>
        ))}
      </motion.div>

      {/* Features Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-8 border border-dark-700"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Choose AI Music Web?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
            <p className="text-dark-400">Generate professional remixes in under 30 seconds with our advanced AI models.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Studio Quality</h3>
            <p className="text-dark-400">Professional-grade audio processing with support for all major formats and high-fidelity output.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Unlimited Creativity</h3>
            <p className="text-dark-400">Explore endless possibilities with our vast library of genres, effects, and AI-powered customization.</p>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-br from-dark-800 to-dark-850 rounded-xl p-8 border border-dark-700"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
            <p className="text-dark-400">Yes, you can cancel your subscription at any time. You'll continue to have access to premium features until the end of your billing period.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
            <p className="text-dark-400">We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Can I use the remixes commercially?</h3>
            <p className="text-dark-400">Pro and Studio plans include commercial licensing. Free plan remixes are for personal use only and include watermarks.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscription;