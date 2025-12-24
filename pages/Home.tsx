import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, ArrowRight, Baby, Dna } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-gradient-to-br from-rose-50 via-white to-slate-100 p-4">
      <div className="max-w-6xl w-full text-center space-y-16">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 tracking-tight">
            Surrogacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Connect</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A modern, compassionate directory connecting Intended Parents with Surrogates, Egg Donors, and Sperm Donors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
          
          {/* PARENTS */}
          <Link to="/directory" className="col-span-1 md:col-span-2 lg:col-span-1 group flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-rose-200 hover:shadow-xl transition-all">
            <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 text-rose-600"><Users /></div>
            <h2 className="text-xl font-bold text-slate-900">For Parents</h2>
            <p className="text-slate-500 text-sm mt-2 mb-4">Find your perfect match.</p>
            <span className="text-rose-600 font-bold text-sm flex items-center mt-auto">Browse Directory <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>

          {/* SURROGATE */}
          <Link to="/apply?type=Surrogate" className="group flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-pink-200 hover:shadow-xl transition-all">
            <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center mb-4 text-pink-600"><Heart /></div>
            <h2 className="text-xl font-bold text-slate-900">Surrogate</h2>
            <p className="text-slate-500 text-sm mt-2 mb-4">Carry a child, change a life.</p>
            <span className="text-pink-600 font-bold text-sm flex items-center mt-auto">Apply Now <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>

          {/* EGG DONOR */}
          <Link to="/apply?type=Egg Donor" className="group flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-purple-200 hover:shadow-xl transition-all">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 text-purple-600"><Baby /></div>
            <h2 className="text-xl font-bold text-slate-900">Egg Donor</h2>
            <p className="text-slate-500 text-sm mt-2 mb-4">Beauty, brains, and kindness.</p>
            <span className="text-purple-600 font-bold text-sm flex items-center mt-auto">Apply Now <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>

          {/* SPERM DONOR */}
          <Link to="/apply?type=Sperm Donor" className="group flex flex-col items-center p-8 bg-white rounded-3xl shadow-sm border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600"><Dna /></div>
            <h2 className="text-xl font-bold text-slate-900">Sperm Donor</h2>
            <p className="text-slate-500 text-sm mt-2 mb-4">Help build a family legacy.</p>
            <span className="text-blue-600 font-bold text-sm flex items-center mt-auto">Apply Now <ArrowRight className="w-4 h-4 ml-1" /></span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Home;