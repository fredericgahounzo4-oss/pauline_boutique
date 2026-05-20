import { Button } from './ui/Button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
    return (
        <section className="relative h-[80vh] bg-background-alt overflow-hidden flex items-center">
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#E8E0D5] rounded-l-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-full bg-[#D4AF37] rounded-r-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 md:p-16 grid md:grid-cols-2 gap-12 items-center border border-white/50 relative overflow-hidden transform hover:scale-[1.005] transition-transform duration-700">
                    {/* Text Content */}
                    <div className="space-y-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold tracking-wider uppercase text-xs border border-primary/20">
                            Nouvelle Collection ✨
                        </span>
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 leading-tight">
                            Sacs à Main <br />
                            <span className="text-primary">Fourrure Luxe</span>
                        </h1>
                        <p className="text-gray-600 text-lg max-w-md leading-relaxed">
                            Découvrez notre nouvelle collection de sacs à main élégants, avec une touche de fourrure pour un style chic et tendance.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <Link to="/hero-product">
                                <Button className="h-14 px-8 rounded-full text-lg shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
                                    Acheter maintenant <ArrowRight size={20} />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Image/Visual Placeholder */}
                    <div className="hidden md:block relative">
                        <img
                            src="/images/hero/sac7.jpeg"
                            alt="sacs à main en fourrure"
                            className="w-full h-auto object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

