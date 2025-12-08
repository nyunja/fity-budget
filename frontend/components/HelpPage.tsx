
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle, Mail, FileText, ExternalLink } from 'lucide-react';

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do I connect my bank account?",
      answer: "Go to the Wallet page, click 'Add New Wallet', select 'Bank' as the type, and follow the instructions to securely link your account via our partner API."
    },
    {
      question: "Can I export my transaction data?",
      answer: "Yes! Navigate to the Transactions page and click the 'Export' button in the top right corner. You can choose between CSV and PDF formats."
    },
    {
      question: "How does the AI insight feature work?",
      answer: "Our AI analyzes your spending patterns, budget adherence, and savings goals to provide personalized tips. Click the 'Ask AI' button in the header to generate fresh insights."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely. We use bank-grade encryption for all data storage and transmission. We never sell your personal data to third parties. You can read more in our Privacy Policy."
    },
    {
      question: "How do I reset my password?",
      answer: "Go to Settings > Security & Privacy, and click on 'Change Password'. If you cannot log in, use the 'Forgot Password' link on the login screen."
    },
    {
      question: "Can I use FityBudget in Dark Mode?",
      answer: "Yes, you can toggle between Light and Dark mode using the sun/moon switch located at the bottom of the sidebar or in Settings > App Preferences."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How can we help you?</h1>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for answers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-indigo-500 shadow-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-center">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Live Chat</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Chat with our support team in real-time.</p>
          <button className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">Start Chat</button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-center">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email Support</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Get a response within 24 hours.</p>
          <button className="text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline">support@FityBudget.com</button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all text-center">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={24} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">Documentation</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Detailed guides and API references.</p>
          <button className="text-green-600 dark:text-green-400 font-bold text-sm hover:underline flex items-center justify-center gap-1">
            View Docs <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index} 
                className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center text-left py-2 focus:outline-none group"
                >
                  <span className={`font-medium transition-colors ${openFaq === index ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                    {faq.question}
                  </span>
                  <div className={`transition-transform duration-200 text-gray-400 ${openFaq === index ? 'rotate-180 text-indigo-600' : ''}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed pr-8">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No results found for "{searchQuery}"</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default HelpPage;
