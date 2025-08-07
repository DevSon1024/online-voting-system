import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center px-4 max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="relative">
          {/* Background decoration */}
          {/* <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 gradient-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/3 w-72 h-72 gradient-success rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
          </div> */}
          
          {/* Main content */}
          <div className="glass-effect rounded-3xl p-12 shadow-large">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-2xl mb-6 shadow-medium">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-tight mb-6">
                <span className="block">Secure,</span>
                <span className="block text-gradient">Transparent,</span>
                <span className="block">& Reliable</span>
                <span className="block text-2xl md:text-3xl font-semibold text-gray-600 mt-4">Online Voting</span>
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-12 leading-relaxed">
              Cast your vote from anywhere with confidence. Our blockchain-powered platform ensures the 
              <span className="font-semibold text-indigo-600"> integrity</span> and 
              <span className="font-semibold text-indigo-600"> privacy</span> of every ballot.
            </p>
            
            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/register" 
                className="group gradient-primary text-white font-bold py-4 px-10 rounded-2xl hover:shadow-large hover:scale-105 transition-all duration-300 text-lg"
              >
                <span className="flex items-center gap-3">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              
              <Link 
                to="/login" 
                className="group bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-4 px-10 rounded-2xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-medium hover:scale-105 transition-all duration-300 text-lg"
              >
                <span className="flex items-center gap-3">
                  Sign In
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </span>
              </Link>
            </div>
            
            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 gradient-success rounded-xl mb-4 shadow-soft">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Secure</h3>
                <p className="text-gray-600">End-to-end encryption and blockchain technology</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-xl mb-4 shadow-soft">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent</h3>
                <p className="text-gray-600">Real-time results and audit trails</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 gradient-secondary rounded-xl mb-4 shadow-soft">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Fast</h3>
                <p className="text-gray-600">Instant voting and immediate results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}